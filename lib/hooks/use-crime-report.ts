"use client";

import { useState } from "react";
import { parseAsBoolean, parseAsJson, useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { pinDropSchema } from "@/components/report/pindrop";

export function useCrimeReport() {
  const [isDroppingPin, setIsDroppingPin] = useQueryState(
    "droppingPin",
    parseAsBoolean
  );
  const [pinDrop, setPinDrop] = useQueryState(
    "pinDrop",
    parseAsJson(pinDropSchema.parse)
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handlePinDrop = () => {
    if (isDroppingPin) {
      setIsDroppingPin(null);
      setPinDrop(null);
    } else {
      setIsDroppingPin(true);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPinDrop(null);
    setIsDroppingPin(null);
    router.refresh();
  };

  return {
    isDroppingPin,
    pinDrop,
    isDialogOpen,
    handlePinDrop,
    handleOpenDialog,
    handleCloseDialog,
  };
}