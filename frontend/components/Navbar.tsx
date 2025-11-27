"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-background text-foreground">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          RAGBank
        </Link>

        <div className="flex gap-4">
          <Link href="/posts" className="hover:underline">
            Posts
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
