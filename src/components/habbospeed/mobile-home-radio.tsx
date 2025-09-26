

'use client';

import HomePlayer from "./home-player";
import OnAirDjs from "./on-air-djs";

export default function MobileHomeRadio() {
    return (
        <div className="space-y-4">
            <HomePlayer />
            <OnAirDjs />
        </div>
    )
}
