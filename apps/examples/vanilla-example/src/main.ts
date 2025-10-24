/** biome-ignore-all lint/style/noNonNullAssertion: <Element are there> */
import "./style.css";
import { type RenderParameters, Turnstile, type TurnstileHandle } from "@better-captcha/lit/provider/turnstile";

Turnstile;

type TurnstileCaptchaElement = Element & {
	getHandle: () => TurnstileHandle;
	options: Omit<RenderParameters, "sitekey">;
};

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="login-container">
    <h1>Login Form</h1>
    <p class="subtitle">Vanilla TypeScript + Lit CAPTCHA Example</p>
    
    <form id="login-form" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Enter your password"
          required
        />
      </div>
      
      <div class="form-group captcha-container">
        <turnstile-captcha
          id="captcha"
          sitekey="1x00000000000000000000AA"
        ></turnstile-captcha>
      </div>
      
      <button type="submit" class="submit-btn">Login</button>
      
      <div id="response-message" class="response-message"></div>
    </form>
    
    <div class="controls">
      <h3>CAPTCHA Controls</h3>
      <div class="control-buttons">
        <button type="button" id="reset-btn" class="control-btn">Reset CAPTCHA</button>
        <button type="button" id="execute-btn" class="control-btn">Execute CAPTCHA</button>
        <button type="button" id="theme-btn" class="control-btn">Toggle Theme</button>
      </div>
    </div>
  </div>
`;

// Get references to elements
const form = document.querySelector<HTMLFormElement>("#login-form")!;
const captchaElement = document.querySelector<TurnstileCaptchaElement>("#captcha")!;
const responseMessage = document.querySelector<HTMLDivElement>("#response-message")!;
const resetBtn = document.querySelector<HTMLButtonElement>("#reset-btn")!;
const executeBtn = document.querySelector<HTMLButtonElement>("#execute-btn")!;
const themeBtn = document.querySelector<HTMLButtonElement>("#theme-btn")!;

let currentTheme: "light" | "dark" | "auto" = "light";

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const captchaResponse = captchaElement.getHandle().getResponse();

	if (!captchaResponse) {
		responseMessage.textContent = "Please complete the CAPTCHA";
		responseMessage.className = "response-message error";
		return;
	}

	responseMessage.textContent = "Logging in...";
	responseMessage.className = "response-message info";

	setTimeout(() => {
		responseMessage.textContent = `Login successful! CAPTCHA Token: ${captchaResponse.substring(0, 20)}...`;
		responseMessage.className = "response-message success";

		setTimeout(() => {
			form.reset();
			captchaElement.getHandle().reset();
			responseMessage.className = "response-message";
			responseMessage.textContent = "";
		}, 3000);
	}, 1000);
});

resetBtn.addEventListener("click", () => {
	captchaElement.getHandle().reset();
	responseMessage.textContent = "CAPTCHA reset";
	responseMessage.className = "response-message info";
	setTimeout(() => {
		responseMessage.className = "response-message";
		responseMessage.textContent = "";
	}, 2000);
});

executeBtn.addEventListener("click", async () => {
	await captchaElement.getHandle().execute();
	responseMessage.textContent = "CAPTCHA executed";
	responseMessage.className = "response-message info";
	setTimeout(() => {
		responseMessage.className = "response-message";
		responseMessage.textContent = "";
	}, 2000);
});

themeBtn.addEventListener("click", () => {
	const themes: Array<"light" | "dark" | "auto"> = ["light", "dark", "auto"];
	const currentIndex = themes.indexOf(currentTheme);
	const nextIndex = (currentIndex + 1) % themes.length;
	currentTheme = themes[nextIndex];

	captchaElement.setAttribute("options", JSON.stringify({ theme: currentTheme }));
	captchaElement.options = { theme: currentTheme };

	responseMessage.textContent = `Theme changed to: ${currentTheme}`;
	responseMessage.className = "response-message info";
	setTimeout(() => {
		responseMessage.className = "response-message";
		responseMessage.textContent = "";
	}, 2000);
});
