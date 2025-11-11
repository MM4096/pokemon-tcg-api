import * as fs from "node:fs";
import path from "node:path";

export type SAVED_DATA_TYPE = {
	lastUpdated: number,
	crashPoint: [number, number],
	rulesAndCardTypes: Record<string, unknown>,
};

export let SAVED_DATA: SAVED_DATA_TYPE = {
	lastUpdated: 0,
	crashPoint: [0, 0],
	rulesAndCardTypes: {},
};

export function getSavedData() {
	if (fs.existsSync(path.join(process.cwd(), "public", "cachedData.json"))) {

		const tempData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "cachedData.json"), "utf-8"));

		SAVED_DATA = {...SAVED_DATA, ...tempData};

		if (tempData.hasOwnProperty("lastUpdated")) {
			SAVED_DATA["lastUpdated"] = Date.parse(tempData);
		}
	}
}

export function saveData() {
	fs.writeFileSync(path.join(process.cwd(), "public", "cachedData.json"), JSON.stringify(SAVED_DATA, null, 2));
}