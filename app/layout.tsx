import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 text-foreground font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-8 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://github.com/nguyenquocdatUIT/expenseTracker"
                title="ExpenseTracker on GitHub"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  Powered by
                </span>
                <p className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent font-semibold">
                  Team 3
                </p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
