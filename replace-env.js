const fs = require("fs");

const BASE_URL =
  process.env.PUBLIC_APP_URL ||
  (process.env.VERCEL_ENV === "production"
    ? "https://www.sola-home.kr"
    : "https://dev.sola-home.kr");

const files = [
  "index.html",
  "app.html",
  "signup.html",
  "phone-verify.html",
  "error.html"
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;

  let html = fs.readFileSync(file, "utf-8");

  html = html.replace(/__BASE_URL__/g, BASE_URL);

  fs.writeFileSync(file, html);

  console.log(`${file} → ${BASE_URL}`);
});