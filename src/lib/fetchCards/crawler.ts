import Crawler from "crawler";

export const crawler = new Crawler({
	retries: 5,
	timeout: 30000,
});

export async function getJqueryOfSite(url: string) {
	const response = await crawler.send(url);
	return response.$;
}