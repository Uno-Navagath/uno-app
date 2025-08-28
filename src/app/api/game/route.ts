import {getGameById} from "@/database/actions";

export const GET = async (
    request: Request,
) => {

    const {searchParams} = new URL(request.url);
    const id = searchParams.get("id") ?? "";

    const game = await getGameById(id);

    return Response.json(game);
}