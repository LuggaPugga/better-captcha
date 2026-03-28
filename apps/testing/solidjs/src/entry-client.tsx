// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: id is guaranteed to be present
mount(() => <StartClient />, document.getElementById("app")!);
