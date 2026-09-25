function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function DatasetList({ files, selectedId, onSelect }) {
  return (
    <section className="panel dataset-list-panel">
      <div className="panel-heading panel-heading-inline">
        <div><span className="section-kicker">Library</span><h2>Your datasets</h2></div>
        <span className="count-badge">{files.length}</span>
      </div>
      {files.length === 0 ? (
        <div className="empty-state compact-empty">
          <span className="empty-icon">▤</span>
          <strong>No datasets yet</strong>
          <p>Your uploads will appear here.</p>
        </div>
      ) : (
        <div className="dataset-list">
          {files.map((file) => (
            <button
              type="button"
              key={file.id}
              className={`dataset-item ${selectedId === file.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(file.id)}
            >
              <span className="file-icon">{file.file_name.toLowerCase().endsWith('.csv') ? 'CSV' : 'XLS'}</span>
              <span className="dataset-copy">
                <strong title={file.file_name}>{file.file_name}</strong>
                <small>{file.row_count} {file.row_count === 1 ? 'row' : 'rows'} · {formatDate(file.uploaded_at)}</small>
              </span>
              <span className="dataset-arrow">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
