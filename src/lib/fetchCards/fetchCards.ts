import * as fs from "fs";
import {setTimeout} from "timers/promises";
import {COLOR_CODES, drawProgressBar} from "@/lib/fetchCards/prettyConsole";
import {populateCardAdditionalTypes} from "@/lib/fetchCards/rulesAndCardTypes";
import {getJqueryOfSite} from "@/lib/fetchCards/crawler";
import {Card, getCard} from "@/lib/fetchCards/card";
import {getSavedData, SAVED_DATA, saveData} from "@/lib/fetchCards/cachedData";
import path from "node:path";
import {db} from "@/lib/api/cardDb";


export async function fetchCards(getAllCards: boolean = false) {
	getSavedData();
	await populateCardAdditionalTypes();

	// get sets
	const j = await getJqueryOfSite("https://limitlesstcg.com/cards");
	let sets: string[] = [];
	j("table a > .code").each((idx: number, el: Element) => {
		const setCode = j(el).text();
		sets.push(setCode);
	});

	if (!getAllCards) {
		const fetchedSets: string[] = Object.keys(db);
		const newSets: string[] = [];
		sets.forEach((set) => {
			if (fetchedSets.indexOf(set) === -1) {
				newSets.push(set);
			}
		})
		sets = newSets;
		console.log(`Only fetching new sets: ${sets.join(", ")}`)
	}

	// check whether last session crashed and start from there
	let startAt = SAVED_DATA["crashPoint"];
	let cardData: Record<string, Record<string, Card>> = {}
	if (fs.existsSync(path.join(process.cwd(), "public", "cardData.json"))) {
		cardData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "cardData.json"), "utf-8")) || {};
	}

	// do loop variables here, as these need to be saved in case of crash
	let setIdx = 0;
	let cardIdx = 0;
	try {
		// get cards of each set
		while (setIdx < sets.length) {
			if (setIdx < startAt[0]) {
				setIdx++;
				console.log(`Skipping set ${sets[setIdx]} (${setIdx + 1} out of ${sets.length}) (cached)`);
				continue;
			}
			console.log(`Getting cards for set ${sets[setIdx]} (${setIdx + 1} out of ${sets.length})`);
			cardData[sets[setIdx]] = {};
			const s = await getJqueryOfSite(`https://limitlesstcg.com/cards/${sets[setIdx]}`);

			const cardLinks = s(".card-search-grid a");
			cardIdx = 0;
			while (cardIdx < cardLinks.length) {
				if (cardIdx < startAt[1] && setIdx === startAt[0]) {
					cardIdx++;
					continue;
				}
				drawProgressBar((cardIdx + 1) / cardLinks.length, `Getting card ${cardIdx + 1} out of ${cardLinks.length}`);
				const el = cardLinks[cardIdx];
				const url = s(el).attr("href");
				const parts = url.split("/");
				const id = parts[parts.length - 1];
				const card_id = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`;

				// looping over each card
				cardData[sets[setIdx]][id] = await getCard(`https://limitlesstcg.com${url}`, card_id);

				// await setTimeout(100);
				cardIdx++;
			}

			setIdx++;
		}
		startAt = [0, 0];
	} catch (e: unknown) {
		console.log();
		console.log(`${COLOR_CODES.FgRed} Program crashed at set ${sets[setIdx]} (${setIdx + 1} out of ${sets.length}, card ${cardIdx}) (${(e as Error).message})${COLOR_CODES.Reset}`);
		console.log("Trace:")
		console.log((e as Error).stack);
		startAt = [setIdx, cardIdx];
	}
	SAVED_DATA["crashPoint"] = startAt;
	saveData();
	fs.writeFileSync(path.join(process.cwd(), "public", "cardData.json"), JSON.stringify(cardData, null, 2));
}
