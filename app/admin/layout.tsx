import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/header";
import { AdminNavbar } from "@/components/admin/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "../globals.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: headers() });
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <div className="container mx-auto py-8">
          <AdminHeader />
          <AdminNavbar />
          {children}
        </div>
      </ThemeProvider>
      <Toaster position="top-center" closeButton={true} />
    </QueryProvider>
  );
}
