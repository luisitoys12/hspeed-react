
import LatestNews from '@/components/habbospeed/latest-news';
import HabboProfile from '@/components/habbospeed/habbo-profile';
import OfficialAlliances from '@/components/habbospeed/official-alliances';
import ActiveRooms from '@/components/habbospeed/active-rooms';
import { Suspense } from 'react';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
import OnAirDjs from '@/components/habbospeed/on-air-djs';
import WeeklyAwards from '@/components/habbospeed/weekly-awards';
import Image from 'next/image';

function LoadingSkeleton() {
  return (
    <div className="flex justify-center items-center h-full min-h-[300px] bg-card rounded-lg">
      <Image 
        src="https://files.habboemotion.com/resources/images/seasons/habboween/handsuphabbo.gif" 
        alt="Cargando..."
        width={60}
        height={100}
        unoptimized
      />
    </div>
  )
}

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <HeroSlideshow />
      <Suspense fallback={<LoadingSkeleton />}>
        <OnAirDjs />
      </Suspense>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <LatestNews />
          <OfficialAlliances />
          <ActiveRooms />
        </div>
        <div className="lg:col-span-1 space-y-8">
           <Suspense fallback={<LoadingSkeleton />}>
              <HabboProfile />
           </Suspense>
           <WeeklyAwards />
        </div>
      </main>
    </div>
  );
}
