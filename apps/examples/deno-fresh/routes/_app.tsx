import type { ComponentChildren } from "preact";

export default function App({ Component }: { Component: () => ComponentChildren }) {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="description" content="Better Captcha demo with Deno Fresh" />
				<title>Better Captcha - Deno Fresh Demo</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			</head>
			<body class="antialiased">
				<Component />
			</body>
		</html>
	);
}
