'use client'
import Login from "./_sections/login/login";
import {usePlayerStore} from "@/lib/stores/player-store";
import Dashboard from "./_sections/dashboard/dashboard";
import Loader from "@/components/loader";
import {useEffect, useState} from "react";
import ComingSoon from "@/components/coming-soon";

export default function Home() {
    const {player} = usePlayerStore();
    const [hydrated, setHydrated] = useState(false);

    const isUnderConstruction = true;

    useEffect(() => {
        // Wait until zustand rehydrates from storage
        const unsub = usePlayerStore.persist.onFinishHydration(() => {
            setHydrated(true);
        });
        // In case it's already hydrated
        if (usePlayerStore.persist.hasHydrated()) {
            setHydrated(true);
        }
        return unsub;
    }, []);

    if (isUnderConstruction) {
        return (
            <ComingSoon/>
        )
    }

    if (!hydrated) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader/>
            </div>
        );
    }


    return player ? <Dashboard/> : <Login/>;
}
