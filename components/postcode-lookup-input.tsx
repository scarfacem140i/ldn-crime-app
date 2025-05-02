"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { CheckCheck, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

async function fetchLatlonFromPostcode(postcode: string) {
  const response = await fetch(`/api/geoLookup?postcode=${postcode}`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error);
  return json;
}

interface PostcodeLookupInputProps<T extends FieldValues> {
  postcodeField: FieldPath<T>;
  latitudeField: FieldPath<T>;
  longitudeField: FieldPath<T>;
}

export function PostcodeLookupInput<T extends FieldValues>({
  postcodeField,
  latitudeField,
  longitudeField,
}: PostcodeLookupInputProps<T>) {
  const { register, setValue, setError, clearErrors, control, formState } =
    useFormContext<T>();
  const postcode = useWatch({ control, name: postcodeField }); // <-- live watching postcode field
  const [lastVerifiedPostcode, setLastVerifiedPostcode] = useState<
    string | null
  >(null);

  const { refetch, isFetching, error, data } = useQuery({
    queryKey: ["postcodeLookup", postcode],
    queryFn: async () => await fetchLatlonFromPostcode(postcode),
    enabled: false,
  });

  const isVerified = lastVerifiedPostcode === postcode;

  useEffect(() => {
    if (error) {
      setLastVerifiedPostcode(null);
      setError(postcodeField, { message: error.message });
    }
  }, [error, setError, postcodeField]);

  useEffect(() => {
    if (data && data.location) {
      setValue(latitudeField, data.location.lat);
      setValue(longitudeField, data.location.lon);
      clearErrors(postcodeField);
      setLastVerifiedPostcode(postcode); // remember which postcode was verified
    }
  }, [
    data,
    setValue,
    latitudeField,
    longitudeField,
    clearErrors,
    postcode,
    postcodeField,
  ]);

  const handleLookup = async () => {
    setLastVerifiedPostcode(null); // clear verification while checking
    await refetch();
  };

  return (
    <div className="space-y-2">
      <FormItem className="flex items-end gap-2 w-full">
        <div className="space-y-2 w-full">
          <FormLabel>Postcode</FormLabel>
          <FormControl className="w-full flex gap-2">
            <div className="relative w-full">
              <Input
                type="text"
                className="w-full"
                {...register(postcodeField)}
              />
            </div>
          </FormControl>
          <FormMessage>
            {typeof formState.errors[postcodeField]?.message === "string"
              ? formState.errors[postcodeField]?.message
              : undefined}
          </FormMessage>
        </div>
        <Button
          type="button"
          onClick={handleLookup}
          disabled={isVerified || isFetching || !postcode}
          loading={isFetching}
          variant="secondary"
          className="w-1/3"
        >
          {isVerified && !isFetching && (
            <CheckCheck className="h-4 w-4 text-primary" />
          )}
          {isFetching
            ? "Checking..."
            : isVerified
            ? "Verified"
            : "Verify postcode"}
        </Button>
      </FormItem>
      {data && data.location && (
        <div className="bg-secondary text-sm text-muted-foreground p-2 py-1 rounded-lg">
          {data.location.display_name}
        </div>
      )}
    </div>
  );
}
