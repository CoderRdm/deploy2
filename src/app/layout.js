// src/app/layout.js
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css'; // Import Tailwind CSS

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Placement Portal',
  description: 'Student Placement Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster /> {/* Add the Toaster component here */}
        </Providers>
      </body>
    </html>
  );
}