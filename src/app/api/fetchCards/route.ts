import {fetchCards} from "@/lib/fetchCards/fetchCards";

export async function GET() {
	await fetchCards()

	return new Response("", {
		status: 200,
	})
}