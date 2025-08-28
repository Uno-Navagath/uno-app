'use client';

import React, {useEffect, useState} from "react";
import ActiveGame from "@/app/game/_active-game/active-game";
import FinishedGame from "@/app/game/_finished-game/finished-game";
import Loader from "@/components/loader";
import {GameDetails} from "@/database/schema";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string | undefined>();
    const [game, setGame] = useState<GameDetails | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchId = async () => {
            const data = await params;
            setId(data.id);
        };
        fetchId();
    }, [params]);

    useEffect(() => {
        const fetchGame = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await fetch('/api/game' + `?id=${id}`).then(res => res.json());
                setGame(data);
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Loader/></div>;

    if (!game) return <div>Game not found</div>;

    return game.status === "active" ? (
        <ActiveGame game={game}/>
    ) : (
        <FinishedGame game={game}/>
    );
}
