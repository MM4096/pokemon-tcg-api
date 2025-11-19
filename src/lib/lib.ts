export function compareStrings(a: string, b: string): boolean {
	if (cleanString(a).toLowerCase() === cleanString(b).toLowerCase()) {
		return true;
	}
	return false
}

function cleanString(str: string): string {
	return str.replaceAll("é", "e").replace(/[^a-zA-Z0-9]/g, "");
}