package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculateSuccess(t *testing.T) {
	body := `{"expression":"2+3"}`

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/calculate",
		strings.NewReader(body),
	)

	w := httptest.NewRecorder()

	calculate(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	if w.Body.String() != "5" {
		t.Errorf("expected result 5, got %q", w.Body.String())
	}
}

func TestCalculateInvalidExpression(t *testing.T) {
	body := `{"expression":"2+("}`

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/calculate",
		strings.NewReader(body),
	)

	w := httptest.NewRecorder()

	calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}

	expected := `{"code":"INVALID_EXPRESSION","message":"Invalid expression"}` + "\n"

	if w.Body.String() != expected {
		t.Errorf("expected %q, got %q", expected, w.Body.String())
	}
}

func TestCalculateInvalidRequest(t *testing.T) {
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/calculate",
		strings.NewReader("abc"),
	)

	w := httptest.NewRecorder()

	calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}

	expected := `{"code":"INVALID_REQUEST","message":"Invalid request"}` + "\n"

	if w.Body.String() != expected {
		t.Errorf("expected %q, got %q", expected, w.Body.String())
	}
}

func TestCalculateMethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(
		http.MethodGet,
		"/api/calculate",
		nil,
	)

	w := httptest.NewRecorder()

	calculate(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status 405, got %d", w.Code)
	}

	expected := `{"code":"METHOD_NOT_ALLOWED","message":"POST required"}` + "\n"

	if w.Body.String() != expected {
		t.Errorf("expected %q, got %q", expected, w.Body.String())
	}
}

func TestCalculateDivisionByZero(t *testing.T) {
	body := `{"expression":"1/0"}`

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/calculate",
		strings.NewReader(body),
	)

	w := httptest.NewRecorder()

	calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}

	expected := `{"code":"DIVISION_BY_ZERO","message":"Division by zero"}` + "\n"

	if w.Body.String() != expected {
		t.Errorf("expected %q, got %q", expected, w.Body.String())
	}
}
