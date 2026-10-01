import './App.css';
import { useState } from 'react';

function App() {
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function calculate(event) {
    event.preventDefault();
    setAnswer('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression }),
      });

      const result = await response.text();
      setAnswer(result);
    } catch (err) {
      setError(err.message || 'Could not connect to the calculator');
    } finally {
      setLoading(false);
    }
  }

  return (
   <main className="App">
      <form onSubmit={calculate}>
        <label htmlFor="expression">Expression</label>
        <input
          id="expression"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="(12 + 22 * 7) / 3"
        />
        <button type="submit" disabled={loading || !expression.trim()}>
          {loading ? '...' : '='}
        </button>

        <label htmlFor="answer">Answer</label>
        <input id="answer" value={answer} readOnly />
      </form>

      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default App;
