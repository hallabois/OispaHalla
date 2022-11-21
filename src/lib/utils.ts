export const json_headers = {
	"Content-Type": "application/json",
	"OH-Version": __APP_VERSION__
};

export function numberWithSpaces(x: number): string {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
