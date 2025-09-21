
import LatestNews from '@/components/habbospeed/latest-news';
import HabboProfile from '@/components/habbospeed/habbo-profile';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
import OfficialAlliances from '@/components/habbospeed/official-alliances';
import ActiveRooms from '@/components/habbospeed/active-rooms';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import OnAirMarquee from '@/components/habbospeed/on-air-marquee';

function HabboProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-[80px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}

export default function Home() {
  return (
    <div className="space-y-8">
      <OnAirMarquee />
      <HeroSlideshow />
      <div className="container mx-auto p-4 md:p-8">
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LatestNews />
            <OfficialAlliances />
            <ActiveRooms />
          </div>
          <div className="lg:col-span-1 space-y-8">
             <Suspense fallback={<HabboProfileSkeleton />}>
                <HabboProfile />
             </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
