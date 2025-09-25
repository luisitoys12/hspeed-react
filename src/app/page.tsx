

import { Suspense } from 'react';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
import OnAirDjs from '@/components/habbospeed/on-air-djs';
import LatestCampaigns from '@/components/habbospeed/latest-campaigns';
import ActiveEvents from '@/components/habbospeed/active-events';
import Image from 'next/image';
import AboutAndNews from '@/components/habbospeed/about-and-news';
import Link from 'next/link';
import LatestBadges from '@/components/habbospeed/latest-badges';
import LatestFurnis from '@/components/habbospeed/latest-furnis';
import { db } from '@/lib/firebase';
import { get, ref } from 'firebase/database';
import HabboProfile from '@/components/habbospeed/habbo-profile';
import OfficialAlliances from '@/components/habbospeed/official-alliances';
import ActiveRooms from '@/components/habbospeed/active-rooms';
import PlayerSwitcher from '@/components/habbospeed/player-switcher';

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
        const newsRef = ref(db, 'news');

        const [eventsSnap, alliancesSnap, featuredRoomsSnap, newsSnap] = await Promise.all([
            get(eventsRef),
            get(alliancesRef),
            get(featuredRoomsRef),
            get(newsRef)
        ]);

        return {
            events: eventsSnap.val() || {},
            alliances: alliancesSnap.val() || {},
            featuredRooms: featuredRoomsSnap.val() || {},
            news: newsSnap.val() || {}
        };
    } catch (error) {
        console.error("Error fetching page data:", error);
        return {
            events: {}, alliances: {}, featuredRooms: {}, news: {}
        };
    }
}

export default async function Home() {
  const pageData = await getPageData();

  return (
    <>
      {/* Top Banner */}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <HeroSlideshow />
            <LatestCampaigns />
            <AboutAndNews initialNews={pageData.news} />
            <LatestFurnis />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <OnAirDjs />
            </Suspense>
            <PlayerSwitcher />
            <Suspense fallback={<LoadingSkeleton />}>
              <HabboProfile />
            </Suspense>
            <ActiveEvents initialEvents={pageData.events} />
            <Suspense fallback={<LoadingSkeleton />}>
              <LatestBadges />
            </Suspense>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="mt-8 space-y-8">
          <OfficialAlliances initialAlliances={pageData.alliances} />
          <ActiveRooms initialRooms={pageData.featuredRooms} />
        </div>
      </div>
    </>
  );
}
