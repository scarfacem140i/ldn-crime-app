"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useReportCrime } from "@/lib/hooks/use-crimes";
import { crimeCategories } from "@/lib/types/filters";
import { crimeReportInsertSchema } from "@/lib/zod/crimeReport";
import { parseAsJson, useQueryState } from "nuqs";
import { ReverseGeocodeInput } from "../reverse-geocode-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { pinDropSchema } from "../report/pindrop";

const formSchema = crimeReportInsertSchema;

export type ReportCrimeFormData = z.infer<typeof formSchema>;

interface ReportCrimeFormProps {
  onSuccess?: () => void;
}

export function CrimeReportForm({ onSuccess }: ReportCrimeFormProps) {
  const [pinDrop] = useQueryState("pinDrop", parseAsJson(pinDropSchema.parse));
  const reportCrimeMutation = useReportCrime();

  const form = useForm<ReportCrimeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: crimeCategories[1],
      description: "",
      latitude: pinDrop?.latitude ?? "",
      longitude: pinDrop?.longitude ?? "",
      street_name: "",
    },
  });

  const handleSubmit = async (data: ReportCrimeFormData) => {
    try {
      await reportCrimeMutation.mutateAsync(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handling is managed by the mutation
      console.error("Error in form submission:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {crimeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Describe the incident" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street_name"
          render={() => (
            <ReverseGeocodeInput
              name="street_name"
              latitudeField="latitude"
              longitudeField="longitude"
            />
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={reportCrimeMutation.isPending}
        >
          {reportCrimeMutation.isPending ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </Form>
  );
}
