package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"vite-project/backend/config"
	"vite-project/backend/seeder"

	"github.com/joho/godotenv"
)

func main() {
	sqlMode := flag.Bool("sql", false, "Output SQL statements instead of inserting directly")
	flag.Parse()

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	if *sqlMode {
		fmt.Println(seeder.RunSQLOnly())
		os.Exit(0)
	}

	config.ConnectDB()
	defer config.DB.Close()

	seeder.Run()
}
