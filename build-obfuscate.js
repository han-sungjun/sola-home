/*
 * 더운정픽 배포용 빌드 스크립트
 * - 원본 파일은 유지합니다.
 * - dist/ 폴더에만 HTML/CSS/JS 압축 및 JS 난독화를 적용합니다.
 * - env-config, firebase-config, service worker, ES module export 파일은 안정성을 위해 강한 난독화를 피합니다.
 * - 운영 배포본에서는 console.log/info/debug/trace/table/time/group/count와 debugger를 제거합니다.
 * - console.warn/error는 운영 장애 확인을 위해 유지합니다.
 */
const fs = require('fs');
const path = require('path');
const { minify: minifyJs } = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', 'dist']);
const COPY_ONLY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp3', '.wav', '.pdf'
]);

// 기능 깨짐 방지를 위해 강한 난독화에서 제외할 파일입니다.
// 이 파일들은 필요 시 압축만 적용하거나 그대로 복사합니다.
const COPY_ONLY_FILES = new Set([
  'firebase-messaging-sw.js',
  'common/env-config.js',
  'common/firebase-config.js',
  // 사진 확대 팝업/슬라이더 보정 스크립트는 pointer/touch 이벤트와
  // MutationObserver 의 순서가 중요해서 난독화하지 않고 안전 압축만 적용합니다.
  'js/app.inline.4.js',
  'js/app.inline.5.js'
]);

// Vercel 서버리스 함수는 브라우저에 직접 노출되는 정적 파일이 아니므로 원본 그대로 둡니다.
const COPY_ONLY_PREFIXES = [
  'api/'
];

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, contents) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, contents, 'utf8');
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function isCopyOnlyFile(relativePath) {
  return COPY_ONLY_FILES.has(toPosix(relativePath));
}

function isCopyOnlyPrefix(relativePath) {
  const posix = toPosix(relativePath);
  return COPY_ONLY_PREFIXES.some((prefix) => posix.startsWith(prefix));
}

function isCopyOnly(relativePath) {
  return isCopyOnlyFile(relativePath) || isCopyOnlyPrefix(relativePath);
}


function getProductionTerserOptions(moduleFile, { mangle = true } = {}) {
  return {
    module: moduleFile,
    compress: {
      passes: 1,
      drop_console: false,
      drop_debugger: true,
      pure_funcs: [
        'console.log',
        'console.info',
        'console.debug',
        'console.trace',
        'console.table',
        'console.group',
        'console.groupCollapsed',
        'console.groupEnd',
        'console.time',
        'console.timeEnd',
        'console.count',
        'console.countReset'
      ]
    },
    mangle,
    format: {
      comments: false
    }
  };
}

async function minifyJsForProduction(code, relativePath, { mangle = true } = {}) {
  const moduleFile = isLikelyModule(code, relativePath);
  const minified = await minifyJs(code, getProductionTerserOptions(moduleFile, { mangle }));
  return { code: minified.code || code, moduleFile };
}

function isLikelyModule(code, relativePath) {
  const posix = toPosix(relativePath);
  if (posix === 'js/app.js' || posix === 'js/account-recovery.js' || posix === 'js/phone-verify-core.js') return true;
  return /(^|\n)\s*(import\s+[^(']|export\s+)/.test(code);
}

async function processJs(src, dest, relativePath) {
  const code = read(src);

  // Vercel 서버리스 함수는 사용자 브라우저에 내려가는 정적 JS가 아니므로 원본 그대로 둡니다.
  if (isCopyOnlyPrefix(relativePath)) {
    copyFile(src, dest);
    return 'copy-only-js';
  }

  // 서비스워커/환경설정 파일은 난독화하지 않고 안전 압축만 적용합니다.
  // 운영 배포본에서는 정보성 console과 debugger를 제거하되, console.warn/error는 유지합니다.
  if (isCopyOnlyFile(relativePath)) {
    const safeMinified = await minifyJsForProduction(code, relativePath, { mangle: false });
    write(dest, safeMinified.code);
    return 'safe-minified-js';
  }

  const { code: minifiedCode, moduleFile } = await minifyJsForProduction(code, relativePath, {
    mangle: !isLikelyModule(code, relativePath)
  });

  // ES module은 export/import 이름 보존이 중요해서 minify까지만 적용합니다.
  // classic script만 강한 난독화를 적용합니다.
  if (moduleFile) {
    write(dest, minifiedCode);
    return 'minified-module-js';
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(minifiedCode, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: false,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayThreshold: 0.35,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
  });

  write(dest, obfuscated.getObfuscatedCode());
  return 'obfuscated-js';
}

async function processCss(src, dest) {
  const input = read(src);
  const result = new CleanCSS({ level: 2 }).minify(input);
  if (result.errors && result.errors.length) {
    console.warn(`[css warning] ${src}`, result.errors);
    copyFile(src, dest);
    return 'copy-css-error';
  }
  write(dest, result.styles || input);
  return 'minified-css';
}

async function processHtml(src, dest) {
  const html = read(src);
  const result = await minifyHtml(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    removeRedundantAttributes: false,
    removeScriptTypeAttributes: false,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: false,
    keepClosingSlash: true
  });
  write(dest, result);
  return 'minified-html';
}

async function processFile(src, relativePath, stats) {
  const ext = path.extname(src).toLowerCase();
  const dest = path.join(DIST, relativePath);

  if (COPY_ONLY_EXTENSIONS.has(ext) || isCopyOnly(relativePath)) {
    copyFile(src, dest);
    stats.copied += 1;
    return;
  }

  try {
    if (ext === '.js') {
      const mode = await processJs(src, dest, relativePath);
      stats[mode] = (stats[mode] || 0) + 1;
      return;
    }
    if (ext === '.css') {
      await processCss(src, dest);
      stats['minified-css'] += 1;
      return;
    }
    if (ext === '.html') {
      await processHtml(src, dest);
      stats['minified-html'] += 1;
      return;
    }

    copyFile(src, dest);
    stats.copied += 1;
  } catch (error) {
    console.warn(`[build warning] ${relativePath} 처리 실패 → 원본 복사`, error.message);
    copyFile(src, dest);
    stats.copied += 1;
    stats.fallback += 1;
  }
}

async function walk(currentDir, baseDir, stats) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    if (entry.name === 'package-lock.json') continue;

    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      await walk(fullPath, baseDir, stats);
    } else {
      await processFile(fullPath, relativePath, stats);
    }
  }
}

function normalizeBaseUrl(value) {
  if (!value) return '';
  const trimmed = String(value).trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function replaceBaseUrlInDist() {
  const baseUrl = normalizeBaseUrl(
    process.env.__BASE_URL__ ||
    process.env.BASE_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL
  ) || (process.env.VERCEL_ENV === 'production'
    ? 'https://theunjeongpick.com'
    : 'https://www.sola-home-dev.kr');

  const files = ['index.html', 'app.html', 'signup.html', 'phone-verify.html', 'error.html', 'admin.html'];
  for (const file of files) {
    const target = path.join(DIST, file);
    if (!fs.existsSync(target)) continue;
    const html = read(target).replace(/__BASE_URL__/g, baseUrl);
    write(target, html);
    console.log(`${file} → ${baseUrl}`);
  }
}

async function main() {
  removeDir(DIST);
  ensureDir(DIST);

  const stats = {
    copied: 0,
    fallback: 0,
    'obfuscated-js': 0,
    'minified-module-js': 0,
    'safe-minified-js': 0,
    'copy-only-js': 0,
    'minified-css': 0,
    'minified-html': 0
  };

  await walk(ROOT, ROOT, stats);
  replaceBaseUrlInDist();

  console.log('\n더운정픽 배포용 빌드 완료: dist/');
  console.table(stats);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
