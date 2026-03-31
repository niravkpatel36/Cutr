package main

import (
	"cmp"
	"database/sql"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"log"
	"net/http"
	"os"
	"strconv"
)

func main() {
	appEnv := os.Getenv("APP_ENV") // Check for environment: development/production
	if appEnv == "development" || appEnv == "development_local" {
		err := godotenv.Load()
		if err != nil {
			log.Println("No .env file found, relying on system environment variables")
		}
	} else {
		log.Println("Running in production mode, skipping .env loading")
	}

	db := initDB()
	http.HandleFunc("/{path...}", enableCors(func(w http.ResponseWriter, r *http.Request) {
		handleURL(w, r, db)
	}))

	port := cmp.Or(os.Getenv("PORT"), strconv.Itoa(3000))
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(db)
}
