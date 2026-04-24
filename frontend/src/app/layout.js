import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProvider from "@/components/ScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import AuthSessionProvider from "@/components/AuthSessionProvider";

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
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-luxury-black text-white antialiased`}>
        <AuthSessionProvider>
          <ScrollProvider>
            <CustomCursor />
            <AuthHydrator />
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#0a0a0a',
                  color: '#fff',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#D4AF37',
                    secondary: '#0a0a0a',
                  },
                },
              }}
            />
          </ScrollProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
