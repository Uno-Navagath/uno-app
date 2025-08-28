import React from 'react';
import {Player} from "@/database/schema";
import Image from "next/image";

const Header = (
    {
        player
    }: {
        player: Player;
    }
) => {
    return (
        <header className="flex items-center justify-between p-4">
            <div className="flex flex-row items-center gap-2">
                <Image
                    src="/logo.png"
                    alt="UNO Logo"
                    width={20}
                    height={20}
                />
                <h1 className="text-md font-bold">UNO</h1>
            </div>
            {
                player.imageUrl && (
                    <Image src={player.imageUrl} alt="avatar" width={30} height={30} className="rounded-full"/>
                )
            }
        </header>
    );
};

export default Header;