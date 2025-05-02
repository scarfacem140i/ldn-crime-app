"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut, useSession } from "@/lib/auth-client";
import { useCrimeReport } from "@/lib/hooks/use-crime-report";
import { User } from "better-auth";
import { Cctv, LogIn, LogOut, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "./theme-toggle";
import CrimeReportDialog from "./report/crime-report-dialog";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="px-4 py-3 flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <Cctv />
        <h1 className="text-xl font-bold">London Crime Map</h1>
      </div>

      <div className="flex items-center gap-2">
        <ReportCrimeButtons user={user} />

        {!user ? (
          <div className="hidden md:flex items-center gap-2 h-full">
            <Button variant="outline" className="hidden md:flex h-full" asChild>
              <Link href="/login">Login</Link>
            </Button>

            <Button variant="outline" className="hidden md:flex h-full" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="hidden md:flex h-full"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Logout"}
          </Button>
        )}

        {!user ? (
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <LogIn className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/register">
                <UserPlus className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoading}
            loading={isLoading}
            className="block md:hidden"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}

function ReportCrimeButtons({ user }: { user?: User }) {
  const {
    isDroppingPin,
    pinDrop,
    isDialogOpen,
    handlePinDrop,
    handleOpenDialog,
    handleCloseDialog,
  } = useCrimeReport();

  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        className="hidden md:flex h-full"
        variant="outline"
        onClick={handlePinDrop}
      >
        {isDroppingPin ? "Cancel" : "Pin a crime"}
      </Button>
      {isDroppingPin && pinDrop && (
        <Button className="hidden md:flex h-full" onClick={handleOpenDialog}>
          Report Crime
        </Button>
      )}
      <CrimeReportDialog open={isDialogOpen} onClose={handleCloseDialog} />
    </>
  );
}
