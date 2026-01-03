import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "@/components/Toast";
import { ToastProvider as SonnerProvider } from "@/components/ui/ToastProvider";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { PrivacyProvider } from '@/providers/PrivacyProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // Inter supports these
});

export const metadata: Metadata = {
  title: "Business OS - Modern Business Management",
  description: "Manage your operations efficiently with Business OS",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const messages = await getMessages();
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Material Symbols Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <PostHogProvider>
            <ToastProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
               <PrivacyProvider>
                {children}
               </PrivacyProvider>
              </ThemeProvider>
            </ToastProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
        <SonnerProvider />
      </body>
    </html>
  );
}
