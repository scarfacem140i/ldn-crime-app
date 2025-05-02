"use client";
import { useSession } from "@/lib/auth-client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export function AdminHeader() {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <div className="mb-1 w-full flex justify-between">
      <Link
        href="/"
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-2"
      >
        <ChevronLeft className="h-4 w-4 mt-1" />
        <p className="">Back to app</p>
      </Link>
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-3">
          <p className="text-sm">{user?.name}</p>
          <Badge variant="default" className="capitalize">
            {user?.role}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
}
