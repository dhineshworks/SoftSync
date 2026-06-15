import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: Auth,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8, "At least 8 characters").max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function Auth() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { token, user } = await api.register(parsed.data);
        setSession(token, user);
        toast.success("Account created — you're signed in");
      } else {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { token, user } = await api.login(parsed.data);
        setSession(token, user);
        toast.success("Welcome back");
      }
      navigate({ to: redirect || "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Account</p>
        <h1 className="mt-2 text-4xl">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" ? "Sign in to checkout and track orders." : "It takes 30 seconds."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        {mode === "signup" && (
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </div>
        <Button type="submit" disabled={loading} size="lg" className="w-full rounded-full">
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-foreground underline underline-offset-4">
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
