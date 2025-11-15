import {ADDITIONAL_RULES} from "@/lib/fetchCards/rulesAndCardTypes";
import {getJqueryOfSite} from "@/lib/fetchCards/crawler";
import {cardAdditionalTypes} from "@/lib/fetchCards/rulesAndCardTypes";

export type PokemonAttack = {
	name: string,
	damage: string,
	cost: string,
	effect: string,
}

export type PokemonAbility = {
	name: string,
	effect: string,
}

export type PokemonData = {
	pokemonType?: string,
	hp?: string,
	stage?: string,
	evolvesFrom?: string,
	attacks?: PokemonAttack[],
	abilities?: PokemonAbility[],
	weakness?: string,
	resistance?: string,
	retreatCost?: number,
}

export type Card = {
	name: string,
	type: string,
	subtype?: string,
	additionalRules: string[],
	imageURL: string,
	categories: string[],

	// pokemon data
	pokemonData?: PokemonData,
	text?: string,
}

export type CollapsedCard = Card & {
	set: string,
	id: string | number,
}

// cards that Limitless doesn't render properly
export const BROKEN_CARDS: Record<string, Card> = {

}

export async function getCard(url: string, cardId: string | number): Promise<Card> {
	if (BROKEN_CARDS.hasOwnProperty(cardId)) {
		console.log(`Broken card ${cardId} found, using cached data`);
		return BROKEN_CARDS[cardId];
	}

	const c = await getJqueryOfSite(url);

	const pokemonData: PokemonData = {};
	let cardType = "";
	let cardSubtype = "";
	let cardText = "";

	// do types first to see if it's a pokemon
	// collapse spaces, newlines, and trim
	let typeLine = "";
	try {
		typeLine = c(".card-text-type").text().trim().replaceAll(/ +/g, " ").replaceAll("\n", "");
	} catch {
		throw new Error(`Error getting type line for ${cardId}: Type line not found / invalid.`);
	}
	const parts = typeLine.split(" - ");

	const isPokemon = /Pok.mon/g.test(parts[0]);

	// get types
	if (isPokemon) {
		cardType = parts[0];
		pokemonData.stage = parts[1].trim();

		// pokemon could be basic
		if (parts.length > 2) {
			pokemonData.evolvesFrom = parts[2].replaceAll("Evolves from ", "").trim();
		}
	} else {
		const parts = typeLine.split(" - ");
		cardType = parts[0];
		if (parts.length > 1) {
			parts.shift();
			cardSubtype = parts.join(" - ");
		}
	}

	// name block is with the format: `NAME\n          - TYPE        - XX HP`
	const nameBlock = c(".card-text-title").text().trim();

	// eslint-disable-next-line prefer-const
	let [name, typeSplit] = nameBlock.split("\n");
	if (isPokemon) {
		typeSplit = typeSplit.replaceAll(/ +- ?/g, "-").split("-");
		typeSplit.shift();

		pokemonData.pokemonType = typeSplit[0];
		pokemonData.hp = typeSplit[1].replace(/ ?HP/g, "");
	}

	const cs = c(".card-text-section").eq(1);
	// get text
	if (isPokemon) {
		try {
			const wrrText = c(".card-text-wrr").text().trim().split("\n");
			const weakness = wrrText[0].split(":")[1].trim();
			const resistance = wrrText[1].split(":")[1].trim();
			const retreatCost = parseInt(wrrText[2].split(":")[1].trim());
			pokemonData.weakness = weakness === "none" ? "" : weakness;
			pokemonData.resistance = resistance === "none" ? "" : resistance;
			pokemonData.retreatCost = retreatCost;
		} catch {
			pokemonData.weakness = "none";
			pokemonData.resistance = "none";
			pokemonData.retreatCost = 0;
		}
	} else {
		// second section contains text
		cardText = cs
			// remove potential attacks
			.clone()
			.find(".card-text-attack")
			.remove()
			.end()
			// get text
			.text().trim();
	}
	//region get attacks/abilities
	cs.children(".card-text-ability").each((idx: number, el: Element) => {
		const elem = c(el);
		// ignore the leading `Ability: `
		let ability = elem.children(".card-text-ability-info").text().trim();
		if (ability.startsWith("Ability: ")) {
			ability = ability.split("\n")[1].trim();
		}
		const abilityText = elem.children(".card-text-ability-effect").text().trim().replaceAll("[", "{").replaceAll("]", "}");
		if (pokemonData.abilities) {
			pokemonData.abilities.push({
				name: ability,
				effect: abilityText,
			});
		} else {
			pokemonData.abilities = [{name: ability, effect: abilityText}];
		}
	});
	cs.children(".card-text-attack").each((idx: number, el: Element) => {
		const elem = c(el);
		const attackInfo: string[] = elem.children(".card-text-attack-info").text().trim().split("\n");
		const attackEffect = elem.children(".card-text-attack-effect").text().trim().replaceAll("[", "{").replaceAll("]", "}");
		const attackCost = attackInfo[0].trim();
		// check whether damage exists

		let attackName = attackInfo[1].trim();
		let attackDamage = "";
		const split = attackName.split(" ");
		if (/[0-9]+[+-]?/.test(split[split.length - 1])) {
			// last elem is damage
			attackDamage = split.pop() || "";
		}
		attackName = split.join(" ");

		if (pokemonData.attacks) {
			pokemonData.attacks.push({
				name: attackName,
				damage: attackDamage,
				cost: attackCost,
				effect: attackEffect,
			});
		} else {
			pokemonData.attacks = [{
				name: attackName,
				damage: attackDamage,
				cost: attackCost,
				effect: attackEffect,
			}]
		}
	});
	//endregion

	const cardImage = c(".card-image img").attr("src");

	let card: Card = {
		name: name.trim(),
		type: cardType.trim(),
		subtype: cardSubtype.trim(),
		additionalRules: [],
		imageURL: cardImage,
		categories: [],
	};
	if (isPokemon) {
		card = {...card, pokemonData: pokemonData};
	} else {
		card = {...card, text: cardText};
		if (JSON.stringify({}) != JSON.stringify(pokemonData)) {
			card = {...card, pokemonData: pokemonData};
		}
	}
	if (cardAdditionalTypes.hasOwnProperty(cardId)) {
		card.categories = cardAdditionalTypes[cardId];
	}

	if (cardAdditionalTypes.hasOwnProperty(cardId)) {
		for (const additionalType of cardAdditionalTypes[cardId]) {
			if (ADDITIONAL_RULES.hasOwnProperty(additionalType)) {
				card.additionalRules.push(...ADDITIONAL_RULES[additionalType]);
			}
		}
	}

	return card;
}