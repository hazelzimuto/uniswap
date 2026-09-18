import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'UniSwap - Derby Grammar School Uniform Exchange',
  description: 'Second-hand school uniform exchange for parents at Derby Grammar School.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container">{children}</main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} UniSwap • Derby Grammar School Parent Exchange</p>
        </footer>
      </body>
    </html>
  );
}
