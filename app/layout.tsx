import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Toaster } from "sonner";
import './globals.css'

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Job application tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-zinc-950 text-zinc-50">
          {children}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}