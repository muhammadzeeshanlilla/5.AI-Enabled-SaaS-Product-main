'use client';

import { useCallback, useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import DatasetList from '../../components/DatasetList';
import DatasetTable from '../../components/DatasetTable';
import FileUpload from '../../components/FileUpload';
import Header from '../../components/Header';
import PredictionPanel from '../../components/PredictionPanel';
import api, { getErrorMessage } from '../../utils/api';

function DashboardContent() {
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [datasetError, setDatasetError] = useState('');
  const [predictionError, setPredictionError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDataset = useCallback(async (fileId) => {
    if (!fileId) return;
    setSelectedId(fileId);
    setDatasetLoading(true);
    setDatasetError('');
    setPrediction(null);
    setPredictionError('');
    try {
      const response = await api.get(`/api/dashboard/files/${fileId}/`);
      setDataset(response.data);
    } catch (error) {
      setDataset(null);
      setDatasetError(getErrorMessage(error, 'The dataset could not be loaded.'));
    } finally {
      setDatasetLoading(false);
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    const response = await api.get('/api/dashboard/files/');
    setFiles(response.data);
    return response.data;
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      setLoading(true);
      setPageError('');
      try {
        const [profileResponse, filesResponse] = await Promise.all([
          api.get('/api/auth/profile/'),
          api.get('/api/dashboard/files/'),
        ]);
        if (!active) return;
        setProfile(profileResponse.data);
        setFiles(filesResponse.data);
        if (filesResponse.data.length > 0) {
          await loadDataset(filesResponse.data[0].id);
        }
      } catch (error) {
        if (active) setPageError(getErrorMessage(error, 'The dashboard could not be loaded.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    initialize();
    return () => { active = false; };
  }, [loadDataset]);

  async function handleUploadComplete(uploaded) {
    setNotice(`${uploaded.file_name} was uploaded successfully.`);
    try {
      await refreshFiles();
      await loadDataset(uploaded.id);
    } catch (error) {
      setPageError(getErrorMessage(error, 'The dataset list could not be refreshed.'));
    }
  }

  async function runPrediction() {
    if (!selectedId) return;
    setPredictionLoading(true);
    setPredictionError('');
    setPrediction(null);
    try {
      const response = await api.post(`/api/dashboard/files/${selectedId}/predict/`);
      if (response.data.error) {
        setPredictionError(response.data.error);
      } else {
        setPrediction(response.data);
      }
    } catch (error) {
      setPredictionError(getErrorMessage(error, 'The forecast could not be generated.'));
    } finally {
      setPredictionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="screen-loader" role="status">
        <span className="loader-mark">IF</span>
        <span className="spinner" />
        <p>Preparing your workspace…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Header username={profile?.username} />
      <main className="dashboard-main">
        <section className="dashboard-intro">
          <div>
            <span className="eyebrow eyebrow-muted">Workspace overview</span>
            <h1>Good to see you{profile?.username ? `, ${profile.username}` : ''}.</h1>
            <p>Upload a dataset, review its rows, and generate a forecast grounded in your data.</p>
          </div>
          <span className="live-badge"><span className="status-dot" /> Backend connected</span>
        </section>

        {pageError && <div className="alert alert-error" role="alert">{pageError}</div>}
        {notice && (
          <div className="alert alert-success" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
          </div>
        )}

        <section className="dashboard-grid">
          <aside className="dashboard-sidebar">
            <FileUpload onUploadComplete={handleUploadComplete} />
            <DatasetList files={files} selectedId={selectedId} onSelect={loadDataset} />
          </aside>

          <div className="dashboard-content">
            <DatasetTable
              dataset={dataset}
              loading={datasetLoading}
              error={datasetError}
            />
            <PredictionPanel
              dataset={dataset}
              prediction={prediction}
              loading={predictionLoading}
              error={predictionError}
              onPredict={runPrediction}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
