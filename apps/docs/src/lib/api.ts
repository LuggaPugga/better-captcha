export async function getGithubStars() {
	const response = await fetch("https://api.github.com/repos/LuggaPugga/better-captcha", {
		next: { revalidate: 60 * 60 },
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
	})
		.then((res) => (res.ok ? (res.json() as Promise<{ stargazers_count: number }>) : { stargazers_count: 0 }))
		.catch(() => ({ stargazers_count: 0 }));

	return response.stargazers_count;
}

export async function getNpmDownloads() {
	const packages = ["react", "solid"];

	const promises = packages.map((pkg) =>
		fetch(`https://api.npmjs.org/downloads/point/last-week/@better-captcha/${pkg}`, {
			next: { revalidate: 60 * 60 },
		})
			.then((res) => (res.ok ? (res.json() as Promise<{ downloads: number }>) : { downloads: 0 }))
			.catch(() => ({ downloads: 0 })),
	);

	const results = await Promise.all(promises);
	return results.reduce((total, result) => total + (result.downloads || 0), 0);
}
