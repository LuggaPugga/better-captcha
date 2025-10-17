export async function getGithubStars() {
	const response = await fetch("https://api.github.com/repos/LuggaPugga/better-captcha", {
		next: { revalidate: 60 * 10 },
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
	})
		.then((res) => (res.ok ? (res.json() as Promise<{ stargazers_count: number }>) : { stargazers_count: 0 }))
		.catch(() => ({ stargazers_count: 0 }));

	return response.stargazers_count;
}

export async function getNpmDownloads() {
	const response = await fetch(`https://api.npmjs.org/downloads/point/last-week/@better-captcha/core`, {
		next: { revalidate: 60 * 10 },
	})
		.then((res) => (res.ok ? (res.json() as Promise<{ downloads: number }>) : { downloads: 0 }))
		.catch(() => ({ downloads: 0 }));

	return response.downloads;
}
