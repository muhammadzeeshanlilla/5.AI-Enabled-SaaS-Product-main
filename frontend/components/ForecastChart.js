'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function ForecastChart({ dataset, prediction }) {
  const numericColumn = prediction.column_analyzed;
  const labelColumn = dataset.columns?.find((column) => column !== numericColumn);
  const historical = (dataset.rows || []).reduce((points, row, index) => {
    const value = toFiniteNumber(row[numericColumn]);
    if (value === null) return points;
    const sourceLabel = labelColumn ? row[labelColumn] : null;
    points.push({
      label: sourceLabel !== null && sourceLabel !== undefined && sourceLabel !== ''
        ? String(sourceLabel)
        : `Observation ${index + 1}`,
      actual: value,
      forecast: null,
    });
    return points;
  }, []);

  const chartData = [...historical];
  if (chartData.length) {
    chartData[chartData.length - 1] = {
      ...chartData[chartData.length - 1],
      forecast: chartData[chartData.length - 1].actual,
    };
  }
  prediction.forecast_next_3.forEach((value, index) => {
    chartData.push({ label: `Forecast ${index + 1}`, actual: null, forecast: value });
  });

  if (!historical.length) return null;

  return (
    <div className="chart-card">
      <div className="chart-title">
        <div><h3>{numericColumn} forecast</h3><p>Observed values and backend-generated predictions</p></div>
        <span className="chart-key">{historical.length} observed · 3 forecast</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#e9e9f2" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#71717f', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#dedee8' }} minTickGap={24} />
            <YAxis tick={{ fill: '#71717f', fontSize: 12 }} tickLine={false} axisLine={false} width={55} />
            <Tooltip
              contentStyle={{ border: '1px solid #dedee8', borderRadius: 12, boxShadow: '0 12px 30px rgba(29, 28, 45, .12)' }}
              labelStyle={{ color: '#262534', fontWeight: 700 }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 14 }} />
            <Line type="monotone" dataKey="actual" name="Observed" stroke="#5f5ce6" strokeWidth={3} dot={{ r: 3, fill: '#5f5ce6' }} activeDot={{ r: 5 }} connectNulls={false} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#21a179" strokeWidth={3} strokeDasharray="7 6" dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
