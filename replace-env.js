const fs = require("fs");

function normalizeBaseUrl(value) {
  if (!value) return "";
  const trimmed = String(value).trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const BASE_URL = normalizeBaseUrl(
  process.env.__BASE_URL__ ||
  process.env.BASE_URL ||
  process.env.PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL
) || (process.env.VERCEL_ENV === "production"
  ? "https://theunjeongpick.com"
  : "https://www.sola-home-dev.kr");

const files = [
  "index.html",
  "app.html",
  "signup.html",
  "phone-verify.html",
  "error.html",
  "sola-admin-x92ks.html"
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;

  let html = fs.readFileSync(file, "utf-8");

  html = html.replace(/__BASE_URL__/g, BASE_URL);

  fs.writeFileSync(file, html);

  console.log(`${file} → ${BASE_URL}`);
});
