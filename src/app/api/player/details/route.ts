import {getPlayerDetails} from "@/database/actions";

export const GET = async (
    request: Request,
) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") ?? "";
    console.log("Getting player details for: ", id);
    try {
        const data = await getPlayerDetails(id);
        if (data) {
            return Response.json(data);
        }
    } catch (e) {
        console.log("Error getting player details ", e);
        return new Response("Error getting player details", {status: 500});
    }


    return new Response("Player not found", {status: 404});
}