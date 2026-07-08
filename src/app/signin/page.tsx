import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to back up your streaks and journeys across devices. Practicing never requires an account.",
};

export default function SignInPage() {
  return (
    <div data-mode="powerUp" className="relative isolate flex flex-1 flex-col">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-16">
        <h1 className="font-display text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Keep your streak everywhere
        </h1>
        <p className="mt-3 max-w-sm text-center text-pretty text-muted-foreground">
          Sign in to back up your streaks and journeys and pick up on any
          device. No account is ever required to practice.
        </p>
        <div className="mt-10 flex w-full justify-center">
          <SignInForm />
        </div>
      </main>
    </div>
  );
}
