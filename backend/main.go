package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	_ "github.com/lib/pq"
)

type Site struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	URL         string `json:"url"`
	Type        string `json:"type"`
	Country     string `json:"country"`
	Description string `json:"description"`
}

type Block struct {
	ID             int    `json:"id"`
	SiteID         int    `json:"siteId"`
	Blocker        string `json:"blocker"`
	BlockerCountry string `json:"blockerCountry"`
	Reason         string `json:"reason"`
	Date           string `json:"date"`
	Status         string `json:"status"`
	Bypass         string `json:"bypass"`
}

var db *sql.DB

func initDB() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "firstlab"),
		getEnv("DB_PASSWORD", "admin"),
		getEnv("DB_NAME", "firstlab"),
	)
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Ошибка подключения к БД: %v", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatalf("БД недоступна: %v", err)
	}
	log.Println("Подключение к БД успешно")
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func handleSites(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	path := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/sites"), "/")
	ctx := context.Background()

	if path == "" {
		switch r.Method {
		case http.MethodGet:
			rows, err := db.QueryContext(ctx,
				`SELECT id, name, url, type, country, description FROM sites ORDER BY id`)
			if err != nil {
				writeJSON(w, 500, map[string]string{"error": err.Error()})
				return
			}
			defer rows.Close()
			sites := []Site{}
			for rows.Next() {
				var s Site
				rows.Scan(&s.ID, &s.Name, &s.URL, &s.Type, &s.Country, &s.Description)
				sites = append(sites, s)
			}
			writeJSON(w, 200, sites)

		case http.MethodPost:
			var s Site
			if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
				writeJSON(w, 400, map[string]string{"error": "invalid JSON"})
				return
			}
			db.QueryRowContext(ctx,
				`INSERT INTO sites (name, url, type, country, description)
                 VALUES ($1,$2,$3,$4,$5) RETURNING id`,
				s.Name, s.URL, s.Type, s.Country, s.Description,
			).Scan(&s.ID)
			writeJSON(w, 201, s)
		}
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		writeJSON(w, 400, map[string]string{"error": "invalid id"})
		return
	}

	switch r.Method {
	case http.MethodGet:
		var s Site
		err := db.QueryRowContext(ctx,
			`SELECT id, name, url, type, country, description FROM sites WHERE id=$1`, id,
		).Scan(&s.ID, &s.Name, &s.URL, &s.Type, &s.Country, &s.Description)
		if err == sql.ErrNoRows {
			writeJSON(w, 404, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, 200, s)

	case http.MethodPut:
		var s Site
		json.NewDecoder(r.Body).Decode(&s)
		db.ExecContext(ctx,
			`UPDATE sites SET name=$1, url=$2, type=$3, country=$4, description=$5 WHERE id=$6`,
			s.Name, s.URL, s.Type, s.Country, s.Description, id)
		s.ID = id
		writeJSON(w, 200, s)

	case http.MethodDelete:
		res, _ := db.ExecContext(ctx, `DELETE FROM sites WHERE id=$1`, id)
		n, _ := res.RowsAffected()
		if n == 0 {
			writeJSON(w, 404, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, 200, map[string]string{"message": "deleted"})
	}
}

func handleBlocks(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	path := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/blocks"), "/")
	ctx := context.Background()

	if path == "" {
		switch r.Method {
		case http.MethodGet:
			siteIDStr := r.URL.Query().Get("siteId")
			var rows *sql.Rows
			if siteIDStr != "" {
				sid, _ := strconv.Atoi(siteIDStr)
				rows, _ = db.QueryContext(ctx,
					`SELECT id, site_id, blocker, blocker_country, reason, date, status, bypass
                     FROM blocks WHERE site_id=$1`, sid)
			} else {
				rows, _ = db.QueryContext(ctx,
					`SELECT id, site_id, blocker, blocker_country, reason, date, status, bypass
                     FROM blocks ORDER BY id`)
			}
			defer rows.Close()
			blocks := []Block{}
			for rows.Next() {
				var b Block
				rows.Scan(&b.ID, &b.SiteID, &b.Blocker, &b.BlockerCountry,
					&b.Reason, &b.Date, &b.Status, &b.Bypass)
				blocks = append(blocks, b)
			}
			writeJSON(w, 200, blocks)

		case http.MethodPost:
			var b Block
			json.NewDecoder(r.Body).Decode(&b)
			db.QueryRowContext(ctx,
				`INSERT INTO blocks (site_id, blocker, blocker_country, reason, date, status, bypass)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
				b.SiteID, b.Blocker, b.BlockerCountry, b.Reason, b.Date, b.Status, b.Bypass,
			).Scan(&b.ID)
			writeJSON(w, 201, b)
		}
		return
	}

	id, _ := strconv.Atoi(path)
	switch r.Method {
	case http.MethodGet:
		var b Block
		err := db.QueryRowContext(ctx,
			`SELECT id, site_id, blocker, blocker_country, reason, date, status, bypass
             FROM blocks WHERE id=$1`, id,
		).Scan(&b.ID, &b.SiteID, &b.Blocker, &b.BlockerCountry, &b.Reason, &b.Date, &b.Status, &b.Bypass)
		if err == sql.ErrNoRows {
			writeJSON(w, 404, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, 200, b)

	case http.MethodPut:
		var b Block
		json.NewDecoder(r.Body).Decode(&b)
		db.ExecContext(ctx,
			`UPDATE blocks SET site_id=$1, blocker=$2, blocker_country=$3,
             reason=$4, date=$5, status=$6, bypass=$7 WHERE id=$8`,
			b.SiteID, b.Blocker, b.BlockerCountry, b.Reason, b.Date, b.Status, b.Bypass, id)
		b.ID = id
		writeJSON(w, 200, b)

	case http.MethodDelete:
		db.ExecContext(ctx, `DELETE FROM blocks WHERE id=$1`, id)
		writeJSON(w, 200, map[string]string{"message": "deleted"})
	}
}

func main() {
	initDB()
	defer db.Close()

	http.HandleFunc("/api/sites", handleSites)
	http.HandleFunc("/api/sites/", handleSites)
	http.HandleFunc("/api/blocks", handleBlocks)
	http.HandleFunc("/api/blocks/", handleBlocks)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    if strings.HasPrefix(r.URL.Path, "/api/") {
        http.NotFound(w, r)
        return
    }
    path := "./public" + r.URL.Path
    if _, err := os.Stat(path); os.IsNotExist(err) {
        http.ServeFile(w, r, "./public/index.html")
        return
    }
    http.FileServer(http.Dir("./public")).ServeHTTP(w, r)
})

	port := getEnv("PORT", "5000")
	fmt.Printf("Сервер запущен на http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
