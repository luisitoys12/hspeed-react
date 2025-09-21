import Player from '@/components/habbospeed/player';
import HabboProfile from '@/components/habbospeed/habbo-profile';
import LatestNews from '@/components/habbospeed/latest-news';

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Player />
          <LatestNews />
        </div>
        <div className="lg:col-span-1">
          <HabboProfile />
        </div>
      </main>
    </div>
  );
}
