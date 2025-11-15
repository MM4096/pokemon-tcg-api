import {Card, CollapsedCard} from "@/lib/fetchCards/card";
import * as fs from "fs";
import path from "node:path";

export type QueryOptions = {
	setId?: string,
	cardId?: string,
	cardName?: string,
	cardType?: string,
	cardSubtype?: string,
	cardSet?: string,
}

//region init db
export const cardDb: Array<CollapsedCard> = [];

export const db: Record<string, Record<string, Card>> = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "cardData.json"), "utf-8"));
for (const set of Object.keys(db)) {
	for (const id of Object.keys(db[set] || {})) {
		cardDb.push({
			...db[set]![id]!,
			set: set,
			id: id,
		})
	}
}
//endregion

function compareValues(a: unknown, b: unknown): boolean {
	if (typeof a === "string" && typeof b === "string") {
		return a.toLowerCase() === b.toLowerCase();
	}

	return a === b;
}

export function getCard(options: QueryOptions): Array<CollapsedCard> {
	let validOptions: Array<CollapsedCard> = cardDb;
	for (const option of Object.keys(options)) {
		const iterOptions: Array<CollapsedCard> = [];
		for (const card of validOptions) {
			if (!(card as object).hasOwnProperty(option)) {
				continue;
			}
			// if (card[option as keyof CollapsedCard] === options[option as keyof QueryOptions]) {
			if (compareValues(card[option as keyof CollapsedCard], options[option as keyof QueryOptions])) {
				iterOptions.push(card);
			}
		}
		validOptions = iterOptions;
		if (validOptions.length === 0) {
			return [];
		}
	}

	return validOptions;
}
