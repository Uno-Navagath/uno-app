import {getLeaderboard, LeaderboardDateFilter} from "@/database/actions";

export const GET = async (
    request: Request,
) => {

    const {searchParams} = new URL(request.url);
    const date = searchParams.get("date") as LeaderboardDateFilter ?? undefined;

    const data = await getLeaderboard(date);

    return Response.json(data);
}