import './globals.css';

export const metadata = {
  title: 'Financial Tracker',
  description: 'Connect bank accounts, review transactions, and group spending by type.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
