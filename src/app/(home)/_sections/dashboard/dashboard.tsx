'use client'
import React from 'react';
import {usePlayerStore} from "@/lib/stores/player-store";
import {router} from "next/client";
import Header from "@/app/(home)/_sections/dashboard/components/header";
import TopPlayers from "@/app/(home)/_sections/dashboard/components/top-players";
import RecentGames from "@/app/(home)/_sections/dashboard/components/recent-games";
import PlayerData from "@/app/(home)/_sections/dashboard/components/player-data";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "lucide-react";
import Link from "next/link";

function Dashboard() {
    const {player} = usePlayerStore();

    if (!player) {
        router.reload();
        return null;
    }

    console.log(typeof player);

    return (
        <div>
            <Header player={player}/>
            <TopPlayers/>
            <PlayerData player={player}/>
            <RecentGames/>

            {/* FAB */}
            <Button
                className="fixed bottom-6 right-6 flex h-14 w-14 rounded-full"
                asChild
            >
                <Link href="/game/create">
                    <PlusIcon/>
                </Link>
            </Button>
        </div>
    );
}

export default Dashboard;