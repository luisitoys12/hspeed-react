


import HabboProfile from '@/components/habbospeed/habbo-profile';
import OfficialAlliances from '@/components/habbospeed/official-alliances';
import ActiveRooms from '@/components/habbospeed/active-rooms';
import { Suspense } from 'react';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
import OnAirDjs from '@/components/habbospeed/on-air-djs';
import LatestCampaigns from '@/components/habbospeed/latest-campaigns';
import ActiveEvents from '@/components/habbospeed/active-events';
import Image from 'next/image';
import HomeHeader from '@/components/layout/home-header';
import RecentWinners from '@/components/habbospeed/recent-winners';
import AboutUs from '@/components/habbospeed/about-us';
import Link from 'next/link';
import LatestBadges from '@/components/habbospeed/latest-badges';
import LatestFurnis from '@/components/habbospeed/latest-furnis';

function LoadingSkeleton() {
  return (
    <div className="flex justify-center items-center h-full min-h-[120px] bg-card rounded-lg mt-8">
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
    <>
      <div className="w-full">
         <div className="container mx-auto flex justify-center">
             <Link href="/news" className='hidden md:block'>
                <Image 
                    src="https://images.habbo.com/web_images/habbo-web-articles/lpromo_Oct22.png"
                    alt="Campaña actual"
                    width={960}
                    height={100}
                    className="object-contain hover:brightness-110 transition-all"
                />
            </Link>
        </div>
      </div>
      <HomeHeader />
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="hidden md:block mb-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <OnAirDjs />
            </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 flex flex-col gap-8">
             <div className="md:hidden">
                <Suspense fallback={<LoadingSkeleton />}>
                <OnAirDjs />
                </Suspense>
            </div>
            <Suspense fallback={<LoadingSkeleton />}>
              <HabboProfile />
            </Suspense>
             <Suspense fallback={<LoadingSkeleton />}>
              <LatestBadges />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <AboutUs />
            </Suspense>
          </div>

          {/* Columna Central */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <HeroSlideshow />
            <LatestCampaigns />
             <Suspense fallback={<LoadingSkeleton />}>
              <LatestFurnis />
            </Suspense>
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <ActiveEvents />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <RecentWinners />
            </Suspense>
          </div>
        </div>

        {/* Secciones inferiores */}
        <div className="mt-8 space-y-8">
          <OfficialAlliances />
          <ActiveRooms />
        </div>
      </div>
    </>
  );
}
