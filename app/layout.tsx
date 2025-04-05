import type { Metadata } from "next";

import {
  ClerkProvider,
  // SignInButton,
  // SignUpButton,
  // SignedIn,
  // SignedOut,
  // UserButton,
} from "@clerk/nextjs";

import "./globals.css";
import { ApolloProviderWrapper } from "@/components/ApolloProvider";

export const metadata: Metadata = {
  title: "Assistly AI SaaS",
  description: "AI Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap the entire app with the Clerk Provider for auth
    <ApolloProviderWrapper>
      <ClerkProvider>
        <html lang="en">
          <body className="min-h-screen flex">{children}</body>
        </html>
      </ClerkProvider>
    </ApolloProviderWrapper>
  );
}
