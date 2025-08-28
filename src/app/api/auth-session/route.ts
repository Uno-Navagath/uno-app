import {cookies} from "next/headers";
import {createPlayer, getPlayerByFirebaseId} from "@/database/actions/player";


export const GET = async () => {
    const token = (await cookies()).get('session-token');
    return Response.json({
        token: token?.value,
    });
}

export const POST = async (
    request: Request,
) => {
    const {token, name, email, imageUrl} = await request.json();

    (await cookies()).set('session-token', token);

    const player = await getPlayerByFirebaseId(token);
    if (player) {
        console.log("Logged in as: ", player.name);
        return Response.json(JSON.stringify(player));
    } else {

        const data = {
            firebaseId: token,
            name,
            email,
            imageUrl
        }
        const newPlayer = await createPlayer(data);
        console.log("New player created: ", newPlayer.name);
        return Response.json(JSON.stringify(newPlayer));
    }
}

export const DELETE = async () => {
    (await cookies()).delete('session-token');
    return Response.json({
        message: 'Session token deleted',
    });
}