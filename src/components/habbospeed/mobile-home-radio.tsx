
'use client';

import HomePlayer from "./home-player";
import OnAirDjs from "./on-air-djs";

export default function MobileHomeRadio() {
    return (
        <div className="lg:hidden space-y-4">
            <HomePlayer />
            <OnAirDjs />
        </div>
    )
}
