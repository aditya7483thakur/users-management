import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const firaCode = Fira_Code({ variable: "--font-fira", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "User management",
  description: "Manage everything easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${firaCode.variable} antialiased`}>
        <QueryProvider>
          <Navbar />
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </QueryProvider>
      </body>
    </html>
  );
}
