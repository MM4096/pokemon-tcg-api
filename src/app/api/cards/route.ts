import {NextRequest} from "next/server";
import {getCard, QueryOptions} from "@/lib/api/cardDb";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const options: Record<string, string> = {};
	for (const [key, value] of searchParams.entries()) {
		options[key] = value;
	}

	const result = getCard(options as QueryOptions);
	return new Response(JSON.stringify(result), {
		status: 200,
	})
}

export async function POST(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const requestBody = await request.json();

	const options: Record<string, string> = requestBody as Record<string, string>;
	for (const [key, value] of searchParams.entries()) {
		options[key] = value;
	}

	const result = getCard(options as QueryOptions);
	return new Response(JSON.stringify(result), {
		status: 200,
	})
}