export const COLOR_CODES = {
	Reset: "\x1b[0m",
	Bright: "\x1b[1m",
	Dim: "\x1b[2m",
	Underscore: "\x1b[4m",
	Blink: "\x1b[5m",
	Reverse: "\x1b[7m",
	Hidden: "\x1b[8m",

	FgBlack: "\x1b[30m",
	FgRed: "\x1b[31m",
	FgGreen: "\x1b[32m",
	FgYellow: "\x1b[33m",
	FgBlue: "\x1b[34m",
	FgMagenta: "\x1b[35m",
	FgCyan: "\x1b[36m",
	FgWhite: "\x1b[37m",
	FgGray: "\x1b[90m",

	BgBlack: "\x1b[40m",
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m",
	BgWhite: "\x1b[47m",
	BgGray: "\x1b[100m",
}

export function drawProgressBar(percentage: number, additionalText: string = "", width: number = 20) {
	percentage = Math.min(Math.max(percentage, 0), 1);
	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	const filledNum = Math.floor(percentage * width);
	const unfilledNum = width - filledNum;
	process.stdout.write("|");
	process.stdout.write(COLOR_CODES.FgGreen + "=".repeat(filledNum) + COLOR_CODES.Reset);
	process.stdout.write(" ".repeat(unfilledNum));
	process.stdout.write("|");
	additionalText = ` ${additionalText} (${Math.round(percentage * 100)}%)`;
	process.stdout.write(additionalText);
	if (percentage === 1) {
		process.stdout.write("\n");
	}
}