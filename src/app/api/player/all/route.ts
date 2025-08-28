import {getAllPlayers} from "@/database/actions";

export const GET = async () => {
    const players = await getAllPlayers();

    return Response.json(players);
}