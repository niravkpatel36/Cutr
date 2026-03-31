package main

import (
	"database/sql"
	"fmt"
	"github.com/oschwald/geoip2-golang"
	"log"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"
)

type shortURL struct {
	ShortURL    string    `json:"shortURL"`
	Url         string    `json:"url"`
	DateCreated time.Time `json:"dateCreated"`
	Pin         string    `json:"pin"`
}

type shortURLResponse struct {
	ShortURL string `json:"shortURL"`
	LongURL  string `json:"url"`
}

type newURLRequest struct {
	Url       string `json:"url"`
	Custom    bool   `json:"custom"`
	CustomKey string `json:"customKey"`
}

type searchURLRequest struct {
	ShortURL   string    `json:"url"`
	AccessTime time.Time `json:"accessTime"`
	UserAgent  string    `json:"userAgent"`
	IpAddress  string    `json:"ipAddress"`
	Location   string    `json:"location"`
	Country    string    `json:"country"`
}

type analyticsResponse struct {
	UrlDetails shortURL           `json:"urlDetails"`
	Analytics  []searchURLRequest `json:"analytics"`
}

func initDB() *sql.DB {
	connStr := fmt.Sprintf(
		"user=%s dbname=%s password=%s sslmode=disable host=%s port=%s",
		os.Getenv("USERNAME"),
		os.Getenv("DB_NAME"),
		os.Getenv("PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
	)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	return db
}

func createURL(url string, db *sql.DB, custom bool, customKey string) (shortURL, error) {
	if !custom {
		return shortURL{
			ShortURL:    generateKey(db),
			Url:         url,
			DateCreated: time.Now().UTC(),
			Pin:         generatePin(),
		}, nil
	} else {
		customKey, err := generateCustomKey(db, customKey)
		if err != nil {
			return shortURL{}, err
		}
		return shortURL{
			ShortURL:    customKey,
			Url:         url,
			DateCreated: time.Now().UTC(),
			Pin:         generatePin(),
		}, nil

	}
}

func generateCustomKey(db *sql.DB, customKey string) (string, error) {
	stmt, err := db.Prepare("SELECT count(name) FROM urls where name = $1")
	if err != nil {
		log.Fatal(err)
	}
	row := stmt.QueryRow(customKey)
	var count int
	err = row.Scan(&count)
	if err != nil {
		log.Fatal(err)
	}
	if count == 0 {
		return customKey, nil
	} else {
		return "", fmt.Errorf("custom key already exists")
	}
}

func generateKey(db *sql.DB) string {
	prohibited := map[string]bool{"new": true, "delete": true}
	chars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
	key := ""

	for {
		for i := 0; i < 6; i++ {
			key += string(chars[rand.Intn(len(chars))])
		}
		if prohibited[key] {
			continue
		}
		stmt, err := db.Prepare("SELECT count(name) FROM urls where name = $1")
		if err != nil {
			log.Fatal(err)
		}
		row := stmt.QueryRow(key)
		var count int
		err = row.Scan(&count)
		if err != nil {
			log.Fatal(err)
		}
		if count == 0 {
			return key
		}
	}
}

func generatePin() string {
	chars := "1234567890"
	pin := ""
	for i := 0; i < 6; i++ {
		pin += string(chars[rand.Intn(len(chars))])
	}
	return pin
}

func checkURLValid(givenURL string) (bool, error) {
	correctRegex := "[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)"

	val, err := regexp.MatchString(correctRegex, givenURL)
	if err != nil {
		return false, fmt.Errorf("error while checking URL validity: %v", err)
	}
	if !val {
		return false, fmt.Errorf("invalid URL")
	}

	// Parse URL to check if it's valid
	_, err = url.ParseRequestURI(givenURL)
	if err != nil {
		return false, fmt.Errorf("invalid URL: %v", err)
	}
	return true, nil
}

func enableCors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Define allowed origins based on environment
		var allowedOrigins []string
		allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
		if allowedOrigin != "" {
			allowedOrigins = strings.Split(allowedOrigin, ",")
		} else {
			switch os.Getenv("APP_ENV") {
			case "development":
				allowedOrigins = []string{"http://localhost:5173"}
			default:
				allowedOrigins = []string{"http://localhost:5173"}
			}
		}

		// Get the request's origin
		origin := r.Header.Get("Origin")

		// Check if the origin is in the allowed origins list
		originAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				originAllowed = true
				break
			}
		}

		if originAllowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			// If CORS origin doesn't match allowed origins, reject the request
			http.Error(w, "CORS policy: Origin not allowed", http.StatusForbidden)
			return
		}

		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true") // Support credentials if needed

		// Handle preflight OPTIONS requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// For other requests, proceed to the actual handler
		next(w, r)
	}
}

func getIP(r *http.Request) (string, string, string, error) {
	ips := r.Header.Get("X-Forwarded-For")
	splitIps := strings.Split(ips, ",")

	var ip string
	if len(splitIps) > 0 && ips != "" {
		// Get the last IP in the list since ELB prepends other user-defined IPs, meaning the last one is the actual client IP.
		ip = strings.TrimSpace(splitIps[len(splitIps)-1])
	} else {
		ipHost, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			return "No IP", "Location not found", "Country not found", err
		}
		ip = ipHost
	}

	netIP := net.ParseIP(ip)
	if netIP == nil {
		return "", "", "", fmt.Errorf("invalid IP address: %s", ip)
	}

	if netIP.IsLoopback() {
		return "127.0.0.1", "Loopback", "Home", nil
	}

	city, country, err := useGeoIP(ip)
	if err != nil {
		return ip, "", "", err
	}
	return ip, city, country, nil
}

func useGeoIP(ip string) (string, string, error) {
	path := ""
	if os.Getenv("APP_ENV") == "development_local" {
		path = "GeoLite2-City.mmdb"
	} else {
		path = "/usr/local/share/GeoIP/GeoLite2-City.mmdb"
	}

	db, err := geoip2.Open(path)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Successfully opened GeoIP database")
	}
	if err != nil {
		fmt.Println(err)
		return "", "", err
	}
	defer func(db *geoip2.Reader) {
		err := db.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(db)

	city, err := db.City(net.ParseIP(ip))
	if err != nil {
		fmt.Println(err)
		return "", "", err
	}

	fmt.Println(city.City.Names["en"], city.Country.Names["en"])

	return city.City.Names["en"], city.Country.Names["en"], nil
}
