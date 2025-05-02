"use client";

import { tracked_postcode } from "@/lib/db/schema";
import { usePostcodeTracker } from "@/lib/hooks/use-postcode-tracker";
import { usePostcodeTrackerStatistics } from "@/lib/hooks/use-postcode-tracker-statistics";
import { InferSelectModel } from "drizzle-orm";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { PercentageChange } from "./percentage-change";
import { PostcodeInsertModal } from "./postcode-insert-modal";
import { PostcodeStatisticsDialog } from "./postcode-statistics-dialog";
import { Skeleton } from "../ui/skeleton";

const animationVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: {
    type: "spring",
    stiffness: 150,
    damping: 19,
    mass: 1.2,
  },
};

type PostcodeTracker = InferSelectModel<typeof tracked_postcode>;

export function PostcodeTracker() {
  const { getQuery: postcodesData } = usePostcodeTracker();
  return (
    <div className="absolute p-3 max-w-full z-10 md:max-w-[350px] max-h-[500px] w-full">
      <motion.div
        {...animationVariants}
        className="bg-background p-3 rounded-lg shadow-md max-h-full flex flex-col overflow-hidden"
      >
        <div className="flex flex-col">
          <div className="flex items-center w-full mb-2.5 justify-between gap-3">
            <h1 className="leading-[1.1] font-semibold text-sm tracking-tight">
              Postcode Tracking
            </h1>
            {postcodesData.isLoading && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
          <PostcodeInsertModal>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs font-semibold text-muted-foreground"
            >
              <Plus /> Add
            </Button>
          </PostcodeInsertModal>
        </div>
        <ScrollArea className="grow overflow-auto">
          {postcodesData.data?.map((postcode) => (
            <PostcodeItem key={postcode.id} {...postcode} />
          ))}
        </ScrollArea>
      </motion.div>
    </div>
  );
}

function PostcodeItem(props: PostcodeTracker) {
  const stats = usePostcodeTrackerStatistics({
    lat: Number(props.latitude),
    lon: Number(props.longitude),
  });

  if (!stats.data)
    return (
      <Skeleton className="w-full px-2 h-7 leading-none flex gap-1.5 items-center text-base animate-pulse" />
    );

  return (
    <PostcodeStatisticsDialog postcode={props.postcode} {...stats.data}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full px-2 h-7 leading-none flex gap-1.5 items-center text-base"
      >
        <p className="mr-auto text-sm capitalize">{props.postcode}</p>
        <PercentageChange
          percentageChange={stats.data.overall.percentageChange}
        />
      </Button>
    </PostcodeStatisticsDialog>
  );
}
