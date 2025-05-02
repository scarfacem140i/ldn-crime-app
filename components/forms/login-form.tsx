"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(10, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  onContinueAsGuest?: () => void;
  onSuccess?: () => void;
}

export function LoginForm({
  onSubmit,
  onContinueAsGuest,
  onSuccess,
}: LoginFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    }
    await signIn.email(
      {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Logged in successfully");
          if (onSuccess) onSuccess();
        },
        onError: () => {
          toast.error("Failed to log in");
        },
        onResponse: () => {
          setLoading(false);
        },
      }
    );
  };

  const handleContinueAsGuest = async () => {
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
    await signIn.anonymous(
      {},
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Logged in as guest");
          if (onSuccess) onSuccess();
        },
        onError: () => {
          toast.error("Failed to log in as guest");
          form.setError("email", { message: "Unable to log in as guest" });
        },
        onResponse: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Remember me</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-0">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleContinueAsGuest}
          >
            {loading ? "Processing..." : "Continue as Guest"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
