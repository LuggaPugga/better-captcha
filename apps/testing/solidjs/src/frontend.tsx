import { render } from "solid-js/web";
import App from "./app";

const elem = document.getElementById("app");
if (!elem) {
	throw new Error("Root element not found");
}

render(() => <App />, elem);
