import {getTopPlayers} from "@/database/actions";

export const GET = async () => {

    const data = await getTopPlayers();

    return Response.json(data);
}