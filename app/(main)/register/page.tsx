"use client";

import { RegisterForm } from "@/components/forms/register-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function RegisterPage() {
  const router = useRouter();

  // Handle successful registration
  const handleSuccess = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col justify-center container max-w-md h-full">
      <div className="space-y-6">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "link" }), "p-0 -mx-1")}
        >
          <ChevronLeft /> Back to homepage
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Create an account to access features like voting and reporting
              crimes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <RegisterForm onSuccess={handleSuccess} />
            </Suspense>
            <div className="mt-4 text-center text-sm">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
