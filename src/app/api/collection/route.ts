import {NextRequest} from "next/server";
import {CollapsedCard} from "@/lib/fetchCards/card";
import {getCard, QueryOptions} from "@/lib/api/cardDb";

export async function POST(request: NextRequest) {
	const requestBody = await request.json();

	if (requestBody === null || !Array.isArray(requestBody)) {
		return new Response("Invalid request body (expected array)", {
			status: 400,
		})
	}

	const cards: Array<CollapsedCard> = [];
	const not_found: Array<unknown> = [];

	for (const card of requestBody) {
		const result: Array<CollapsedCard> = getCard(card as QueryOptions);
		if (result.length === 0) {
			not_found.push(card);
		} else {
			cards.push(result[0])
		}
	}

	return new Response(JSON.stringify({cards, not_found}), {
		status: 200,
	})
}