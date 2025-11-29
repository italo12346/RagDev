import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "RagDev",
  description: "Sistema de posts com likes - frontend Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground min-h-screen">
        
        <AuthProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
