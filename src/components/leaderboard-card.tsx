import React from "react";
import Image from "next/image";
import { LeaderboardEntry } from "@/database/actions";
import { FaCrown } from "react-icons/fa";

type Props = {
    entry: LeaderboardEntry;
    rank: number;
};

export const LeaderboardCard: React.FC<Props> = ({ entry, rank }) => {
    const crownColors: Record<number, string> = {
        1: "text-yellow-400",
        2: "text-gray-300",
        3: "text-amber-600",
    };

    return (
        <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            {/* Profile with rank + crown */}
            <div className="relative">
                <Image
                    src={entry.imageUrl || "/default-avatar.png"}
                    alt={entry.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />

                {/* Rank badge (always shown) */}
                <span
                    className={`absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-md ${
                        rank === 1
                            ? "bg-yellow-400 text-white"
                            : rank === 2
                                ? "bg-gray-300 text-white"
                                : rank === 3
                                    ? "bg-amber-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                >
          {rank}
        </span>

                {rank <= 3 && (
                    <FaCrown
                        className={`absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 drop-shadow-sm ${crownColors[rank]}`}
                    />
                )}
            </div>

            {/* Info */}
            <div className="ml-4 flex flex-col flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {entry.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.totalGames} games • avg {Math.round(entry.avgScore)}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {entry.totalScore} total score
                </p>
            </div>
        </div>
    );
};
