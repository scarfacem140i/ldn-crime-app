"use client";

import { LoginForm } from "@/components/forms/login-form";
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

export default function LoginPage() {
  const router = useRouter();

  // Handle successful login
  const handleSuccess = () => {
    router.push("/");
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
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Sign in to access features like voting and reporting crimes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <LoginForm onSuccess={handleSuccess} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
