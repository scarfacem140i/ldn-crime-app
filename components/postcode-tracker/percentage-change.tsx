import { PostcodeStatistics } from "@/lib/hooks/use-postcode-tracker-statistics";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export function PercentageChange({
  percentageChange,
}: {
  percentageChange?: number;
}) {
  if (!percentageChange) {
    return null;
  }

  const isPercentageChangePositive = percentageChange > 0;

  let percentageChangeFmtted = `${Math.round(percentageChange)}`;
  if (percentageChange > 0) {
    percentageChangeFmtted = `+${percentageChangeFmtted}`;
  }

  return (
    <>
      {percentageChange !== 0 && (
        <div className="flex gap-2 items-center text-destructive">
          {isPercentageChangePositive ? (
            <TrendingUp className={cn("h-4 w-4 text-primary")} />
          ) : (
            <TrendingDown className={cn("h-4 w-4 text-red-400")} />
          )}
          <p className="font-bold text-foreground text-xs">
            {percentageChangeFmtted}
          </p>
        </div>
      )}
      {percentageChange === 0 && (
        <p className="text-xs text-muted-foreground">No change</p>
      )}
    </>
  );
}
