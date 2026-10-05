#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { startServer } = require('../lib/server');
const packageJson = require('../package.json');

function printHelp() {
  console.log(`
\x1b[1m✦ Tistory Theme Live Preview Suite (v${packageJson.version}) ✦\x1b[0m

사용법:
  npx tistory-theme-preview [옵션]

옵션 목록:
  -p, --port <number>     프리뷰 서버가 실행될 포트 번호 (기본값: 3000)
  -s, --skin <path>       테스트할 티스토리 스킨 디렉토리 또는 skin.html 경로 (기본값: 현재 폴더 자동 탐색)
  -d, --dir <path>        에셋 및 Mock 데이터가 위치한 기본 디렉토리 (기본값: 스킨 폴더)
  -v, --version           버전 정보 출력
  -h, --help              도움말 출력

예시:
  tistory-theme-preview
  tistory-theme-preview -p 4000
  tistory-theme-preview -s ./my-skin
  `);
  process.exit(0);
}

function printVersion() {
  console.log(`tistory-theme-preview v${packageJson.version}`);
  process.exit(0);
}

// Automatically scans directory for Tistory skin files
function scanSkinDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return null;

  // 1. Direct skin.html check
  const standardSkinHtml = path.join(dirPath, 'skin.html');
  if (fs.existsSync(standardSkinHtml)) {
    return {
      skinDir: dirPath,
      skinHtmlPath: standardSkinHtml
    };
  }

  // 2. Scan all HTML files for Tistory markup
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.html')) {
        const fullPath = path.join(dirPath, file);
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('<s_t3>') || content.includes('[##_') || content.includes('<s_article_rep>')) {
            return {
              skinDir: dirPath,
              skinHtmlPath: fullPath
            };
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return null;
}

// Argument parsing
const args = process.argv.slice(2);
let port = 3000;
let skinInput = null;
let staticDirInput = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-h' || arg === '--help') {
    printHelp();
  } else if (arg === '-v' || arg === '--version') {
    printVersion();
  } else if (arg === '-p' || arg === '--port') {
    const val = parseInt(args[++i], 10);
    if (!isNaN(val)) port = val;
  } else if (arg === '-s' || arg === '--skin' || arg === '-t' || arg === '--theme') {
    skinInput = args[++i];
  } else if (arg === '-d' || arg === '--dir') {
    staticDirInput = args[++i];
  }
}

let skinDir = process.cwd();
let skinHtmlPath = null;

if (skinInput) {
  const resolvedPath = path.isAbsolute(skinInput) ? skinInput : path.resolve(process.cwd(), skinInput);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`\x1b[31m[오류] 지정한 스킨 경로를 찾을 수 없습니다: ${resolvedPath}\x1b[0m`);
    process.exit(1);
  }

  if (fs.statSync(resolvedPath).isDirectory()) {
    const scanned = scanSkinDirectory(resolvedPath);
    if (scanned) {
      skinDir = scanned.skinDir;
      skinHtmlPath = scanned.skinHtmlPath;
    } else {
      console.error(`\x1b[31m[오류] 디렉토리(${path.basename(resolvedPath)}) 내에 skin.html 또는 유효한 티스토리 템플릿 파일이 없습니다.\x1b[0m`);
      process.exit(1);
    }
  } else {
    // Single file specified
    skinHtmlPath = resolvedPath;
    skinDir = path.dirname(resolvedPath);
  }
} else {
  // Auto scan current directory
  const scanned = scanSkinDirectory(process.cwd());
  if (scanned) {
    skinDir = scanned.skinDir;
    skinHtmlPath = scanned.skinHtmlPath;
    console.log(`[tistory-theme-preview] 티스토리 스킨 파일을 자동 감지했습니다: ${path.basename(skinHtmlPath)}`);
  } else {
    // Check if sample-theme exists in package
    const sampleDir = path.join(__dirname, '../sample-theme');
    if (fs.existsSync(sampleDir) && fs.existsSync(path.join(sampleDir, 'skin.html'))) {
      console.log(`\x1b[33m[알림] 현재 디렉토리에 티스토리 스킨이 없어 내장된 샘플 스킨(sample-theme)으로 프리뷰어를 실행합니다.\x1b[0m`);
      skinDir = sampleDir;
      skinHtmlPath = path.join(sampleDir, 'skin.html');
    } else {
      console.error(`\x1b[31m[오류] 티스토리 스킨 파일(skin.html)을 찾을 수 없습니다.\x1b[0m`);
      console.error(`현재 작업 디렉토리: ${process.cwd()}`);
      console.error(`해결책: 스킨 프로젝트 폴더에서 실행하거나 -s <경로> 옵션을 사용하세요.`);
      process.exit(1);
    }
  }
}

// Locate companion files
const indexXmlPath = path.join(skinDir, 'index.xml');
const styleCssPath = path.join(skinDir, 'style.css');
const imagesDir = path.join(skinDir, 'images');

startServer({
  port,
  skinDir: staticDirInput ? (path.isAbsolute(staticDirInput) ? staticDirInput : path.resolve(process.cwd(), staticDirInput)) : skinDir,
  skinHtmlPath,
  indexXmlPath,
  styleCssPath,
  imagesDir
});
