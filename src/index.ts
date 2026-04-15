import {
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  appendFileSync,
  globSync,
} from "fs";
import { join, resolve } from "path";

export interface CharFixConfig {
  write: boolean;
  hide: string;
  exclude: string[];
}

interface CharFixItem {
  codePoint: number;
  replacement: string;
  char: string;
}

const DEFAULT_SKIP = [
  ".git",
  "node_modules",
  "venv",
  "target",
  "dist",
  "build",
  ".mypy_cache",
  ".pytest_cache",
  ".DS_Store",
  "built",
  "out",
  "static",
  "assets",
  "fonts",
  "icons",
  "backups",
  ".c8rc",
  ".github",
  ".vscode",
  ".dprint.jsonc",
  ".editorconfig",
  ".gulp.js",
];

const BINARY_EXTS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".tar",
  ".exe",
  ".bin",
  ".pyc",
  ".so",
  ".dylib",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".icns",
  ".wasm",
  ".idx",
  ".pack",
  ".pem",
  ".p12",
  ".svg",
  ".mov",
  ".avif",
  ".webp",
  ".xcworkspace",
  ".xcuserstate",
  ".qlgenerator",
  ".lang",
  ".idx",
  ".pack",
  ".xz",
  ".hhsplicense",
];

const GENERATED_PATTERNS = [
  "diagnosticMessages.generated.json",
  ".generated.",
  "source-map-support",
  ".js.map",
  ".mjs.map",
];

const REPLACEMENTS: Array<[number, string]> = [
  // Smart quotes
  [0x2018, "'"], // '
  [0x2019, "'"], // '
  [0x201a, "'"], // '
  [0x201b, "'"], // '
  [0x201c, '"'], // "
  [0x201d, '"'], // "
  [0x201e, '"'], // "
  [0x201f, '"'], // "
  [0x2032, "'"], // ' prime
  [0x2033, '"'], // " double prime
  [0x2035, "'"], // ' reversed prime
  [0x2036, '"'], // " reversed double prime
  [0x00ab, '"'], // " guillemet
  [0x00bb, '"'], // " guillemet
  [0x2039, "'"], // ' single guillemet
  [0x203a, "'"], // ' single guillemet

  // Dashes
  [0x2010, "-"], // - hyphen
  [0x2011, "-"], // - non-breaking hyphen
  [0x2012, "-"], // - figure dash
  [0x2013, "-"], // - en dash
  [0x2014, "--"], // -- em dash
  [0x2015, "--"], // -- horizontal bar
  [0x2212, "-"], // - minus sign
  [0xfe58, "-"], // - small em dash
  [0xfe63, "-"], // - small hyphen-minus
  [0xff0d, "-"], // - fullwidth hyphen-minus

  // Spaces
  [0x00a0, " "], // non-breaking space
  [0x2000, " "], // en quad
  [0x2001, " "], // em quad
  [0x2002, " "], // en space
  [0x2003, " "], // em space
  [0x2004, " "], // three-per-em space
  [0x2005, " "], // four-per-em space
  [0x2006, " "], // six-per-em space
  [0x2007, " "], // figure space
  [0x2008, " "], // punctuation space
  [0x2009, " "], // thin space
  [0x200a, " "], // hair space
  [0x200b, ""], // zero-width space
  [0x200c, ""], // zero-width non-joiner
  [0x200d, ""], // zero-width joiner
  [0x200e, ""], // left-to-right mark
  [0x200f, ""], // right-to-left mark
  [0x202f, " "], // narrow no-break space
  [0x205f, " "], // medium mathematical space
  [0x2060, ""], // word joiner
  [0x3000, " "], // ideographic space
  [0xfeff, ""], // BOM / zero-width no-break space

  // Ellipsis
  [0x2026, "..."], // ...

  // Other punctuation
  [0x2024, "."], // . one dot leader
  [0x2025, ".."], // .. two dot leader
  [0x2027, "-"], // - hyphenation point
  [0x2044, "/"], // / fraction slash
  [0x2215, "/"], // / division slash
  [0x2216, "\\"], // \ set minus
  [0x2217, "*"], // * asterisk operator
  [0x2223, "|"], // | divides
  [0x2225, "||"], // ‖ parallel
  [0x2236, ":"], // : ratio
  [0x223c, "~"], // ~ tilde operator
  [0x2264, "<="], // <=
  [0x2265, ">="], // >=
  [0x2260, "!="], // !=

  // Fullwidth ASCII variants (common in CJK input)
  [0xff01, "!"], // !
  [0xff02, '"'], // "
  [0xff03, "#"], // #
  [0xff04, "$"], // $
  [0xff05, "%"], // %
  [0xff06, "&"], // &
  [0xff07, "'"], // '
  [0xff08, "("], // (
  [0xff09, ")"], // )
  [0xff0a, "*"], // *
  [0xff0b, "+"], // +
  [0xff0c, ","], // ,
  [0xff0e, "."], // .
  [0xff0f, "/"], // /
  [0xff1a, ":"], // :
  [0xff1b, ";"], // ;
  [0xff1c, "<"], // <
  [0xff1d, "="], // =
  [0xff1e, ">"], // >
  [0xff1f, "?"], // ?
  [0xff20, "@"], // @
  [0xff3b, "["], // [
  [0xff3c, "\\"], // \
  [0xff3d, "]"], // ]
  [0xff3e, "^"], // ^
  [0xff3f, "_"], // _
  [0xff40, "`"], // `
  [0xff5b, "{"], // {
  [0xff5c, "|"], // |
  [0xff5d, "}"], // }
  [0xff5e, "~"], // ~
];

function buildUnwantedMap(): Record<string, CharFixItem> {
  return REPLACEMENTS.reduce(
    (acc, [codePoint, replacement]) => {
      const char = String.fromCodePoint(codePoint);
      acc[char] = { codePoint, replacement, char };
      return acc;
    },
    {} as Record<string, CharFixItem>
  );
}

function fixContent(content: string): string {
  const unwanted = buildUnwantedMap();
  let fixed = content;

  if (/\r\n/g.test(fixed)) {
    fixed = fixed.replaceAll("\r\n", "\n");
  }

  if (/\r/g.test(fixed)) {
    fixed = fixed.replaceAll("\r", "\n");
  }

  for (const charfix of Object.values(unwanted)) {
    if (fixed.includes(charfix.char)) {
      fixed = fixed.replaceAll(charfix.char, charfix.replacement);
    }
  }

  return fixed;
}

function shouldSkipFile(file: string): boolean {
  const lower = file.toLowerCase();

  if (BINARY_EXTS.some((ext) => lower.endsWith(ext))) return true;
  if (GENERATED_PATTERNS.some((p) => lower.includes(p))) return true;

  try {
    const stats = statSync(file);
    if (stats.size > 2 * 1024 * 1024) return true;
  } catch {
    return true;
  }

  return false;
}

interface DiffChangeInfo {
  lineNum: number;
  orig: string;
  fix: string;
  changes: string[];
}

function reportDiff(
  file: string,
  content: string,
  fixed: string,
  hideEof: boolean,
  logFile: string
): number {
  const logLine = (msg: string): void => {
    const clean = msg.replace(/\x1b\[[0-9;]*m/g, "");
    appendFileSync(logFile, clean + "\n");
  };

  console.log(`\x1b[36mChanged: ${file}\x1b[0m`);
  logLine(`\n--- ${file} ---`);

  const originalLines = content.split("\n");
  const fixedLines = fixed.split("\n");
  let fixCount = 0;

  for (let i = 0; i < Math.max(originalLines.length, fixedLines.length); i++) {
    const orig = originalLines[i] ?? "";
    const fix = fixedLines[i] ?? "";
    if (orig !== fix) {
      const diffChars: number[] = [];
      for (let j = 0; j < Math.max(orig.length, fix.length); j++) {
        if (orig[j] !== fix[j]) diffChars.push(j);
      }

      if (hideEof) {
        const hasOnlyEofFix = diffChars.every(
          (j) => orig[j] === undefined || fix[j] === undefined
        );
        if (hasOnlyEofFix) continue;
      }

      fixCount++;
      logLine(`Line ${i + 1}:`);

      let diffMarkers = "";
      const changes: string[] = [];
      for (let j = 0; j < Math.max(orig.length, fix.length); j++) {
        const charOrig = orig[j];
        const charFix = fix[j];

        if (charOrig !== charFix) {
          if (hideEof && (charOrig === undefined || charFix === undefined)) {
            diffMarkers += " ";
            continue;
          }
          diffMarkers += "^";

          const describe = (c: string | undefined): string => {
            if (c === undefined) return "EOF";
            const code = c.charCodeAt(0);
            if (code === 0x0d) return "CR (0x0D)";
            if (code === 0x0a) return "LF (0x0A)";
            if (code === 0x09) return "TAB (0x09)";
            if (code === 0x20) return "SPACE (0x20)";
            if (code < 32 || code > 126)
              return `[${c}](0x${code.toString(16).toUpperCase()})`;
            return `[${c}]`;
          };

          changes.push(`${describe(charOrig)} -> ${describe(charFix)}`);
        } else {
          diffMarkers += " ";
        }
      }

      if (changes.length === 0 && hideEof) continue;

      logLine(`- ${orig}`);
      logLine(`+ ${fix}`);
      if (changes.length > 0) {
        logLine(`  ${diffMarkers}`);
        logLine(`  Fixes: ${changes.join(", ")}`);
      }
    }
  }

  return fixCount;
}

interface ProcessOptions {
  dryRun: boolean;
  hideEof: boolean;
  logFile: string;
}

function processFile(
  file: string,
  options: ProcessOptions
): { changed: boolean; fixCount: number } {
  try {
    if (shouldSkipFile(file)) return { changed: false, fixCount: 0 };

    const content = readFileSync(file, "utf8");
    if (content.includes("\u0000")) return { changed: false, fixCount: 0 };

    const fixed = fixContent(content);

    if (content !== fixed) {
      const fixCount = reportDiff(
        file,
        content,
        fixed,
        options.hideEof,
        options.logFile
      );

      if (!options.dryRun) {
        writeFileSync(file, fixed);
      }

      return { changed: true, fixCount };
    }

    return { changed: false, fixCount: 0 };
  } catch {
    return { changed: false, fixCount: 0 };
  }
}

interface WalkOptions extends ProcessOptions {
  skipNodeModules: boolean;
  ignorePatterns: Set<string>;
}

function walk(dir: string, options: WalkOptions): { files: number; fixes: number } {
  let fileCount = 0;
  let fixCount = 0;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);

      if (options.skipNodeModules) {
        if (
          DEFAULT_SKIP.some((s) => entry.name === s || full.includes(`/${s}/`))
        )
          continue;
      } else {
        if (entry.name === ".git" || full.includes("/.git/")) continue;
        if (entry.name === ".venv" || entry.name === "venv") continue;
      }

      if (entry.name.startsWith(".") && entry.name !== ".cursor") continue;

      if (entry.isDirectory()) {
        const result = walk(full, options);
        fileCount += result.files;
        fixCount += result.fixes;
      } else if (entry.isFile()) {
        const result = processFile(full, options);
        if (result.changed) {
          fileCount++;
          fixCount += result.fixCount;
        }
      }
    }
  } catch {
    // Ignore permissions errors or missing dirs
  }

  return { files: fileCount, fixes: fixCount };
}

interface ProcessDirectoryOptions {
  target: string;
  write: boolean;
  hideEof: string;
  exclude: string[];
  cwd: string;
}

interface ProcessResult {
  totalFiles: number;
  totalFixes: number;
  logFile: string;
}

export function processDirectory(
  options: ProcessDirectoryOptions
): ProcessResult {
  const dryRun = !options.write;
  const hideEof = options.hideEof;
  const logFile = join(options.cwd, "fixquotes.log");
  const target = options.target || options.cwd;
  const exclude = options.exclude || [];

  appendFileSync(
    logFile,
    `\n${"=".repeat(50)}\nUnicode Sanitization - ${new Date().toISOString()}\nTarget: ${target}\n${"=".repeat(50)}\n\n`
  );

  console.log(`\x1b[1mUnicode Sanitization\x1b[0m`);
  if (dryRun) {
    console.log(
      `\x1b[33mDRY RUN: No files will be modified. Use --write to apply.\x1b[0m`
    );
  } else {
    console.log(`\x1b[35mWRITE MODE: Files will be modified.\x1b[0m`);
  }

  const processOptions: ProcessOptions = {
    dryRun,
    hideEof: hideEof !== "none",
    logFile,
  };

  const ignorePatterns = new Set(exclude);
  const walkOptions: WalkOptions = {
    ...processOptions,
    skipNodeModules: true,
    ignorePatterns,
  };

  const hasGlobMagic = /[*?{}\[\]]/.test(target);
  const endsWithSlashStar =
    target.endsWith("/*") || target.endsWith("\\*");

  let totalFiles = 0;
  let totalFixes = 0;

  if (endsWithSlashStar && !target.includes("**")) {
    const dir = resolve(options.cwd, target.slice(0, -2));
    try {
      const stats = statSync(dir);
      if (stats.isDirectory()) {
        walkOptions.skipNodeModules = false;
        const result = walk(dir, walkOptions);
        totalFiles = result.files;
        totalFixes = result.fixes;
      }
    } catch {
      console.error(`\x1b[31mDirectory not found: ${dir}\x1b[0m`);
    }
  } else if (hasGlobMagic) {
    const ignoreList = [".git/**", ...exclude];
    const files = globSync(target, {
      cwd: options.cwd,
      exclude: ignoreList,
    }).map((f: string) => resolve(options.cwd, f));

    console.log(`\x1b[90mGlob pattern: ${target}\x1b[0m`);
    console.log(`\x1b[90mMatched ${files.length} files\x1b[0m`);

    if (files.length === 0) {
      const baseDir = target.split(/[*?{\[]/)[0].replace(/\/$/, "") || ".";
      console.log(`\x1b[33mNo files matched pattern: ${target}\x1b[0m`);
      console.log(
        `\x1b[90mBase directory: ${resolve(options.cwd, baseDir)}\x1b[0m`
      );
      try {
        const entries = readdirSync(resolve(options.cwd, baseDir));
        console.log(
          `\x1b[90mContents: ${entries.slice(0, 10).join(", ")}${entries.length > 10 ? "..." : ""}\x1b[0m`
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`\x1b[31mCannot read base directory: ${msg}\x1b[0m`);
      }
    }

    for (const file of files) {
      const result = processFile(file, processOptions);
      if (result.changed) {
        totalFiles++;
        totalFixes += result.fixCount;
      }
    }
  } else {
    const resolved = resolve(options.cwd, target);
    try {
      const stats = statSync(resolved);
      if (stats.isDirectory()) {
        const result = walk(resolved, walkOptions);
        totalFiles = result.files;
        totalFixes = result.fixes;
      } else {
        const result = processFile(resolved, processOptions);
        if (result.changed) {
          totalFiles = 1;
          totalFixes = result.fixCount;
        }
      }
    } catch {
      console.error(`\x1b[31mPath not found: ${resolved}\x1b[0m`);
    }
  }

  console.log(`\n\x1b[1mSummary:\x1b[0m`);
  console.log(`Files: ${totalFiles}`);
  console.log(`Changes: ${totalFixes}`);
  console.log(`Log: \x1b[34m${logFile}\x1b[0m`);

  if (totalFiles === 0) {
    console.log(`\x1b[32mWorkspace is clean.\x1b[0m`);
  } else if (dryRun) {
    console.log(`\x1b[33mRun with --write to apply changes.\x1b[0m`);
  } else {
    console.log(`\x1b[32mApplied all changes.\x1b[0m`);
  }

  return { totalFiles, totalFixes, logFile };
}

export { fixContent };
