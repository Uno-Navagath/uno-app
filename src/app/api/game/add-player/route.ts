import {addPlayerToGame} from "@/database/actions";

export const POST = async (req: Request) => {
    const {gameId, playerId} = await req.json();

    const data = await addPlayerToGame(gameId, playerId);

    if(!data) {
        return new Response("Failed to add player to game", {status: 500});
    }

    return new Response("Player added to game", {status: 200});
}