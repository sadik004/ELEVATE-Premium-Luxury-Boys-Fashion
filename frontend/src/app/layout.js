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
      <body className={`${inter.variable} ${playfair.variable} bg-luxury-pearl text-luxury-charcoal antialiased`}>
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
                  background: '#FDFDFD',
                  color: '#333333',
                  border: '1px solid rgba(51, 51, 51, 0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#C5B358',
                    secondary: '#FDFDFD',
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
