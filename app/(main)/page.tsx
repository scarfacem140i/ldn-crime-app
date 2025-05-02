import { CrimeMap } from "@/components/map/crime-map";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Sidebar } from "@/components/sidebar";
import { getCrimeData } from "@/lib/actions/get-crime-data";
import { Suspense } from "react";

export default async function Home() {
  // Fetch initial data on the server
  const initialCrimes = await getCrimeData();

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar with timeline */}
        <Suspense>
          <Sidebar
            className="hidden md:flex w-80 border-r"
            crimes={initialCrimes}
          />
        </Suspense>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <Suspense>
            <CrimeMap crimes={initialCrimes} />
          </Suspense>
        </main>
      </div>

      {/* Mobile navigation */}
      <Suspense>
        <MobileNavigation crimes={initialCrimes} className="md:hidden" />
      </Suspense>
    </>
  );
}

export const dynamic = "force-dynamic";
