import React, { useState, useRef } from "react";
import { Field, Radio, SelectField, btnGhost, btnPrimary } from "../components/forms";
import { AuthShell } from "./Auth";
import { DemoQR } from "../components/DemoQR";
import { OrderSummary, discountOff } from "../components/OrderSummary";
import { COUNTRIES, EMPTY_ADDR, SHIPPING, money } from "../lib/data";
import { findProduct } from "../lib/catalog";
import { AuthCtx, ShopCtx } from "../lib/context";
import { api } from "../lib/api";

export function StepShell({ n, title, open, done, summary, onEdit, children }: any) {
  return (
    <section className="border border-line">
      <div className="flex items-center justify-between gap-4 px-5 lg:px-6 py-4">
        <h2 className={"flex items-center gap-3 text-[15px] font-medium " + (open || done ? "text-bone" : "text-ash")}>
          <span
            className={
              "w-7 h-7 grid place-items-center font-mono text-[12px] border " +
              (done ? "bg-amber border-amber text-noir" : open ? "border-amber text-amber" : "border-line text-ash")
            }
          >
            {done ? "✓" : n}
          </span>
          {title}
        </h2>
        {done && !open && (
          <button onClick={onEdit} className="text-[12px] text-amber underline underline-offset-4">
            Edit
          </button>
        )}
      </div>
      {done && !open && summary && (
        <div className="px-5 lg:px-6 pb-4 -mt-1 pl-[60px] lg:pl-[64px] text-[13px] text-bone/75 leading-[1.6]">
          {summary}
        </div>
      )}
      {open && <div className="px-5 lg:px-6 pb-6 pt-1 border-t border-line">{children}</div>}
    </section>
  );
}

export function Checkout({ items, onPlaced }: any) {
  const auth = React.useContext(AuthCtx);
  const shop = React.useContext(ShopCtx);
  const saved = auth.user ? auth.user.address : null;
  const [step, setStep] = useState(1);
  const [done, setDone] = useState<any>({
    1: false,
    2: false,
    3: false,
  });
  const [addr, setAddr] = useState<any>(
    saved || {
      ...EMPTY_ADDR,
      name: auth.user ? auth.user.name : "",
      email: auth.user ? auth.user.email : "",
    }
  );
  const [saveAddr, setSaveAddr] = useState(true);
  const [ship, setShip] = useState("standard");
  const [pay, setPay] = useState("card");
  const [card, setCard] = useState<any>({
    number: "",
    name: "",
    exp: "",
    cvv: "",
  });
  const [slip, setSlip] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [placing, setPlacing] = useState(false);
  const [discount, setDiscount] = useState<{ code: string; percentOff: number } | null>(null);
  // Logging out drops the code (codes are per account)
  React.useEffect(() => {
    if (!auth.user) setDiscount(null);
  }, [auth.user]);
  const fileRef = useRef(null);
  const shipping = SHIPPING.find((s) => s.id === ship);
  const subtotal = items.reduce((s, it) => s + findProduct(it.id).price * it.qty, 0);
  const total = subtotal - (discount ? discountOff(subtotal, discount.percentOff) : 0) + shipping.fee;
  /** Returns an error message, or null when the code was accepted. */
  const applyCode = async (code: string) => {
    try {
      setDiscount(await api<{ code: string; percentOff: number }>("/discounts/check", { body: { code } }));
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  };
  // Ordering needs an account (the backend refuses guest orders too). The cart stays in this browser.
  if (!auth.user) {
    return (
      <AuthShell title="Checkout" sub="Log in or create an account to place your order. Your cart will be waiting.">
        <div className="mt-8 flex gap-3">
          <a href="#/login?next=checkout" className={btnPrimary + " flex-1 inline-flex items-center justify-center"}>
            Log in
          </a>
          <a href="#/register?next=checkout" className={btnGhost + " flex-1 inline-flex items-center justify-center"}>
            Create account
          </a>
        </div>
      </AuthShell>
    );
  }
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-24 text-center">
        <h1 className="font-display text-[56px] leading-none text-bone">Checkout</h1>
        <p className="mt-4 text-bone/70">Your cart is empty. Add something before checking out.</p>
        <a href="#/stockists" className={btnPrimary + " mt-8 inline-flex items-center"}>
          Browse Stockists
        </a>
      </main>
    );
  }
  const upd = (setter, key) => (e) =>
    setter((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  const validateAddr = () => {
    const e: any = {};
    if (!addr.name.trim()) e.name = "Enter your full name.";
    if (!addr.phone.trim()) e.phone = "Enter a phone number.";
    if (!/^\S+@\S+\.\S+$/.test(addr.email)) e.email = "Enter an email like name@example.com.";
    if (!addr.line1.trim()) e.line1 = "Enter a street address.";
    if (!addr.city.trim()) e.city = "Enter a city.";
    if (!addr.postal.trim()) e.postal = "Enter a postal code.";
    return e;
  };
  const validatePay = () => {
    const e: any = {};
    if (pay === "card") {
      const digits = card.number.replace(/\D/g, "");
      if (digits.length < 12) e.number = "Card number needs 12–19 digits.";
      if (!card.name.trim()) e.cardName = "Enter the name on the card.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) e.exp = "Use MM/YY, e.g. 08/28.";
      if (!new RegExp(`^\\d{${cvvLen}}$`).test(card.cvv))
        e.cvv = isAmex ? "Enter the 4 digits on the front of your Amex." : "Enter the 3 digits on the back.";
    } else if (!slip) e.slip = "Upload your transfer slip to continue.";
    return e;
  };
  const finish = (n: number, validator?: () => Record<string, string>) => {
    const e = validator ? validator() : {};
    setErrors(e);
    if (Object.keys(e).length) return;
    setDone((d) => ({
      ...d,
      [n]: true,
    }));
    const next = [1, 2, 3].find((k) => k > n && !done[k]);
    setStep(next || 0);
  };
  const onCardNumber = (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 19);
    setCard((c) => ({
      ...c,
      number: d.replace(/(.{4})/g, "$1 ").trim(),
      cvv: brand(d) === "Amex" ? c.cvv : c.cvv.slice(0, 3), // switched away from Amex
    }));
  };
  const onExp = (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCard((c) => ({
      ...c,
      exp: d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d,
    }));
  };
  const onCvv = (e) =>
    setCard((c) => ({
      ...c,
      cvv: e.target.value.replace(/\D/g, "").slice(0, cvvLen),
    }));
  const onSlip = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!/^image\/|application\/pdf/.test(f.type)) {
      setErrors({
        slip: "Upload an image (JPG, PNG) or a PDF.",
      });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrors({
        slip: "That file is over 10 MB. Upload a smaller one.",
      });
      return;
    }
    const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    setSlip({
      name: f.name,
      size: f.size,
      preview,
      file: f,
    });
    setErrors({});
  };
  const brand = (d) =>
    /^4/.test(d)
      ? "Visa"
      : /^(5[1-5]|2[2-7])/.test(d)
        ? "Mastercard"
        : /^3[47]/.test(d)
          ? "Amex"
          : /^35/.test(d)
            ? "JCB"
            : "Card";
  // Amex has a 4-digit code on the front; every other brand has 3 on the back
  const isAmex = brand(card.number.replace(/\D/g, "")) === "Amex";
  const cvvLen = isAmex ? 4 : 3;
  const allDone = done[1] && done[2] && done[3];
  const placeOrder = async () => {
    if (!allDone || placing) return;
    const issues = shop.stockIssues(items);
    if (issues.length) {
      setErrors({
        stock: issues.join(" ") + " Update your cart to continue.",
      });
      return;
    }
    setPlacing(true);
    setErrors({});
    const digits = card.number.replace(/\D/g, "");
    const payload = {
      items: items.map((it) => ({
        productId: it.id,
        color: it.color,
        size: it.size,
        qty: it.qty,
      })),
      address: addr,
      shipping: ship,
      // Only the brand and last 4 digits leave the browser. Swap this for Omise/Stripe tokens when you go live.
      payment:
        pay === "card"
          ? {
              method: "card",
              brand: brand(digits),
              last4: digits.slice(-4),
            }
          : {
              method: "qr",
            },
      saveAddress: !!auth.user && saveAddr,
      discountCode: discount?.code,
    };
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    if (pay === "qr" && slip) form.append("slip", slip.file);
    try {
      const order = await api("/orders", {
        form,
      });
      onPlaced(order);
    } catch (e) {
      setErrors({
        stock: e.message,
      });
      shop.refresh();
    } finally {
      setPlacing(false);
    }
  };
  const addrSummary = (
    <>
      {addr.name}
      {" · "}
      {addr.phone}
      <br />
      {[addr.line1, addr.line2, addr.city, addr.region, addr.postal, addr.country].filter(Boolean).join(", ")}
    </>
  );
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <h1 className="font-display text-[56px] lg:text-[72px] leading-[0.9] text-bone">Checkout</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
        <div className="space-y-4">
          {/* STEP 1: ADDRESS */}
          <StepShell
            n={1}
            title="Shipping address"
            open={step === 1}
            done={done[1]}
            summary={addrSummary}
            onEdit={() => {
              setErrors({});
              setStep(1);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <Field
                label="Full name"
                value={addr.name}
                onChange={upd(setAddr, "name")}
                autoComplete="name"
                error={errors.name}
              />
              <Field
                label="Phone"
                type="tel"
                value={addr.phone}
                onChange={upd(setAddr, "phone")}
                autoComplete="tel"
                error={errors.phone}
              />
              <Field
                label="Email"
                type="email"
                value={addr.email}
                onChange={upd(setAddr, "email")}
                autoComplete="email"
                error={errors.email}
                className="sm:col-span-2"
              />
              <Field
                label="Address"
                value={addr.line1}
                onChange={upd(setAddr, "line1")}
                autoComplete="address-line1"
                placeholder="House no., street"
                error={errors.line1}
                className="sm:col-span-2"
              />
              <Field
                label="Apartment, building (optional)"
                value={addr.line2}
                onChange={upd(setAddr, "line2")}
                autoComplete="address-line2"
                className="sm:col-span-2"
              />
              <Field
                label="City / District"
                value={addr.city}
                onChange={upd(setAddr, "city")}
                autoComplete="address-level2"
                error={errors.city}
              />
              <Field
                label="Province / State"
                value={addr.region}
                onChange={upd(setAddr, "region")}
                autoComplete="address-level1"
              />
              <Field
                label="Postal code"
                value={addr.postal}
                onChange={upd(setAddr, "postal")}
                autoComplete="postal-code"
                inputMode="numeric"
                error={errors.postal}
              />
              <SelectField
                label="Country"
                value={addr.country}
                onChange={upd(setAddr, "country")}
                options={COUNTRIES}
              />
            </div>
            {auth.user && (
              <label className="mt-4 flex items-center gap-2 text-[13px] text-bone/80">
                <input
                  type="checkbox"
                  checked={saveAddr}
                  onChange={(e) => setSaveAddr(e.target.checked)}
                  className="accent-amber w-4 h-4"
                />
                Save this address to my account
              </label>
            )}
            <button className={btnPrimary + " mt-6"} onClick={() => finish(1, validateAddr)}>
              Continue to delivery
            </button>
          </StepShell>
          {/* STEP 2: DELIVERY */}
          <StepShell
            n={2}
            title="Delivery method"
            open={step === 2}
            done={done[2]}
            summary={`${shipping.name} · ${shipping.eta} · ${shipping.fee ? money(shipping.fee) : "Free"}`}
            onEdit={() => setStep(2)}
          >
            <div className="mt-5 space-y-3" role="radiogroup" aria-label="Delivery method">
              {SHIPPING.map((s) => (
                <Radio key={s.id} name="ship" checked={ship === s.id} onChange={() => setShip(s.id)}>
                  <span className="flex justify-between gap-4">
                    <span>
                      <span className="block text-[14px] text-bone">{s.name}</span>
                      <span className="block text-[12px] text-ash mt-0.5">{s.eta}</span>
                    </span>
                    <span className="font-mono text-[13px] text-bone">{s.fee ? money(s.fee) : "Free"}</span>
                  </span>
                </Radio>
              ))}
            </div>
            <button className={btnPrimary + " mt-6"} onClick={() => finish(2)}>
              Continue to payment
            </button>
          </StepShell>
          {/* STEP 3: PAYMENT */}
          <StepShell
            n={3}
            title="Payment"
            open={step === 3}
            done={done[3]}
            summary={
              pay === "card"
                ? `${brand(card.number.replace(/\D/g, ""))} ending ${card.number.replace(/\D/g, "").slice(-4)}`
                : `QR transfer · slip: ${slip ? slip.name : ""}`
            }
            onEdit={() => {
              setErrors({});
              setStep(3);
            }}
          >
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
              <Radio
                name="pay"
                checked={pay === "card"}
                onChange={() => {
                  setPay("card");
                  setErrors({});
                }}
              >
                <span className="block text-[14px] text-bone">Credit / debit card</span>
                <span className="block text-[12px] text-ash mt-0.5">Visa, Mastercard, JCB, Amex</span>
              </Radio>
              <Radio
                name="pay"
                checked={pay === "qr"}
                onChange={() => {
                  setPay("qr");
                  setErrors({});
                }}
              >
                <span className="block text-[14px] text-bone">QR transfer</span>
                <span className="block text-[12px] text-ash mt-0.5">Scan, pay, then upload your slip</span>
              </Radio>
            </div>
            {pay === "card" ? (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Field
                  label="Card number"
                  value={card.number}
                  onChange={onCardNumber}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  error={errors.number}
                  className="col-span-2"
                />
                <Field
                  label="Name on card"
                  value={card.name}
                  onChange={upd(setCard, "name")}
                  autoComplete="cc-name"
                  error={errors.cardName}
                  className="col-span-2"
                />
                <Field
                  label="Expiry (MM/YY)"
                  value={card.exp}
                  onChange={onExp}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="08/28"
                  error={errors.exp}
                />
                <Field
                  label={isAmex ? "CID (4 digits, front of card)" : "CVV (3 digits)"}
                  value={card.cvv}
                  onChange={onCvv}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder={isAmex ? "1234" : "123"}
                  type="password"
                  error={errors.cvv}
                />
                <p className="col-span-2 text-[12px] text-ash">
                  Test mode: the card is not charged. Only the brand and last 4 digits are sent to the server.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
                <div className="border border-line p-4 text-center">
                  <div className="aspect-square bg-[#fff] p-1">
                    <DemoQR seed={total} />
                  </div>
                  <p className="mt-3 text-[12px] text-ash">Amount to transfer</p>
                  <p className="font-mono text-[22px] text-amber">{money(total)}</p>
                  <p className="mt-2 text-[11px] text-ash">Demo QR, not a real payment code</p>
                </div>
                <div>
                  <ol className="space-y-2 text-[13px] text-bone/80 list-decimal pl-5">
                    <li>Scan the QR code with your banking app.</li>
                    <li>{`Transfer exactly ${money(total)}.`}</li>
                    <li>Upload a screenshot or PDF of the slip below.</li>
                  </ol>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={onSlip}
                    className="sr-only"
                    id="slip"
                  />
                  {slip ? (
                    <div className="mt-5 flex items-center gap-4 border border-line p-3">
                      {slip.preview ? (
                        <img
                          src={slip.preview}
                          alt="Uploaded slip"
                          className="w-16 h-20 object-cover border border-line"
                        />
                      ) : (
                        <span className="w-16 h-20 grid place-items-center border border-line font-mono text-[11px] text-ash">
                          PDF
                        </span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] text-bone truncate">{slip.name}</span>
                        <span className="block text-[12px] text-ash">{(slip.size / 1024).toFixed(0) + " KB"}</span>
                      </span>
                      <button
                        onClick={() => fileRef.current && fileRef.current.click()}
                        className="text-[12px] text-amber underline underline-offset-4"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="slip"
                      className={
                        "mt-5 flex flex-col items-center justify-center gap-1 h-32 border border-dashed cursor-pointer text-center transition-colors " +
                        (errors.slip ? "border-red-400/70" : "border-white/25 hover:border-amber")
                      }
                    >
                      <span className="text-[14px] text-bone">Upload transfer slip</span>
                      <span className="text-[12px] text-ash">JPG, PNG or PDF, up to 10 MB</span>
                    </label>
                  )}
                  {errors.slip && <p className="mt-2 text-[12px] text-red-300">{errors.slip}</p>}
                </div>
              </div>
            )}
            <button className={btnPrimary + " mt-6"} onClick={() => finish(3, validatePay)}>
              Review order
            </button>
          </StepShell>
          {errors.stock && (
            <p role="alert" className="border border-red-400/50 p-3 text-[13px] text-red-300">
              {errors.stock}
            </p>
          )}
          <button className={btnPrimary + " w-full h-14 mt-2"} disabled={!allDone || placing} onClick={placeOrder}>
            {placing ? "Placing order…" : allDone ? `Confirm order · ${money(total)}` : "Complete all steps to confirm"}
          </button>
        </div>
        <OrderSummary
          items={items}
          shippingFee={shipping.fee}
          discount={discount}
          onApply={applyCode}
          onRemove={() => setDiscount(null)}
          loggedIn={!!auth.user}
        />
      </div>
    </main>
  );
}

/* =========================================================
   SUCCESS POPUP
   ========================================================= */
