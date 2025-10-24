"use client";

import type { TurnstileHandle } from "@better-captcha/react/provider/turnstile";
import { Turnstile } from "@better-captcha/react/provider/turnstile";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface FormData {
	email: string;
	password: string;
	name: string;
}

export function AuthForm() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		email: "",
		password: "",
		name: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const turnstileRef = useRef<TurnstileHandle>(null);

	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();

	const updateFormData = useCallback((field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	}, []);

	const resetForm = useCallback(() => {
		setFormData({ email: "", password: "", name: "" });
		setError("");
		setSuccess("");
		turnstileRef.current?.reset();
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError("");
			setSuccess("");
			setLoading(true);

			try {
				const token = turnstileRef.current?.getResponse();
				if (!token) {
					throw new Error("Please complete the captcha verification");
				}

				if (isSignUp) {
					await authClient.signUp.email(
						{ ...formData },
						{
							onRequest: (ctx) => {
								ctx.headers.set("x-captcha-response", token);
							},
						},
					);
					setSuccess("Account created successfully! You can now sign in.");
				} else {
					await authClient.signIn.email(
						{ email: formData.email, password: formData.password },
						{
							onRequest: (ctx) => {
								ctx.headers.set("x-captcha-response", token);
							},
						},
					);
					setSuccess("Signed in successfully!");
				}

				resetForm();
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				turnstileRef.current?.reset();
			} finally {
				setLoading(false);
			}
		},
		[isSignUp, formData, resetForm],
	);

	const toggleMode = useCallback(() => {
		setIsSignUp(!isSignUp);
		resetForm();
	}, [isSignUp, resetForm]);

	const turnstileOptions = useMemo(
		() => ({
			theme: "auto" as const,
		}),
		[],
	);

	return (
		<div className="w-full max-w-sm mx-auto">
			<div className="space-y-6">
				<div className="text-center">
					<h2 className="text-lg font-medium text-foreground">{isSignUp ? "Create Account" : "Sign In"}</h2>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignUp && (
						<div>
							<Label htmlFor={nameId} className="text-sm text-muted-foreground">
								Name
							</Label>
							<Input
								id={nameId}
								type="text"
								value={formData.name}
								onChange={(e) => updateFormData("name", e.target.value)}
								required
								placeholder="John Doe"
								className="mt-1"
							/>
						</div>
					)}

					<div>
						<Label htmlFor={emailId} className="text-sm text-muted-foreground">
							Email
						</Label>
						<Input
							id={emailId}
							type="email"
							value={formData.email}
							onChange={(e) => updateFormData("email", e.target.value)}
							required
							placeholder="[email protected]"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor={passwordId} className="text-sm text-muted-foreground">
							Password
						</Label>
						<Input
							id={passwordId}
							type="password"
							value={formData.password}
							onChange={(e) => updateFormData("password", e.target.value)}
							required
							minLength={8}
							placeholder="••••••••"
							className="mt-1"
						/>
					</div>

					<div className="flex justify-center py-2">
						<Turnstile ref={turnstileRef} sitekey="1x00000000000000000000AA" options={turnstileOptions} />
					</div>

					{error && <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>}

					{success && (
						<div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-sm">{success}</div>
					)}

					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
					</Button>
				</form>

				<div className="text-center">
					<Button variant="link" type="button" onClick={toggleMode} className="text-sm text-muted-foreground">
						{isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
					</Button>
				</div>

				<div className="text-center text-xs text-muted-foreground">
					<p>
						This demo uses Cloudflare Turnstile with a test key that always passes. The captcha token is sent via the{" "}
						<code className="bg-muted px-1 rounded text-xs">x-captcha-response</code> header.
					</p>
				</div>
			</div>
		</div>
	);
}
