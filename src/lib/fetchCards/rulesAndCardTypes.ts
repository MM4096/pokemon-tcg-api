import {setTimeout} from "timers/promises";
import {drawProgressBar} from "@/lib/fetchCards/prettyConsole";
import {getJqueryOfSite} from "@/lib/fetchCards/crawler";
import {SAVED_DATA, saveData} from "@/lib/fetchCards/cachedData";

export const ADDITIONAL_RULES: Record<string, string[]> = {
	"ex": ["When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards."],
	"mega-ex": ["When your Mega Evolution Pokémon ex is Knocked Out, your opponent takes 3 Prize cards."],

	"EX": ["When your Pokémon-EX is Knocked Out, your opponent takes 2 Prize cards."],
	"mega-EX": ["When 1 of your Pokémon becomes  a Mega Evolution Pokémon, your turn ends."],

	"GX": ["When your Pokémon-GX is Knocked Out, your opponent takes 2 Prize cards."],
	"tag-GX": ["When your TAG TEAM is Knocked Out, your opponent takes 3 Prize cards."],

	"V": ["When your Pokémon V is Knocked Out, your opponent takes 2 Prize cards."],
	"VSTAR": ["When your Pokémon VSTAR is Knocked Out, your opponent takes 2 Prize cards."],
	"VMAX": ["When your Pokémon VMAX is Knocked Out, your opponent takes 3 Prize cards."],

	"ace-spec": ["You can't have more than 1 ACE SPEC card in your deck."],
	"item": ["You may play any number of Item cards during your turn."],
	"supporter": ["You may play only 1 Supporter card during your turn."],
	"tool": ["You may attach any number of Pokémon Tools to your Pokémon during your turn.",
		"You may attach only 1 Pokémon Tool to each Pokémon, and it stays attached."],
	"stadium": ["You may play only 1 Stadium card during your turn.",
		"Put it next to the Active Spot, and discard it if another Stadium comes into play.",
		"A Stadium with the same name can't be played."],
	"BREAK": ["{NAME} retains the attacks, Abilities, Weakness, Resistance and Retreat Cost of its previous evolution."],
	"prism-star": ["You can't have more than 1 PRISM STAR card with the same name in your deck.",
		"If a PRISM STAR card would go to the discard pile, put it in the Lost Zone instead."],
	"radiant": ["You can't have more than 1 Radiant Pokémon in your deck."]

};
export const CARD_TYPE_ACTIONS = [
	// Pokémon classifications
	["ex", "is:lcex -is:mega"],
	["mega-ex", "is:lcex is:mega"],
	["EX", "is:ucex -is:mega"],
	["mega-EX", "is:ucex is:mega"],
	["GX", "is:gx -is:tt"],
	["tag-GX", "is:gx is:tt"],
	["V", "is:v -is:vstar -is:vmax"],
	["VSTAR", "is:vstar"],
	["VMAX", "is:vmax"],
	["BREAK", "is:break"],
	["prism-star", "is:prism"],
	["radiant", "is:radiant"],

	// No additional rules; Pokémon classifications
	["single-strike", "is:ichigeki"],
	["rapid-strike", "is:rengeki"],
	["fusion-strike", "is:fusion"],
	["ultra-beast", "is:ub"],
	["team-plasma", "is:plasma"],

	// Trainers
	["item", "t:item"],
	["supporter", "t:supporter"],
	["tool", "t:tool"],
	["stadium", "t:stadium"],
	["energy", "t:energy"],
	["ace-spec", "is:ace"],

	// Energy subclasses
	["special-energy", "t:energy t:special"],
	["basic-energy", "t:energy -t:special"],
];
export let cardAdditionalTypes: Record<string, string[]> = {};

async function setCardsWithAdditionalTypes(additionalType: string, searchQuery: string) {
	const searchParams = new URLSearchParams({
		"q": searchQuery,
		"show": "all",
	});
	const url = `https://limitlesstcg.com/cards?${searchParams.toString()}`;
	const s = await getJqueryOfSite(url);
	s(".card-search-grid a").each((idx: number, el: Element) => {
		const url = s(el).attr("href");
		const parts = url.split("/");
		const id: string = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`;
		if (cardAdditionalTypes.hasOwnProperty(id)) {
			cardAdditionalTypes[id].push(additionalType);
		} else {
			cardAdditionalTypes[id] = [additionalType];
		}
	});
}

export async function populateCardAdditionalTypes() {
	// check whether card types need to be updated
	if (SAVED_DATA.hasOwnProperty("rulesAndCardTypes")) {
		// check whether card type actions has been updated
		if (SAVED_DATA["rulesAndCardTypes"].hasOwnProperty("cardTypeActions") && SAVED_DATA["rulesAndCardTypes"].hasOwnProperty("cachedTypes")) {
			if (JSON.stringify(SAVED_DATA["rulesAndCardTypes"]["cardTypeActions"]) === JSON.stringify(CARD_TYPE_ACTIONS)) {
				console.log("Using cached card types");
				cardAdditionalTypes = SAVED_DATA["rulesAndCardTypes"]["cachedTypes"] as Record<string, string[]>;
				return;
			}
		}
	}

	// update card types
	for (let i = 0; i < CARD_TYPE_ACTIONS.length; i++) {
		const [additionalType, searchQuery] = CARD_TYPE_ACTIONS[i];
		await setCardsWithAdditionalTypes(additionalType, searchQuery);
		drawProgressBar((i + 1) / CARD_TYPE_ACTIONS.length, `Getting ${additionalType} cards with ${searchQuery}`);
		await setTimeout(500);
	}
	// write to file to cache for next time
	SAVED_DATA["rulesAndCardTypes"] = {
		"cardTypeActions": CARD_TYPE_ACTIONS,
		"cachedTypes": cardAdditionalTypes,
	};
	saveData();
	console.log("Saved card types");
}