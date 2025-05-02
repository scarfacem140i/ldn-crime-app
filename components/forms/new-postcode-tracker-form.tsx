"use client";

import { useSession } from "@/lib/auth-client";
import { tracked_postcode } from "@/lib/db/schema";
import { usePostcodeTracker } from "@/lib/hooks/use-postcode-tracker";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PostcodeLookupInput } from "../postcode-lookup-input";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const insertPostcodeSchema = createInsertSchema(tracked_postcode, {
  latitude: z.string({ message: "Invalid latitude" }),
  longitude: z.string({ message: "Invalid longitude" }),
  postcode: z.string({ message: "Invalid postcode" }),
  user_id: z.string({ message: "Invalid user ID" }),
}).omit({ id: true });

type InsertPostCodeSchema = z.infer<typeof insertPostcodeSchema>;

interface NewPostcodeTrackerFormProps {}

export function NewPostcodeTrackerForm(props: NewPostcodeTrackerFormProps) {
  const session = useSession();
  const user = session.data?.user;

  if (!user)
    return (
      <p className="text-muted-foreground">
        You must be logged in to add a postcode.
      </p>
    );

  const form = useForm<InsertPostCodeSchema>({
    resolver: zodResolver(insertPostcodeSchema),
    defaultValues: {
      postcode: "",
      latitude: "",
      longitude: "",
      user_id: user.id,
    },
  });

  const { addMutation } = usePostcodeTracker();

  const handleSubmit = async (data: InsertPostCodeSchema) => {
    await addMutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PostcodeLookupInput
          postcodeField="postcode"
          latitudeField="latitude"
          longitudeField="longitude"
        />
        <Button
          variant="default"
          type="submit"
          disabled={
            !form.formState.isDirty ||
            !form.getValues().latitude ||
            !form.getValues().longitude ||
            !form.getValues().postcode
          }
        >
          Start tracking
        </Button>
      </form>
    </Form>
  );
}
