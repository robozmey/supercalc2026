package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/PaesslerAG/gval"
)

type CalculateRequest struct {
	Expression string `json:"expression"`
}

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type HistoryItem struct {
	Time     string `json:"time"`
	Request  string `json:"request"`
	Response string `json:"response"`
}

const historyFile = "history.json"

var (
	history   []HistoryItem
	historyMu sync.Mutex
)

func loadHistory() {
	data, err := os.ReadFile(historyFile)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("Could not read history file: %v", err)
		}
		return
	}

	if err := json.Unmarshal(data, &history); err != nil {
		log.Printf("Could not parse history file: %v", err)
	}
}

func addHistory(entry HistoryItem) {
	historyMu.Lock()
	defer historyMu.Unlock()

	history = append(history, entry)

	data, err := json.MarshalIndent(history, "", "  ")
	if err != nil {
		log.Printf("Could not marshal history: %v", err)
		return
	}

	if err := os.WriteFile(historyFile, data, 0644); err != nil {
		log.Printf("Could not write history file: %v", err)
	}
}

func getHistory() []HistoryItem {
	historyMu.Lock()
	defer historyMu.Unlock()

	result := make([]HistoryItem, len(history))
	copy(result, history)
	return result
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(ErrorResponse{
		Code:    code,
		Message: message,
	})
}

func factorial(x float64) float64 {
	result := 1.0

	for i := 2.0; i <= x; i++ {
		result *= i
	}

	return result
}

func calculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(
			w,
			http.StatusMethodNotAllowed,
			"METHOD_NOT_ALLOWED",
			"POST required",
		)
		return
	}

	var request CalculateRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(
			w,
			http.StatusBadRequest,
			"INVALID_REQUEST",
			"Invalid request",
		)
		return
	}
	expression := request.Expression
	expression = strings.ReplaceAll(expression, "pi", fmt.Sprintf("%.15f", math.Pi))

	result, err := gval.Evaluate(
		expression,
		gval.Arithmetic(),
		gval.Function("sqrt", math.Sqrt),
		gval.Function("factorial", factorial),
	)
	if err != nil {
		writeError(
			w,
			http.StatusBadRequest,
			"INVALID_EXPRESSION",
			"Invalid expression",
		)
		return
	}
	if number, ok := result.(float64); ok {
		if math.IsInf(number, 0) || math.IsNaN(number) {
			writeError(
				w,
				http.StatusBadRequest,
				"DIVISION_BY_ZERO",
				"Division by zero",
			)
			return
		}

		result = math.Round(number*1e10) / 1e10
	}

	addHistory(HistoryItem{
		Time:     time.Now().Format(time.RFC3339),
		Request:  request.Expression,
		Response: fmt.Sprint(result),
	})

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

	fmt.Fprint(w, result)
}

func historyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

	if err := json.NewEncoder(w).Encode(getHistory()); err != nil {
		log.Printf("Could not encode history: %v", err)
	}
}

func main() {
	loadHistory()

	http.HandleFunc("/api/calculate", calculate)
	http.HandleFunc("/api/history", historyHandler)

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}
