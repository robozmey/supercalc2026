import './App.css';
import { useState } from 'react';

function App() {
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addToExpression(value) {
    setExpression((current) => current + value);
    setAnswer('');
    setError('');
  }

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

    </main>
  );
}

export default App;
