import React, { useState, useEffect } from "react";
import { Stars } from "./ui";
import { btnPrimary } from "./forms";
import { AuthCtx, ShopCtx } from "../lib/context";
import { api } from "../lib/api";

export function Reviews({ p }: any) {
  const shop = React.useContext(ShopCtx);
  const auth = React.useContext(AuthCtx);
  const [list, setList] = useState<any>(null);
  const [loadErr, setLoadErr] = useState("");
  const [sort, setSort] = useState("new");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () =>
    api(`/products/${p.id}/reviews`)
      .then((r) => {
        setList(r);
        setLoadErr("");
      })
      .catch((e) => setLoadErr(e.message));
  useEffect(() => {
    setList(null);
    load();
  }, [p.id, auth.user && auth.user.id]);
  const all = list || [];
  const count = all.length;
  const avg = count ? all.reduce((s, r) => s + r.rating, 0) / count : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => [s, all.filter((r) => r.rating === s).length]);
  const boughtItem = auth.user && auth.orders.flatMap((o) => o.items).find((it) => it.id === p.id);
  const already = all.some((r) => r.mine);
  const sorted = [...all].sort(
    sort === "new"
      ? (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      : sort === "high"
        ? (a, b) => b.rating - a.rating
        : (a, b) => a.rating - b.rating
  );
  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setErr("Choose a star rating.");
    if (text.trim().length < 10) return setErr("Write at least 10 characters.");
    setBusy(true);
    try {
      await api(`/products/${p.id}/reviews`, {
        body: {
          rating,
          text: text.trim(),
        },
      });
      setRating(0);
      setText("");
      setErr("");
      await load();
      shop.refresh();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };
  let writeBox;
  if (!auth.user)
    writeBox = (
      <p className="text-[13px] text-bone/75">
        {"Bought this? "}
        <a href="#/login" className="text-amber underline underline-offset-4">
          Log in
        </a>
        {" to leave a review."}
      </p>
    );
  else if (!boughtItem)
    writeBox = <p className="text-[13px] text-ash">Only customers who bought this item can review it.</p>;
  else if (already) writeBox = <p className="text-[13px] text-bone/75">Thanks, you've already reviewed this item.</p>;
  else
    writeBox = (
      <form onSubmit={submit} className="space-y-3">
        <p className="text-[13px] text-bone">Write a review</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className={"text-[26px] leading-none " + (n <= (hover || rating) ? "text-amber" : "text-white/20")}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="How's the fit, fabric and color?"
          aria-label="Your review"
          className="w-full p-3 bg-transparent border border-line text-[14px] text-bone placeholder:text-white/25 outline-none focus:border-amber"
        />
        {err && (
          <p role="alert" className="text-[12px] text-red-300">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy} className={btnPrimary + " w-full"}>
          {busy ? "Posting…" : "Post review"}
        </button>
      </form>
    );
  return (
    <section
      id="reviews"
      className="mt-20 lg:mt-28 border-t border-line pt-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-16"
    >
      <div>
        <h2 className="font-display text-[40px] leading-none text-bone">Reviews</h2>
        {list === null && !loadErr ? (
          <p className="mt-4 text-[14px] text-ash">Loading reviews…</p>
        ) : loadErr ? (
          <p className="mt-4 text-[14px] text-red-300">{loadErr}</p>
        ) : count === 0 ? (
          <p className="mt-4 text-[14px] text-ash">No reviews yet.</p>
        ) : (
          <>
            <div className="mt-5 flex items-end gap-4">
              <span className="font-display text-[80px] leading-[0.8] text-bone">{avg.toFixed(1)}</span>
              <div className="pb-1">
                <Stars value={avg} size={18} />
                <p className="mt-1 text-[12px] text-ash">{`${count} review${count === 1 ? "" : "s"}`}</p>
              </div>
            </div>
            <ul className="mt-6 space-y-1.5">
              {dist.map(([s, n]) => (
                <li key={s} className="flex items-center gap-3 text-[12px] text-ash">
                  <span className="w-6">{s + "★"}</span>
                  <span className="flex-1 h-1.5 bg-white/10">
                    <span
                      className="block h-full bg-amber"
                      style={{
                        width: (count ? (n / count) * 100 : 0) + "%",
                      }}
                    />
                  </span>
                  <span className="w-5 text-right font-mono">{n}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-8 border border-line p-5">{writeBox}</div>
      </div>
      <div>
        {count > 0 && (
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-[12px] text-ash">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 px-3 bg-ink border border-line text-bone text-[12px] outline-none focus:border-amber"
              >
                <option value="new">Newest</option>
                <option value="high">Highest rating</option>
                <option value="low">Lowest rating</option>
              </select>
            </label>
          </div>
        )}
        {count > 0 && (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {sorted.map((r) => (
              <li key={r.id} className="py-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} size={14} />
                  <span className="text-[13px] text-bone font-medium">{r.name}</span>
                  {r.verified && <span className="text-[11px] font-mono text-amber">Verified buyer</span>}
                  <span className="ml-auto text-[12px] text-ash">
                    {new Date(r.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {r.color && <p className="mt-1 text-[12px] text-ash">{`${r.color} / ${r.size}`}</p>}
                <p className="mt-3 text-[14px] leading-[1.65] text-bone/85 max-w-[70ch]">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   PRODUCT DETAIL
   ========================================================= */
