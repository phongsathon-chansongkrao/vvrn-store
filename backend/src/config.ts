import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  return v;
}

const isProd = process.env.NODE_ENV === "production";
const jwtSecret = required("JWT_SECRET");
if (isProd && jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters in production.");

export const config = {
  port: Number(process.env.PORT || 4000),
  isProd,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret,
  mail: {
    resendKey: process.env.RESEND_API_KEY || "",
    // Resend's test sender only delivers to your own Resend account email. Verify a domain to email customers.
    from: process.env.MAIL_FROM || "VVRN <onboarding@resend.dev>",
    replyTo: process.env.MAIL_REPLY_TO || "",
    // Development only: send every email here instead of to the customer. Ignored in production.
    testTo: isProd ? "" : process.env.MAIL_TEST_TO || "",
  },
  db: {
    server: process.env.DB_SERVER || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    instance: process.env.DB_INSTANCE || undefined,
    name: process.env.DB_NAME || "VVRN",
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    encrypt: process.env.DB_ENCRYPT === "true",
    trustCert: process.env.DB_TRUST_CERT !== "false",
  },
  shipping: {
    standard: { name: "Standard", eta: "5–10 business days", fee: 0 },
    express: { name: "Express", eta: "2–4 business days", fee: 350 },
  } as Record<string, { name: string; eta: string; fee: number }>,
};
