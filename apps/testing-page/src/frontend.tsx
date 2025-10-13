/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const elem = document.getElementById("root");
if (!elem) {
	throw new Error("Root element not found");
}
const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

if (import.meta.hot) {
	const root = import.meta.hot.data.root ?? createRoot(elem);
	root.render(app);
} else {
	createRoot(elem).render(app);
}
