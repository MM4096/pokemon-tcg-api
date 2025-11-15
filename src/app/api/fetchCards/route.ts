import {fetchCards} from "@/lib/fetchCards/fetchCards";
import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const fetchAllCards = searchParams.get("fetchAll") == "true";
	await fetchCards(fetchAllCards);

	return new Response("", {
		status: 200,
	})
}