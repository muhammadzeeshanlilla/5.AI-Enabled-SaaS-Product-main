import './globals.css';

export const metadata = {
  title: 'InsightFlow | AI SaaS Dashboard',
  description: 'Upload business data, explore datasets, and generate machine-learning forecasts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
