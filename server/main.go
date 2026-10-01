package main

import (
	"io"
	"log"
	"net/http"
)

func calculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}

	expression, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Could not read expression", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Write(expression)
}

func main() {

	http.HandleFunc("/api/calculate", calculate)

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}
