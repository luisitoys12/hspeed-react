

import { Suspense } from 'react';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
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
import OnAirDjs from '@/components/habbospeed/on-air-djs';
import MobileHomeRadio from '@/components/habbospeed/mobile-home-radio';
import HomePlayer from '@/components/habbospeed/home-player';
import LatestCampaigns from '@/components/habbospeed/latest-campaigns';

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
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="space-y-8">
            <HeroSlideshow />
            <div className="lg:hidden">
              <MobileHomeRadio />
            </div>
            <div className="hidden lg:flex lg:justify-center">
              <HomePlayer />
            </div>
            <OnAirDjs />
            <Suspense fallback={<LoadingSkeleton />}>
              <HabboProfile />
            </Suspense>
            <AboutAndNews initialNews={pageData.news} />
            <ActiveEvents initialEvents={pageData.events} />
            <Suspense fallback={<LoadingSkeleton />}>
              <LatestBadges />
            </Suspense>
             <OfficialAlliances initialAlliances={pageData.alliances} />
             <ActiveRooms initialRooms={pageData.featuredRooms} />
        </div>

      </div>
    </>
  );
}
