"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext,
} from "react-hook-form";

async function fetchReverseGeocode(lat: string, lon: string) {
  const response = await fetch(`/api/geoLookup/reverse?lat=${lat}&lon=${lon}`);
  const json = await response.json();

  if (!response.ok) throw new Error(json.error);
  return json;
}

interface ReverseGeocodeInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  latitudeField: FieldPath<T>;
  longitudeField: FieldPath<T>;
}

export function ReverseGeocodeInput<T extends FieldValues>({
  name,
  latitudeField,
  longitudeField,
}: ReverseGeocodeInputProps<T>) {
  const { register, setValue, getValues, setError, formState } =
    useFormContext<T>();
  const [showResults, setShowResults] = useState(false);

  const latitude = getValues(latitudeField);
  const longitude = getValues(longitudeField);

  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["reverseGeocode", latitude, longitude],
    queryFn: () => fetchReverseGeocode(latitude, longitude),
    enabled: !!latitude && !!longitude, // Only fetch when coordinates exist
  });

  useEffect(() => {
    if (error) {
      setError(name, { message: error.message });
    }
  }, [error, setError, name]);

  useEffect(() => {
    if (data) {
      setValue(name, data.location);
    }
  }, [data, setValue, name]);

  const handleLookup = async () => {
    setShowResults(true);
    await refetch();
  };

  return (
    <FormItem className="space-y-2 w-full">
      <FormLabel>Street Name</FormLabel>
      <FormControl>
        <Input type="text" disabled {...register(name)} />
      </FormControl>
      <FormMessage>
        {typeof formState.errors[name]?.message === "string"
          ? formState.errors[name]?.message
          : undefined}
      </FormMessage>

      <Button
        type="button"
        onClick={handleLookup}
        disabled={isFetching}
        variant="secondary"
        className="w-full"
      >
        {isFetching ? "Searching..." : "Find street name"}
      </Button>
      {showResults && data?.location && (
        <Select
          onValueChange={(value) =>
            setValue(name, value as PathValue<T, typeof name>)
          }
          value={getValues(name) as PathValue<T, typeof name>}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a street" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={data.location}>{data.location}</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormItem>
  );
}
