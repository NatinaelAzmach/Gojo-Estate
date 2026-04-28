import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "GOJO",
  description: "Find your perfect home",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  let fullName: string | null = null;

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;

    if (session?.user?.id) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      fullName = profile?.full_name ?? null;
    }
  } catch {
    // Never crash the layout — just render without session
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white">
        <Navbar session={session} fullName={fullName} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
