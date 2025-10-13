export function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") {
		return "light";
	}
	const theme = window.matchMedia("(prefers-color-scheme: dark)");
	return theme.matches ? "dark" : "light";
}
