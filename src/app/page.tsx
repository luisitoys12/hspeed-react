

import { Suspense } from 'react';
import HeroSlideshow from '@/components/habbospeed/hero-slideshow';
import ActiveEvents from '@/components/habbospeed/active-events';
import Image from 'next/image';
import AboutAndNews from '@/components/habbospeed/about-and-news';
import Link from 'next/link';
import LatestBadges from '@/components/habbospeed/latest-badges';
import LatestFurnis from '@/components/habbospeed/latest-furnis';
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const [eventsRes, newsRes] = await Promise.all([
            fetch(`${API_URL}/events`, { cache: 'no-store' }),
            fetch(`${API_URL}/news`, { cache: 'no-store' })
        ]);

        const events = eventsRes.ok ? await eventsRes.json() : [];
        const news = newsRes.ok ? await newsRes.json() : [];

        const eventsObj = events.reduce((acc: any, event: any) => {
            acc[event._id] = {
                title: event.title,
                server: event.server,
                date: event.date,
                time: event.time,
                roomName: event.roomName,
                roomOwner: event.roomOwner,
                host: event.host,
                imageUrl: event.imageUrl,
                imageHint: event.imageHint
            };
            return acc;
        }, {});

        const newsObj = news.reduce((acc: any, article: any) => {
            acc[article._id] = {
                title: article.title,
                summary: article.summary,
                content: article.content,
                imageUrl: article.imageUrl,
                imageHint: article.imageHint,
                category: article.category,
                date: article.date
            };
            return acc;
        }, {});

        return {
            events: eventsObj,
            alliances: {},
            featuredRooms: {},
            news: newsObj
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
