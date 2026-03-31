package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func handleURL(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.URL.Path == "/new" {
		handleNewURL(w, r, db)
		return
	} else if r.URL.Path == "/delete" {
		handleDeleteURL(w, r, db)
		return
	} else if r.URL.Path == "/ping" {
		http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, err := w.Write([]byte("pong"))
			if err != nil {
				http.Error(w, "Error writing to response", http.StatusInternalServerError)
			}
		})
	} else if r.URL.Path == "/analytics" {
		handleAnalytics(w, r, db)
		return
	} else {
		searchAndRedirect(w, r, db)
		return
	}

}

func addToAnalytics(res *searchURLRequest, db *sql.DB, r *http.Request) {
	stmt, err := db.Prepare("INSERT INTO analytics (name, access_time, user_agent, ip_address, location, country) VALUES ($1, $2, $3, $4, $5, $6)")
	if err != nil {
		log.Fatal(err)
	}
	go func() {
		ip, city, country, err := getIP(r)
		if err != nil {
			log.Fatal(err)
		}
		_, err = stmt.Exec(res.ShortURL, res.AccessTime, res.UserAgent, ip, city, country)
		if err != nil {
			log.Fatal(err)
		}
	}()
}

func searchAndRedirect(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		fmt.Println("Method not allowed")
		return
	}
	name := r.URL.Path[1:]

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	var res searchURLRequest
	err = json.Unmarshal(reqBody, &res)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		fmt.Println(err)
		return
	}

	stmt, err := db.Prepare("SELECT name, redirect_url FROM urls WHERE name = $1")
	if err != nil {
		http.Error(w, "An error occurred during redirection.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	var url shortURLResponse
	err = stmt.QueryRow(name).Scan(&url.ShortURL, &url.LongURL)
	if err != nil {
		http.Error(w, "URL not found", http.StatusNotFound)
		fmt.Println(err)
	}
	response, err := json.Marshal(url)
	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(response)
	if err != nil {
		log.Fatal(err)
	}

	addToAnalytics(&res, db, r)

}

func handleAnalytics(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		fmt.Println("Method not allowed")
		return
	}

	name := r.URL.Query().Get("short_url")
	//get the pin from post request
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	var req map[string]string
	err = json.Unmarshal(reqBody, &req)
	if req["pin"] == "" {
		http.Error(w, "Pin is required", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	pin := req["pin"]

	// Verify the PIN
	stmt, err := db.Prepare("SELECT pin FROM urls WHERE name = $1")
	if err != nil {
		http.Error(w, "Error locating analytics.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	var storedPin string
	err = stmt.QueryRow(name).Scan(&storedPin)
	if err != nil {
		http.Error(w, "URL not found", http.StatusNotFound)
		fmt.Println(err)
		return
	}
	if storedPin != pin {
		http.Error(w, "Invalid PIN", http.StatusUnauthorized)
		fmt.Println(err)
		return
	}

	stmt, err = db.Prepare("SELECT * FROM analytics WHERE name = $1")
	if err != nil {
		http.Error(w, "Error locating analytics.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	rows, err := stmt.Query(name)
	if err != nil {
		http.Error(w, "Error locating analytics.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	var searchRes []searchURLRequest
	for rows.Next() {
		var url searchURLRequest
		err = rows.Scan(&url.ShortURL, &url.AccessTime, &url.UserAgent, &url.IpAddress, &url.Location, &url.Country)
		if err != nil {
			http.Error(w, "Error locating analytics.", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		searchRes = append(searchRes, url)
	}
	stmt, err = db.Prepare("SELECT * FROM urls WHERE name = $1")
	if err != nil {
		http.Error(w, "Error locating analytics.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	var url shortURL
	row := stmt.QueryRow(name)
	err = row.Scan(&url.ShortURL, &url.Url, &url.DateCreated, &url.Pin)
	if err != nil {
		http.Error(w, "Error locating analytics", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	res := analyticsResponse{
		UrlDetails: url,
		Analytics:  searchRes,
	}

	response, err := json.Marshal(res)
	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(response)
	if err != nil {
		log.Fatal(err)
	}
}

func handleNewURL(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		fmt.Println("Method not allowed")
		return
	}
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	var req newURLRequest
	err = json.Unmarshal(reqBody, &req)
	if req.Url == "" {
		http.Error(w, "URL is required.", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	url := req.Url
	if strings.HasPrefix(url, "https://") == false && strings.HasPrefix(url, "http://") == false {
		url = "http://" + url
	}

	_, err = checkURLValid(url)
	if err != nil {
		http.Error(w, "URL is invalid.", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	newURL, err := createURL(url, db, req.Custom, req.CustomKey)
	if err != nil {
		http.Error(w, "Custom key already in use.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	stmt, err := db.Prepare("INSERT INTO urls (name, redirect_url, date_created, pin) VALUES ($1, $2, $3, $4)")
	if err != nil {
		http.Error(w, "An error occurred generating URL", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	_, err = stmt.Exec(newURL.ShortURL, newURL.Url, newURL.DateCreated, newURL.Pin)
	if err != nil {
		http.Error(w, "An error occurred generating URL", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	jsonUrl, err := json.Marshal(newURL)
	if err != nil {
		http.Error(w, "An error occurred generating URL", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonUrl)
	if err != nil {
		log.Fatal(err)
	}
}

func handleDeleteURL(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != "DELETE" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		fmt.Println("Method not allowed")
		return
	}
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	var res map[string]string
	err = json.Unmarshal(reqBody, &res)
	if res["pin"] == "" {
		http.Error(w, "Pin is required", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	pin, err := strconv.Atoi(res["pin"])
	name := res["url"]
	stmt, err := db.Prepare("SELECT * FROM urls WHERE name = $1 and pin = $2")
	if err != nil {
		http.Error(w, "An error occurred while deleting URL.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	row := stmt.QueryRow(name, pin)

	var url shortURL
	if row == nil {
		http.Error(w, "URL not found", http.StatusNotFound)
		fmt.Println(err)
		return
	}
	err = row.Scan(&url.ShortURL, &url.Url, &url.DateCreated, &url.Pin)
	if err != nil {
		http.Error(w, "An error occurred while deleting URL.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	stmt, err = db.Prepare("DELETE FROM urls WHERE name = $1 and pin = $2")
	if err != nil {
		http.Error(w, "An error occurred while deleting URL.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	_, err = stmt.Exec(name, pin)
	if err != nil {
		http.Error(w, "An error occurred while deleting URL.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	stmt, err = db.Prepare("DELETE FROM analytics WHERE name = $1")
	if err != nil {
		http.Error(w, "An error occurred while deleting URL.", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	_, err = stmt.Exec(name)

	w.WriteHeader(http.StatusOK)
	return

}
