import React, { useState } from "react";
import { Field, btnPrimary } from "../components/forms";
import { Dialog } from "../components/Dialog";
import { AuthCtx } from "../lib/context";

export function AuthShell({ title, sub, children }: any) {
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-14 lg:py-20">
      <div className="mx-auto max-w-[420px]">
        <h1 className="font-display text-[56px] lg:text-[64px] leading-[0.9] text-bone">{title}</h1>
        {sub && <p className="mt-3 text-[14px] text-bone/70">{sub}</p>}
        {children}
      </div>
    </main>
  );
}

export function Login({ next }: any) {
  const auth = React.useContext(AuthCtx);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await auth.login(email.trim(), pw);
    setBusy(false);
    if (r) setErr(r);
    else location.hash = "#/" + (next || "account");
  };
  return (
    <AuthShell title="Log in" sub="See your orders and check out faster.">
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
        />
        <div className="text-right -mt-1">
          <a href="#/forgot" className="text-[12px] text-ash underline underline-offset-4 hover:text-amber">
            Forgot password?
          </a>
        </div>
        {err && (
          <p role="alert" className="text-[13px] text-red-300">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy} className={btnPrimary + " w-full"}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-[13px] text-bone/75">
        {"New to VVRN? "}
        <a href={"#/register" + (next ? "?next=" + next : "")} className="text-amber underline underline-offset-4">
          Create an account
        </a>
      </p>
    </AuthShell>
  );
}

export function Register({ next }: any) {
  const auth = React.useContext(AuthCtx);
  const [f, setF] = useState<any>({
    name: "",
    email: "",
    pw: "",
    pw2: "",
  });
  const [errs, setErrs] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) =>
    setF((p) => ({
      ...p,
      [k]: e.target.value,
    }));
  const submit = async (e) => {
    e.preventDefault();
    const x: any = {};
    if (!f.name.trim()) x.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = "Enter an email like name@example.com.";
    if (f.pw.length < 6) x.pw = "Use at least 6 characters.";
    if (f.pw2 !== f.pw) x.pw2 = "Passwords don't match.";
    setErrs(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    const r = await auth.register(f.name.trim(), f.email.trim(), f.pw);
    setBusy(false);
    if (r)
      setErrs({
        email: r,
      });
    else setDone(true);
  };
  const goOn = () => {
    setDone(false);
    location.hash = "#/" + (next || "account");
  };
  return (
    <AuthShell title="Create account" sub="Keep your order history and saved address in one place.">
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Field label="Name" value={f.name} onChange={set("name")} autoComplete="name" error={errs.name} />
        <Field
          label="Email"
          type="email"
          value={f.email}
          onChange={set("email")}
          autoComplete="email"
          error={errs.email}
        />
        <Field
          label="Password"
          type="password"
          value={f.pw}
          onChange={set("pw")}
          autoComplete="new-password"
          error={errs.pw}
        />
        <Field
          label="Confirm password"
          type="password"
          value={f.pw2}
          onChange={set("pw2")}
          autoComplete="new-password"
          error={errs.pw2}
        />
        <button type="submit" disabled={busy} className={btnPrimary + " w-full"}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-[13px] text-bone/75">
        {"Already have an account? "}
        <a href={"#/login" + (next ? "?next=" + next : "")} className="text-amber underline underline-offset-4">
          Log in
        </a>
      </p>
      <Dialog
        open={done}
        icon="✓"
        title="Registration complete"
        body={`Welcome to VVRN, ${f.name.trim().split(" ")[0]}. You're logged in and your orders will be saved to your account.`}
        onClose={goOn}
        actions={
          <button data-autofocus={true} onClick={goOn} className={btnPrimary + " flex-1"}>
            OK
          </button>
        }
      />
    </AuthShell>
  );
}

/* =========================================================
   ACCOUNT + ORDER HISTORY
   ========================================================= */
