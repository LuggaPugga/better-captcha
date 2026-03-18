export { type GeetestHandle, GeetestProvider } from "./provider";

import type { Geetest, RenderParameters as GeetestInitParameters } from "./types";

export type RenderParameters = Omit<GeetestInitParameters, "captchaId">;
export type GeetestSolveResponse = Geetest.ValidateResult;
