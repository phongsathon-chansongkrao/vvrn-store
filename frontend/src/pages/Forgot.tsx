import React, { useState } from "react";
import { Field, btnPrimary } from "../components/forms";
import { Dialog } from "../components/Dialog";
import { AuthShell } from "./Auth";
import { api } from "../lib/api";

export function Forgot() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [devCode, setDevCode] = useState<any>(null);
  const [f, setF] = useState<any>({
    code: "",
    pw: "",
    pw2: "",
  });
  const [errs, setErrs] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setErrs({
        email: "Enter an email like name@example.com.",
      });
    setErrs({});
    setBusy(true);
    try {
      const r = await api("/auth/forgot", {
        body: {
          email: email.trim(),
        },
      });
      setDevCode(r.devCode || null);
      setStep(2);
    } catch (e2) {
      setErrs({
        email: e2.message,
      });
    } finally {
      setBusy(false);
    }
  };
  const reset = async (e) => {
    e.preventDefault();
    const x: any = {};
    if (!/^\d{6}$/.test(f.code.trim())) x.code = "The code is 6 digits.";
    if (f.pw.length < 6) x.pw = "Use at least 6 characters.";
    if (f.pw2 !== f.pw) x.pw2 = "Passwords don't match.";
    setErrs(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await api("/auth/reset", {
        body: {
          email: email.trim(),
          code: f.code.trim(),
          password: f.pw,
        },
      });
      setOk(true);
    } catch (e2) {
      setErrs({
        code: e2.message,
      });
    } finally {
      setBusy(false);
    }
  };
  const set = (k) => (e) =>
    setF((p) => ({
      ...p,
      [k]: e.target.value,
    }));
  const goLogin = () => {
    setOk(false);
    location.hash = "#/login";
  };
  return (
    <AuthShell
      title="Reset password"
      sub={
        step === 1
          ? "Enter your account email and we'll send you a 6-digit code."
          : `If an account exists for ${email}, we've sent a 6-digit code. It expires in 15 minutes.`
      }
    >
      {step === 1 ? (
        <form onSubmit={send} className="mt-8 space-y-4" noValidate>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={errs.email}
          />
          <button type="submit" disabled={busy} className={btnPrimary + " w-full"}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <>
          {devCode && (
            <div className="mt-6 border border-amber/50 bg-amber/5 p-4 text-[13px] text-bone/85">
              <p className="font-mono text-[11px] text-amber mb-1">DEVELOPMENT MODE</p>
              <p>
                {"Email isn't set up yet, so here's the code: "}
                <span className="font-mono text-amber text-[15px]">{devCode}</span>. This box never shows in production.
              </p>
            </div>
          )}
          <form onSubmit={reset} className="mt-6 space-y-4" noValidate>
            <Field
              label="6-digit code"
              value={f.code}
              onChange={set("code")}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              error={errs.code}
            />
            <Field
              label="New password"
              type="password"
              value={f.pw}
              onChange={set("pw")}
              autoComplete="new-password"
              error={errs.pw}
            />
            <Field
              label="Confirm new password"
              type="password"
              value={f.pw2}
              onChange={set("pw2")}
              autoComplete="new-password"
              error={errs.pw2}
            />
            <button type="submit" disabled={busy} className={btnPrimary + " w-full"}>
              {busy ? "Saving…" : "Reset password"}
            </button>
          </form>
          <button
            onClick={() => {
              setStep(1);
              setF({
                code: "",
                pw: "",
                pw2: "",
              });
              setErrs({});
              setDevCode(null);
            }}
            className="mt-4 text-[13px] text-ash underline underline-offset-4 hover:text-bone"
          >
            Use a different email
          </button>
        </>
      )}
      <p className="mt-6 text-[13px] text-bone/75">
        {"Remembered it? "}
        <a href="#/login" className="text-amber underline underline-offset-4">
          Log in
        </a>
      </p>
      <Dialog
        open={ok}
        icon="✓"
        title="Password updated"
        body="Log in with your new password."
        onClose={goLogin}
        actions={
          <button data-autofocus={true} onClick={goLogin} className={btnPrimary + " flex-1"}>
            OK
          </button>
        }
      />
    </AuthShell>
  );
}

/* =========================================================
   TRACK ORDER (works for guests too)
   ========================================================= */
