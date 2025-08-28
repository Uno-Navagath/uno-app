import {GameDateFilter, GameStatus, getGames} from "@/database/actions";

export const GET = async (
    request: Request,
) => {

    console.log("Getting all games");
    const {searchParams} = new URL(request.url);
    try {

        const status = searchParams.get("status") as GameStatus ?? undefined;
        const dateFiler = searchParams.get("date") as GameDateFilter ?? null;

        const games = await getGames(status, dateFiler);
        return Response.json(games);
    } catch (e) {
        console.log("Error getting games ", e);
        return new Response("Error getting games", {status: 500});
    }

}