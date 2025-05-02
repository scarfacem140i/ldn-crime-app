import { api_crime_report } from "@/lib/db/schema";
import { usePoliceCrimes } from "@/lib/hooks/use-police-crimes";
import { useMapContext } from "@/providers/MapProvider";
import { Marker, MarkerEvent } from "@vis.gl/react-maplibre";
import { InferSelectModel } from "drizzle-orm";
import { Ellipsis } from "lucide-react";
import { useMemo } from "react";
import {
  PointClusterProperties,
  PointFeature,
  PointFeatureProperties,
  useSupercluster,
} from "react-map-gl-supercluster/maplibre";
import { CrimeIcon } from "./crime-icon";
import { Button } from "./ui/button";
import { useFilteredPoliceCrimes } from "@/lib/hooks/use-filtered-police-crimes";
import { parseAsString, useQueryState } from "nuqs";
import { PoliceCrimePopover } from "./police-crime-popover";
import { LONDON_CENTER, ZOOMED_IN_ZOOM } from "./map/base-map";

export default function PoliceCrimeMarkers() {
  const map = useMapContext();
  const mapRef = map.mapRef;

  const [policeReportId, setPoliceReportId] = useQueryState(
    "policeReportId",
    parseAsString
  );

  const { data, error } = usePoliceCrimes();
  const crimes = data && !error ? data : [];
  const { filteredCrimeData } = useFilteredPoliceCrimes(crimes);

  const currentReport = filteredCrimeData.find(
    (report) => report.id === policeReportId
  );

  const points = useMemo(
    () => createPoints(filteredCrimeData),
    [filteredCrimeData]
  );

  const { supercluster, clusters } = useSupercluster(points, {
    mapRef,
    map: mapFeature,
    reduce: reduceCluster,
    maxZoom: 16,
    radius: 120,
  });

  const expandCluster = (clusterId: any, coordinates: any) => {
    const zoom = supercluster.getClusterExpansionZoom(clusterId);
    mapRef.current?.easeTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom,
    });
  };

  const onMarkerClick = (e: MarkerEvent<MouseEvent>, id: string) => {
    e.originalEvent.stopPropagation();
    setPoliceReportId(id);
    const targetReport = filteredCrimeData.find((report) => report.id === id);
    if (mapRef.current && targetReport) {
      mapRef.current.flyTo({
        center: [Number(targetReport.longitude), Number(targetReport.latitude)],
      });
    }
  };

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;

        return cluster.properties.cluster ? (
          <Marker
            key={`cluster-${cluster.properties.cluster_id}`}
            longitude={longitude}
            latitude={latitude}
            onClick={() =>
              // @ts-ignore
              // ignore the error here, as it's a bug in react-map-gl-supercluster
              expandCluster(cluster.properties.cluster_id, {
                longitude,
                latitude,
              })
            }
          >
            <PoliceCrimeButton>
              <Ellipsis />
            </PoliceCrimeButton>
          </Marker>
        ) : (
          <Marker
            key={`item-${cluster.properties.item.id}`}
            longitude={longitude}
            latitude={latitude}
            //@ts-ignore
            onClick={(e) => onMarkerClick(e, cluster.properties.item.id)}
          >
            <PoliceCrimeButton>
              <CrimeIcon
                category={cluster.properties.item.category}
                className="h-6 w-6"
              />
            </PoliceCrimeButton>
          </Marker>
        );
      })}
      {currentReport && (
        <PoliceCrimePopover center={LONDON_CENTER} crime={currentReport} />
      )}
    </>
  );
}

type PoliceCrimeButtonProps = React.HTMLAttributes<HTMLButtonElement>;
function PoliceCrimeButton({ ...props }: PoliceCrimeButtonProps) {
  return (
    <Button
      variant="secondary"
      className="h-8 w-8 rounded-full relative border-primary border-2"
    >
      {props.children}
    </Button>
  );
}

type ApiCrimeReport = InferSelectModel<typeof api_crime_report>;
function createPoints(
  items: ApiCrimeReport[]
): Array<PointFeature<ItemPointFeatureProperties>> {
  return items.map(createPoint);
}

function createPoint(
  item: ApiCrimeReport
): PointFeature<ItemPointFeatureProperties> {
  const { longitude, latitude } = item;

  return {
    type: "Feature",
    properties: { cluster: false, item },
    geometry: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    },
  };
}

type ItemPointFeatureProperties = PointFeatureProperties<{
  item: ApiCrimeReport;
}>;
type ItemPointClusterProperties = PointClusterProperties<{
  items: ApiCrimeReport[];
}>;

function mapFeature(
  props: ItemPointFeatureProperties
): ItemPointClusterProperties {
  return { items: [props.item] };
}

function reduceCluster(
  memo: ItemPointClusterProperties,
  props: ItemPointClusterProperties
): void {
  memo.items = memo.items.concat(props.items);
}
