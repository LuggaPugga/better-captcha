import { useCaptchaController } from "@better-captcha/qwik";
import {
	FriendlyCaptcha,
	type FriendlyCaptchaHandle,
	type RenderParameters,
} from "@better-captcha/qwik/provider/friendly-captcha";
import { component$, useSignal } from "@builder.io/qwik";

export const FriendlyCaptchaTest = component$(() => {
	const controller = useCaptchaController<FriendlyCaptchaHandle>();
	const options = useSignal<Omit<RenderParameters, "sitekey" | "element">>({
		theme: "light",
		startMode: "focus",
	});
	const response = useSignal<string | null>(null);

	return (
		<div>
			<FriendlyCaptcha
				controller={controller}
				options={options.value}
				sitekey="FC-00000000-0000-0000-0000-000000000000"
			/>
			<button
				type="button"
				onClick$={() => {
					controller.value?.destroy();
				}}
			>
				Destroy
			</button>
			<button
				type="button"
				onClick$={() => {
					controller.value?.reset();
				}}
			>
				Reset
			</button>
			<button
				type="button"
				onClick$={() => {
					controller.value?.execute();
				}}
			>
				Execute
			</button>
			<button
				type="button"
				onClick$={async () => {
					await controller.value?.render();
				}}
			>
				Render
			</button>
			<button
				type="button"
				onClick$={() => {
					const captchaResponse = controller.value?.getResponse() || "No response";
					response.value = captchaResponse;
				}}
			>
				Get Response
			</button>
			<button
				type="button"
				onClick$={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options.value.theme || "auto");
					const nextIndex = (currentIndex + 1) % themes.length;
					options.value = { ...options.value, theme: themes[nextIndex] as RenderParameters["theme"] };
				}}
			>
				Change Theme
			</button>
			{response.value && <p id="captcha-response">{response.value}</p>}
		</div>
	);
});
