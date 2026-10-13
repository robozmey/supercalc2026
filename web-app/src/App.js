import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [userId] = useState(getUserId);
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);


  function addToExpression(value) {
    setExpression((current) => current + value);
    setAnswer('');
    setError('');
  }

  function getUserId() {
    let userId = localStorage.getItem('userId');

    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('userId', userId);
    }

    return userId;
  }

  async function loadHistory() {
    setHistoryLoading(true);

    try {
      const response = await fetch('/api/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить историю');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки истории');
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [answer]);

  function clear() {
    setExpression('');
    setAnswer('');
    setError('');
  }

  function backspace() {
    setExpression((current) => current.slice(0, -1));
    setAnswer('');
    setError('');
  }

  async function calculate() {
    if (!expression.trim()) {
      return;
    }

    setAnswer('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          expression: expression.replaceAll('^', '**'),
        }),
      });

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setAnswer(result);
    } catch (err) {
      setError(err.message || 'Ошибка вычисления');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    calculate();
  }

  return (
    <main className="App">

      <div className="calculator">

        {/* DISPLAY */}

        <div className="display">
          <div className="expression">
            {expression || ' '}
          </div>

          <div className="answer">
            {loading ? '...' : answer || '0'}
          </div>
        </div>


        {/* BUTTONS */}

        <form onSubmit={handleSubmit} className="buttons">

          {/* Левая дополнительная колонка */}

          <button
            type="button"
            className="function"
            onClick={clear}
          >
            AC
          </button>

          {/* Скобки */}

          <button
            type="button"
            className="function"
            onClick={() => addToExpression('(')}
          >
            (
          </button>

          <button
            type="button"
            className="function"
            onClick={() => addToExpression(')')}
          >
            )
          </button>

          <button
            type="button"
            className="function"
            onClick={() => addToExpression('%')}
          >
            %
          </button>

          <button
            type="button"
            className="operator"
            onClick={() => addToExpression('/')}
          >
            ÷
          </button>


          {/* √ */}

          <button
            type="button"
            className="function"
            onClick={() => addToExpression('sqrt(')}
          >
            √
          </button>

          <button
            type="button"
            onClick={() => addToExpression('7')}
          >
            7
          </button>

          <button
            type="button"
            onClick={() => addToExpression('8')}
          >
            8
          </button>

          <button
            type="button"
            onClick={() => addToExpression('9')}
          >
            9
          </button>

          <button
            type="button"
            className="operator"
            onClick={() => addToExpression('*')}
          >
            ×
          </button>


          {/* π */}

          <button
            type="button"
            className="function"
            onClick={() => addToExpression('pi')}
          >
            π
          </button>

          <button
            type="button"
            onClick={() => addToExpression('4')}
          >
            4
          </button>

          <button
            type="button"
            onClick={() => addToExpression('5')}
          >
            5
          </button>

          <button
            type="button"
            onClick={() => addToExpression('6')}
          >
            6
          </button>

          <button
            type="button"
            className="operator"
            onClick={() => addToExpression('-')}
          >
            −
          </button>


          {/* ^ */}

          <button
            type="button"
            className="function"
            onClick={() => addToExpression('^')}
          >
            ^
          </button>

          <button
            type="button"
            onClick={() => addToExpression('1')}
          >
            1
          </button>

          <button
            type="button"
            onClick={() => addToExpression('2')}
          >
            2
          </button>

          <button
            type="button"
            onClick={() => addToExpression('3')}
          >
            3
          </button>

          <button
            type="button"
            className="operator"
            onClick={() => addToExpression('+')}
          >
            +
          </button>


          {/* ! */}

          <button
            type="button"
            className="function"
            onClick={() => addToExpression('!')}
          >
            !
          </button>

          <button
            type="button"
            className="zero"
            onClick={() => addToExpression('0')}
          >
            0
          </button>

          <button
            type="button"
            onClick={() => addToExpression('.')}
          >
            .
          </button>

          <button
            type="button"
            onClick={backspace}
          >
            ⌫
          </button>

          <button
            type="submit"
            className="equals"
            disabled={loading}
          >
            =
          </button>

        </form>


        {error && (
          <div className="error">
            {error}
          </div>
        )}

      </div>

      <aside className="history-panel">
          <button
            type="button"
            className="history-toggle"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? 'Скрыть историю' : 'История'}
          </button>

          {showHistory && (
            <div className="history-list">
              {historyLoading && <div>Загрузка...</div>}

              {!historyLoading && history.length === 0 && (
                <div>История пуста</div>
              )}

              {!historyLoading &&
                history.map((item, index) => (
                  <button
                    key={`${item.time}-${index}`}
                    type="button"
                    className="history-item"
                    onClick={() => {
                      setExpression(item.request);
                      setAnswer(item.response);
                      setError('');
                    }}
                  >
                    <span className="history-time">{item.time}</span>
                    <strong>{item.request}</strong>
                    <span className="history-result">= {item.response}</span>
                  </button>
                ))}
            </div>
          )}
        </aside>

    </main>
  );
}

export default App;
