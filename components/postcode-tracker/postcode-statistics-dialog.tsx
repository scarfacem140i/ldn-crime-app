import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { PercentageChange } from "./percentage-change";
import { CrimeIcon } from "../crime-icon";
import {
  PostcodeStatistics,
  PostcodeStatisticsSection,
} from "@/lib/hooks/use-postcode-tracker-statistics";
import { useMapContext } from "@/providers/MapProvider";

type PostcodeStatisticsDialogProps = PostcodeStatistics & {
  postcode: string;
  children: React.ReactNode;
};

export function PostcodeStatisticsDialog({
  children,
  postcode,
  overall,
  user,
  police,
}: PostcodeStatisticsDialogProps) {
  const renderCategorySection = (
    label: string,
    data: PostcodeStatisticsSection
  ) => {
    const crimeOrCrimes = data.current === 1 ? "crime" : "crimes";
    const map = useMapContext();
    const mapRef = map.mapRef;

    return (
      <div className="flex flex-col gap-1 border-b pb-6">
        <span className="w-full flex justify-between items-center">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">
            {label === "Police Reports"
              ? "From two months ago"
              : "From last hour"}
          </p>
        </span>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {data.current} {crimeOrCrimes} reported
          </p>
          <PercentageChange percentageChange={data.percentageChange} />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Most common type of crime
          </p>
          <p className="text-sm">{data.mostCommonCategory ?? "N/A"}</p>
        </div>
        {Object.entries(data.categories).length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {Object.entries(data.categories).map(([category, stats]) => {
              const label = stats.current === 1 ? "crime" : "crimes";
              return (
                <div key={category} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CrimeIcon category={category} />
                    <p className="text-sm font-semibold">{category}</p>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {stats.current} {label} reported
                    </p>
                    <PercentageChange
                      percentageChange={stats.percentageChange}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const overallLabel = overall.current === 1 ? "crime" : "crimes";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{postcode} details in a 1km radius</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col gap-1 border-b pb-6">
            <p className="text-sm font-semibold">Combined (User + Police)</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {overall.current} {overallLabel} reported
              </p>
              <PercentageChange percentageChange={overall.percentageChange} />
            </div>
            <span className="inline-flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Most common type of crime
              </p>
              <p className="text-sm">{overall.mostCommonCategory ?? "N/A"}</p>
            </span>
          </div>
          {renderCategorySection("User Reports", user)}
          {renderCategorySection("Police Reports", police)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
