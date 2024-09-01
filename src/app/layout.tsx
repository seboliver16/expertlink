// src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { UserProvider } from './UserContext';

export const metadata = {
  title: 'Minerva',
  description: 'GenAI Powered Expert Network',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
