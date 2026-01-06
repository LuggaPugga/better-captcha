import { render } from "preact";
import { App } from "./app.tsx";

const rootElement = document.getElementById("app");
if (!rootElement) {
	throw new Error('Failed to find root element with id "app"');
}
render(<App />, rootElement);
