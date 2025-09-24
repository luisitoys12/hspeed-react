

import HabboProfile from '@/components/habbospeed/habbo-profile';
import OfficialAlliances from '@/components/habbospeed/official-alliances';
import ActiveRooms from '@/components/habbospeed/active-rooms';
import { Suspense } from 'react';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
import OnAirDjs from '@/components/habbospeed/on-air-djs';
import LatestCampaigns from '@/components/habbospeed/latest-campaigns';
import ActiveEvents from '@/components/habbospeed/active-events';
import Image from 'next/image';
import RecentWinners from '@/components/habbospeed/recent-winners';
import AboutAndNews from '@/components/habbospeed/about-and-news';
import Link from 'next/link';
import LatestBadges from '@/components/habbospeed/latest-badges';
import LatestFurnis from '@/components/habbospeed/latest-furnis';
import { db } from '@/lib/firebase';
import { get, ref } from 'firebase/database';

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

async function getPageData() {
    try {
        const eventsRef = ref(db, 'events');
        const alliancesRef = ref(db, 'alliances');
        const featuredRoomsRef = ref(db, 'featuredRooms');
        const awardTypesRef = ref(db, 'awardTypes');
        const awardWinnersRef = ref(db, 'awardWinners');
        const newsRef = ref(db, 'news');

        const [eventsSnap, alliancesSnap, featuredRoomsSnap, awardTypesSnap, awardWinnersSnap, newsSnap] = await Promise.all([
            get(eventsRef),
            get(alliancesRef),
            get(featuredRoomsRef),
            get(awardTypesRef),
            get(awardWinnersRef),
            get(newsRef)
        ]);

        return {
            events: eventsSnap.val() || {},
            alliances: alliancesSnap.val() || {},
            featuredRooms: featuredRoomsSnap.val() || {},
            awardTypes: awardTypesSnap.val() || {},
            awardWinners: awardWinnersSnap.val() || {},
            news: newsSnap.val() || {}
        };
    } catch (error) {
        console.error("Error fetching page data:", error);
        return {
            events: {}, alliances: {}, featuredRooms: {}, awardTypes: {}, awardWinners: {}, news: {}
        };
    }
}


export default async function Home() {
  const pageData = await getPageData();

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
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="mb-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <OnAirDjs />
            </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <HabboProfile />
            </Suspense>
             <Suspense fallback={<LoadingSkeleton />}>
              <LatestBadges />
            </Suspense>
             <Suspense fallback={<LoadingSkeleton />}>
              <AboutAndNews initialNews={pageData.news} />
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
            <ActiveEvents initialEvents={pageData.events} />
            <RecentWinners initialWinners={pageData.awardWinners} initialAwardTypes={pageData.awardTypes} />
          </div>
        </div>

        {/* Secciones inferiores */}
        <div className="mt-8 space-y-8">
          <OfficialAlliances initialAlliances={pageData.alliances} />
          <ActiveRooms initialRooms={pageData.featuredRooms} />
        </div>
      </div>
    </>
  );
}
