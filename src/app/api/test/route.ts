import {getCard} from "@/lib/fetchCards/card";

export async function GET() {
	const result = await getCard("https://limitlesstcg.com/cards/LA/137", 188);
	return new Response(JSON.stringify(result), {
		status: 200,
	})
}