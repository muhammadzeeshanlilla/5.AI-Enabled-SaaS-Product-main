'use client';

import { useRef, useState } from 'react';
import api, { getErrorMessage } from '../utils/api';

const ALLOWED_EXTENSIONS = ['csv', 'xlsx'];

export default function FileUpload({ onUploadComplete }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  function validateAndSet(candidate) {
    setError('');
    if (!candidate) return;
    const extension = candidate.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFile(null);
      setError('Choose a CSV or XLSX file.');
      return;
    }
    setFile(candidate);
    setProgress(0);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    validateAndSet(event.dataTransfer.files?.[0]);
  }

  async function upload() {
    if (!file) {
      setError('Choose a file before uploading.');
      return;
    }
    setLoading(true);
    setError('');
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/dashboard/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      await onUploadComplete(response.data);
      setFile(null);
      setProgress(100);
      if (inputRef.current) inputRef.current.value = '';
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'The file could not be uploaded.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel upload-panel">
      <div className="panel-heading">
        <div><span className="section-kicker">Add data</span><h2>Upload dataset</h2></div>
      </div>
      <div
        className={`drop-zone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="dataset-file"
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => validateAndSet(event.target.files?.[0])}
          disabled={loading}
        />
        <label htmlFor="dataset-file">
          <span className="upload-icon">↑</span>
          <strong>{file ? file.name : 'Drop a file here'}</strong>
          <span>{file ? 'Ready to upload' : 'or choose from your computer'}</span>
          <small>CSV or XLSX</small>
        </label>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      {loading && (
        <div className="progress-row" role="status">
          <div className="progress-track"><span style={{ width: `${Math.max(progress, 8)}%` }} /></div>
          <span>{progress}%</span>
        </div>
      )}
      <button className="button button-primary upload-button" type="button" onClick={upload} disabled={!file || loading}>
        {loading ? 'Uploading…' : 'Upload dataset'}
      </button>
    </section>
  );
}
