function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function DatasetTable({ dataset, loading, error }) {
  if (loading) {
    return (
      <section className="panel content-panel panel-loading" role="status">
        <span className="spinner" />
        <p>Loading dataset…</p>
      </section>
    );
  }

  if (error) return <section className="panel content-panel"><div className="alert alert-error">{error}</div></section>;

  if (!dataset) {
    return (
      <section className="panel content-panel empty-state tall-empty">
        <span className="empty-icon">▦</span>
        <h2>Select or upload a dataset</h2>
        <p>The original rows and dynamic columns will appear here.</p>
      </section>
    );
  }

  const columns = dataset.columns?.length
    ? dataset.columns
    : Array.from(new Set((dataset.rows || []).flatMap((row) => Object.keys(row))));

  return (
    <section className="panel content-panel">
      <div className="panel-heading dataset-heading">
        <div>
          <span className="section-kicker">Dataset details</span>
          <h2>{dataset.file_name}</h2>
          <p>{dataset.rows?.length || 0} rows · {columns.length} columns</p>
        </div>
        <span className="data-status"><span className="status-dot" /> Stored</span>
      </div>
      {dataset.rows?.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>
              {dataset.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => <td key={`${rowIndex}-${column}`}>{displayValue(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state compact-empty"><strong>This dataset has no stored rows.</strong></div>
      )}
    </section>
  );
}
