import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "IPU Trinity - Academic Audit",
  description: "Academic Audit System for IPU Colleges",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
