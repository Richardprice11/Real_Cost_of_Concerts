import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToasterProvider } from "@/components/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Concert Cost Tracker",
  description: "Track concert costs, fun ratings, and value per dollar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("concert-cost-tracker-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-base-200 font-sans text-base-content antialiased`}
      >
        <ThemeProvider>
          {children}
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
