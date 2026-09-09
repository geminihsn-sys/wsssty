"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/inputs";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLang } from "@/components/providers/LanguageProvider";

function LoginForm() {
  const { t } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }
      router.replace(from);
      router.refresh();
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line text-bronze">
          <Lock className="h-5 w-5" />
        </span>
        <h1 className="mt-5 font-serif text-3xl">{t.admin.login.title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{t.admin.login.subtitle}</p>
      </div>

      <Field label={t.admin.login.password} htmlFor="password" error={error ? t.admin.login.wrong : undefined}>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.admin.login.passwordPlaceholder}
          invalid={error}
          autoFocus
          autoComplete="current-password"
        />
      </Field>

      <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
        {loading ? t.admin.login.signingIn : t.admin.login.signIn}
      </Button>

      <Link
        href="/"
        className="mt-6 block text-center text-sm text-ink-soft underline-offset-4 hover:underline"
      >
        {t.admin.login.backToStore}
      </Link>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="flex justify-end p-5">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-5 pb-24">
        <Suspense fallback={<div className="h-64" aria-busy />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
