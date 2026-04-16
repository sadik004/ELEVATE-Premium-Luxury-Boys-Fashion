import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "ELEVATE | Premium Luxury Boys Fashion",
  description: "Ultra-premium e-commerce platform for luxury boys fashion.",
};

import AuthHydrator from "@/components/AuthHydrator";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <AuthHydrator />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
