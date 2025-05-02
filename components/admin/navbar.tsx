"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  return (
    <nav className="flex justify-between p-1 my-6 border rounded-lg bg-input/20 w-full">
      <div className="flex items-center gap-1.5">
        <Link href="/admin/reports">
          <Button variant={isActive("/admin/reports") ? "secondary" : "ghost"}>
            Reports
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant={isActive("/admin/users") ? "secondary" : "ghost"}>
            Users
          </Button>
        </Link>
        <Link href="/admin/police">
          <Button variant={isActive("/admin/police") ? "secondary" : "ghost"}>
            Police Data
          </Button>
        </Link>
      </div>
    </nav>
  );
}
