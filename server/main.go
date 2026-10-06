package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"

	"github.com/PaesslerAG/gval"
)

type CalculateRequest struct {
	Expression string `json:"expression"`
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
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}

	var request CalculateRequest

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
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
		http.Error(w, "Invalid expression", http.StatusBadRequest)
		return
	}
	if number, ok := result.(float64); ok {
		if math.IsInf(number, 0) || math.IsNaN(number) {
			http.Error(w, "Division by zero", http.StatusBadRequest)
			return
		}

		result = math.Round(number*1e10) / 1e10
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

	fmt.Fprint(w, result)
}

func main() {

	http.HandleFunc("/api/calculate", calculate)

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}
