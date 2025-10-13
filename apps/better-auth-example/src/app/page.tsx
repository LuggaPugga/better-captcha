"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AuthForm } from "@/components/auth-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const { data: session } = authClient.useSession();

	const sessionAlert = useMemo(() => {
		if (!session) return null;

		return (
			<Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
				<AlertDescription>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
							<span className="text-green-600 dark:text-green-400">✓</span>
						</div>
						<div>
							<span className="font-semibold text-green-800 dark:text-green-200">
								Welcome back, {session.user.name || session.user.email}!
							</span>
							<p className="text-sm text-green-700 dark:text-green-300 mt-1">
								You are currently signed in and ready to go.
							</p>
						</div>
					</div>
				</AlertDescription>
			</Alert>
		);
	}, [session]);

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-background">
			<div className="w-full max-w-3xl">
				<Alert variant="destructive" className="mb-6">
					<AlertTitle>Test Mode Active</AlertTitle>
					<AlertDescription>
						This demo uses Cloudflare Turnstile test keys that always pass validation.
					</AlertDescription>
				</Alert>

				{sessionAlert}

				<div className="text-center mb-10">
					<h1 className="text-5xl font-bold mb-4 text-foreground">Better Auth + React Captcha</h1>
					<p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
						Secure authentication with Cloudflare Turnstile integration. Experience modern, privacy-focused captcha
						protection that's both powerful and user-friendly.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-6 text-sm">
						<Button asChild variant="outline" className="group">
							<Link href="https://github.com/LuggaPugga/react-captcha" target="_blank" rel="noopener noreferrer">
								<span className="text-lg">📦</span>
								<span className="font-medium">React Captcha Library</span>
							</Link>
						</Button>
						<Button asChild variant="outline" className="group">
							<Link
								href="https://github.com/LuggaPugga/react-captcha/tree/main/apps/better-auth-example"
								target="_blank"
								rel="noopener noreferrer"
							>
								<span className="text-lg">🔗</span>
								<span className="font-medium">Demo Source Code</span>
							</Link>
						</Button>
					</div>
				</div>

				<div className="bg-card rounded-2xl shadow-xl border border-border p-8">
					<AuthForm />
				</div>
			</div>
		</div>
	);
}
