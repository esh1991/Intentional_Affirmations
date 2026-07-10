import type { Metadata } from "next";
import { AccountPanel } from "@/components/auth/account-panel";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your Say This With Me account.",
};

export default function AccountPage() {
  return (
    <div data-mode="powerUp" className="relative isolate flex flex-1 flex-col">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 py-16">
        <h1 className="font-display text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Your account
        </h1>
        <div className="mt-10 flex w-full justify-center">
          <AccountPanel />
        </div>
      </main>
    </div>
  );
}
