import React, { useState } from "react";
import { Field, btnPrimary } from "../components/forms";
import { OrderDetails, StatusPill, Timeline } from "../components/Orders";
import { AuthCtx } from "../lib/context";
import { api } from "../lib/api";

export function Track({ initialNo }: any) {
  const auth = React.useContext(AuthCtx);
  const [q, setQ] = useState<any>({
    no: initialNo || "", // from the "Track your order" link in emails
    email: "",
  });
  const [found, setFound] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!q.no.trim() || !q.email.trim()) return setErr("Enter your order number and email.");
    setBusy(true);
    try {
      const o = await api(
        `/orders/track?no=${encodeURIComponent(q.no.trim())}&email=${encodeURIComponent(q.email.trim())}`
      );
      setErr("");
      setFound(o);
    } catch (e2) {
      setErr(e2.message);
      setFound(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-14 lg:py-20">
      <div className="mx-auto max-w-[720px]">
        <h1 className="font-display text-[56px] lg:text-[64px] leading-[0.9] text-bone">Track order</h1>
        <p className="mt-3 text-[14px] text-bone/70">
          Enter the order number from your confirmation and the email you checked out with.
        </p>
        {auth.user && (
          <p className="mt-2 text-[13px] text-ash">
            {"Your orders are also in "}
            <a href="#/account" className="text-amber underline underline-offset-4">
              your account
            </a>
            .
          </p>
        )}
        <form
          onSubmit={submit}
          className="mt-8 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
          noValidate
        >
          <Field
            label="Order number"
            value={q.no}
            onChange={(e) =>
              setQ((p) => ({
                ...p,
                no: e.target.value,
              }))
            }
            placeholder="VV-XXXXXXXX"
          />
          <Field
            label="Email"
            type="email"
            value={q.email}
            onChange={(e) =>
              setQ((p) => ({
                ...p,
                email: e.target.value,
              }))
            }
            autoComplete="email"
          />
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "Finding…" : "Track"}
          </button>
        </form>
        {err && (
          <p role="alert" className="mt-3 text-[13px] text-red-300">
            {err}
          </p>
        )}
        {found && (
          <section className="mt-10 border border-line p-6">
            <div className="flex flex-wrap items-center gap-4 pb-5 mb-6 border-b border-line">
              <span className="font-mono text-[15px] text-bone">{found.no}</span>
              <StatusPill o={found} />
              <span className="ml-auto text-[13px] text-ash">
                {new Date(found.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Timeline o={found} />
              <OrderDetails o={found} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
