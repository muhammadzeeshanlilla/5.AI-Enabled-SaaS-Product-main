import ForecastChart from './ForecastChart';

export default function PredictionPanel({ dataset, prediction, loading, error, onPredict }) {
  if (!dataset) return null;

  return (
    <section className="panel prediction-panel">
      <div className="panel-heading prediction-heading">
        <div>
          <span className="section-kicker">Machine-learning forecast</span>
          <h2>Prediction</h2>
          <p>The backend analyzes the first usable numeric column with linear regression.</p>
        </div>
        <button className="button button-dark" type="button" onClick={onPredict} disabled={loading || !dataset.rows?.length}>
          {loading && <span className="button-spinner button-spinner-light" />}
          {loading ? 'Generating…' : prediction ? 'Run again' : 'Generate forecast'}
        </button>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {!prediction && !error && !loading && (
        <div className="prediction-placeholder">
          <span>✦</span>
          <p>Generate a forecast to see the next three values, trend, confidence, and insight.</p>
        </div>
      )}

      {prediction && (
        <div className="prediction-results">
          <div className="metric-grid">
            <article className="metric-card accent-card">
              <span>Analyzed column</span>
              <strong>{prediction.column_analyzed}</strong>
            </article>
            <article className="metric-card">
              <span>Trend</span>
              <strong className={prediction.trend === 'increasing' ? 'positive-text' : 'negative-text'}>
                {prediction.trend === 'increasing' ? '↗' : '↘'} {prediction.trend}
              </strong>
            </article>
            <article className="metric-card">
              <span>Model confidence</span>
              <strong>{prediction.confidence}%</strong>
            </article>
          </div>

          <div className="forecast-values">
            <h3>Next three values</h3>
            <div>
              {prediction.forecast_next_3.map((value, index) => (
                <article key={`${index}-${value}`}>
                  <span>Forecast {index + 1}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </div>

          <ForecastChart dataset={dataset} prediction={prediction} />

          <div className="insight-box">
            <span className="insight-icon">✦</span>
            <div><span>AI insight</span><p>{prediction.insight}</p></div>
          </div>
        </div>
      )}
    </section>
  );
}
