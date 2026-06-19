```
   ███████╗██╗██╗  ██╗    ░█████╗░██╗░██╗░█████╗░██████╗░
   ██╔════╝██║╚██╗██╔╝    ██╔══██╗██║░██║██╔══██╗██╔══██╗
   █████╗░░██║░╚███╔╝     ██║░░██║██║░██║███████║██████╔╝
   ██╔══╝░░██║░██╔██╗     ██║░░██║██║░██║██╔══██║██╔══██╗
   ██║░░░░░██║██╔╝██╗     ░█████╔╝╚█████╔╝██║░░██║██║░░██║
   ╚═╝░░░░░╚═╝╚═╝░╚═╝     ░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝
```

**Fix unwanted Unicode characters in your text files.**

Clean up smart quotes, dashes, spaces, and other problematic Unicode variants that sneak into your code and docs through copy-paste, clipboard operations, and rich text editors.

Automatically detects and replaces Unicode variants while preserving your content and structure.

## What It Does

```
  INPUT                          OUTPUT
  ─────────────────────────────────────────
  "smart quotes"         ──→    "smart quotes"
  em—dashes              ──→    em-dashes
  non‑breaking spaces    ──→    non breaking spaces
  …ellipsis              ──→    ...ellipsis
  ‖double pipes          ──→    ||double pipes
```

Replaces Unicode variants with their ASCII equivalents:

| Type | Examples | Result |
|------|----------|--------|
| **Smart quotes** | ', ', ", " | Regular quotes: ', ", etc. |
| **Dashes** | –, —, −, ‐ | Hyphens: `-` |
| **Spaces** | NBSP, zero-width, thin | Regular spaces |
| **Fullwidth ASCII** | Common in CJK input | Regular ASCII |
| **Punctuation** | …, ‖, †, ‡ | Safe equivalents |

## ⚡ Installation

**Quick install:**
```bash
npm install @op/fix-char
```

**Build from source:**
```bash
npm install
npm run build
```

## ▶ Usage

### 🖥️ CLI Usage

```bash
npx fix-char [target] [options]
```

**Dry-run** (preview changes without writing):
```bash
fix-char              # current directory
fix-char ./src        # specific directory
fix-char ./file.txt   # specific file
```

**Apply changes:**
```bash
fix-char --write
fix-char ./src --write
```

### ⚙️ Options

```
  --write, -w           Apply changes to files (default: dry-run)
  --hide <string>       Hide EOF-only changes (default: "EOF")
  --hide=none           Show all changes including EOF
  --exclude <patterns>  Skip patterns (comma-separated glob)
  --stdin               Read from stdin/clipboard, output to stdout
```

### 📋 Examples

**Dry-run with exclusions:**
```bash
fix-char ./src --exclude="**/{node_modules,.git,__pycache__,venv,.venv}"
```

**TypeScript files only:**
```bash
fix-char "**/*.ts" --exclude="**/*.test.ts" --write
```

**Full project, skip vendor dirs:**
```bash
fix-char . --exclude="**/dist,**/node_modules,.git" --write
```

**Clipboard (macOS):**
```bash
fix-char --stdin
```

**Show all changes:**
```bash
fix-char --hide=none --write
```

### 📦 As a Library

```typescript
import { processDirectory, fixContent } from "@op/fix-char";

// Fix a single string
const fixed = fixContent("This has a smart quote: "hello"");
console.log(fixed); // This has a smart quote: "hello"

// Process a directory
const result = processDirectory({
  target: "./src",
  write: false,           // dry-run
  hideEof: "EOF",
  exclude: ["**/.git"],
  cwd: process.cwd(),
});

console.log(`Fixed ${result.totalFixes} issues in ${result.totalFiles} files`);
console.log(`Log: ${result.logFile}`);
```

## 🚫 What Files Are Skipped

By default, `fix-char` intelligently avoids:

```
  📁 Directories      .git, node_modules, venv, .mypy_cache, .pytest_cache
                      .github, .vscode, dist, build, and others

  📦 Binary files     .png, .jpg, .pdf, .wasm, .so, .dylib, etc.

  ⚙️  Generated        .js.map, .generated.json, etc.

  📏 Large files      > 2MB

  🔒 Binary content   Files with null bytes
```

**Custom exclusions:**
```bash
fix-char . --exclude="**/migrations,**/fixtures" --write
```

## 📊 Output

`fix-char` produces a detailed log in `fixquotes.log`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FILE: src/example.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Line 5:
  - const greeting = "Hello, world!"
  + const greeting = "Hello, world!"
    ^^^                            ^^
    Fixes: ["] → ["], ["] → ["]
```

Clean files produce no log entries. Use `--hide=none` to show all changes including EOF fixes.

## 💡 Use Cases

### 📝 Clean up after copy-pasting from Word
```bash
fix-char ./docs --exclude="**/images" --write
```

### 🔍 Pre-commit check on monorepo
```bash
fix-char . --exclude="**/node_modules,**/.git,**/dist" --hide=none
```

### 🐍 Fix Python source files
```bash
fix-char "**/*.py" --exclude="**/venv,**/__pycache__" --write
```

### 📄 Fix Markdown from Rich Text editors
```bash
fix-char "**/*.md" --write
```

## 🔤 Character Reference

Complete mapping of all replacements:

### Quotation Marks

| Input | Code | Output | Description |
|-------|------|--------|-------------|
| `'` | U+2018 | `'` | Left single quotation mark |
| `'` | U+2019 | `'` | Right single quotation mark |
| `'` | U+201A | `'` | Single low-9 quotation mark |
| `'` | U+201B | `'` | Single high-reversed-9 quotation mark |
| `"` | U+201C | `"` | Left double quotation mark |
| `"` | U+201D | `"` | Right double quotation mark |
| `"` | U+201E | `"` | Double low-9 quotation mark |
| `"` | U+201F | `"` | Double high-reversed-9 quotation mark |
| `′` | U+2032 | `'` | Prime (feet/arcminutes) |
| `″` | U+2033 | `"` | Double prime (inches/arcseconds) |
| `‵` | U+2035 | `'` | Reversed prime |
| `″` | U+2036 | `"` | Reversed double prime |
| `«` | U+00AB | `"` | Left-pointing double angle quotation mark |
| `»` | U+00BB | `"` | Right-pointing double angle quotation mark |
| `‹` | U+2039 | `'` | Single left-pointing angle quotation mark |
| `›` | U+203A | `'` | Single right-pointing angle quotation mark |

### Dashes & Hyphens

| Input | Code | Output | Description |
|-------|------|--------|-------------|
| `‐` | U+2010 | `-` | Hyphen |
| `‑` | U+2011 | `-` | Non-breaking hyphen |
| `‒` | U+2012 | `-` | Figure dash |
| `–` | U+2013 | `-` | En dash |
| `—` | U+2014 | `--` | Em dash |
| `―` | U+2015 | `--` | Horizontal bar |
| `−` | U+2212 | `-` | Minus sign |
| `﹘` | U+FE58 | `-` | Small em dash |
| `﹣` | U+FE63 | `-` | Small hyphen-minus |
| `－` | U+FF0D | `-` | Fullwidth hyphen-minus |

### Spaces & Invisible Characters

| Input | Code | Output | Description |
|-------|------|--------|-------------|
| ` ` | U+00A0 | ` ` | Non-breaking space |
| ` ` | U+2000 | ` ` | En quad |
| ` ` | U+2001 | ` ` | Em quad |
| ` ` | U+2002 | ` ` | En space |
| ` ` | U+2003 | ` ` | Em space |
| ` ` | U+2004 | ` ` | Three-per-em space |
| ` ` | U+2005 | ` ` | Four-per-em space |
| ` ` | U+2006 | ` ` | Six-per-em space |
| ` ` | U+2007 | ` ` | Figure space |
| ` ` | U+2008 | ` ` | Punctuation space |
| ` ` | U+2009 | ` ` | Thin space |
| ` ` | U+200A | ` ` | Hair space |
| `​` | U+200B | (removed) | Zero-width space |
| `‌` | U+200C | (removed) | Zero-width non-joiner |
| `‍` | U+200D | (removed) | Zero-width joiner |
| `‎` | U+200E | (removed) | Left-to-right mark |
| `‏` | U+200F | (removed) | Right-to-left mark |
| ` ` | U+202F | ` ` | Narrow no-break space |
| ` ` | U+205F | ` ` | Medium mathematical space |
| `⁠` | U+2060 | (removed) | Word joiner |
| `　` | U+3000 | ` ` | Ideographic space |
| `﻿` | U+FEFF | (removed) | Zero-width no-break space / BOM |

### Ellipsis & Punctuation

| Input | Code | Output | Description |
|-------|------|--------|-------------|
| `…` | U+2026 | `...` | Horizontal ellipsis |
| `․` | U+2024 | `.` | One dot leader |
| `‥` | U+2025 | `..` | Two dot leader |
| `‧` | U+2027 | `-` | Hyphenation point |
| `⁄` | U+2044 | `/` | Fraction slash |
| `∕` | U+2215 | `/` | Division slash |
| `∖` | U+2216 | `\` | Set minus |
| `∗` | U+2217 | `*` | Asterisk operator |
| `∣` | U+2223 | `\|` | Divides |
| `∥` | U+2225 | `\|\|` | Parallel |
| `∶` | U+2236 | `:` | Ratio |
| `∼` | U+223C | `~` | Tilde operator |
| `≤` | U+2264 | `<=` | Less-than or equal to |
| `≥` | U+2265 | `>=` | Greater-than or equal to |
| `≠` | U+2260 | `!=` | Not equal to |

### Fullwidth ASCII Variants (CJK Input)

| Input | Code | Output | Description |
|-------|------|--------|-------------|
| `！` | U+FF01 | `!` | Fullwidth exclamation mark |
| `＂` | U+FF02 | `"` | Fullwidth quotation mark |
| `＃` | U+FF03 | `#` | Fullwidth number sign |
| `＄` | U+FF04 | `$` | Fullwidth dollar sign |
| `％` | U+FF05 | `%` | Fullwidth percent sign |
| `＆` | U+FF06 | `&` | Fullwidth ampersand |
| `＇` | U+FF07 | `'` | Fullwidth apostrophe |
| `（` | U+FF08 | `(` | Fullwidth left parenthesis |
| `）` | U+FF09 | `)` | Fullwidth right parenthesis |
| `＊` | U+FF0A | `*` | Fullwidth asterisk |
| `＋` | U+FF0B | `+` | Fullwidth plus sign |
| `，` | U+FF0C | `,` | Fullwidth comma |
| `．` | U+FF0E | `.` | Fullwidth full stop |
| `／` | U+FF0F | `/` | Fullwidth solidus |
| `：` | U+FF1A | `:` | Fullwidth colon |
| `；` | U+FF1B | `;` | Fullwidth semicolon |
| `＜` | U+FF1C | `<` | Fullwidth less-than |
| `＝` | U+FF1D | `=` | Fullwidth equals |
| `＞` | U+FF1E | `>` | Fullwidth greater-than |
| `？` | U+FF1F | `?` | Fullwidth question mark |
| `＠` | U+FF20 | `@` | Fullwidth at sign |
| `［` | U+FF3B | `[` | Fullwidth left square bracket |
| `＼` | U+FF3C | `\` | Fullwidth reverse solidus |
| `］` | U+FF3D | `]` | Fullwidth right square bracket |
| `＾` | U+FF3E | `^` | Fullwidth circumflex |
| `＿` | U+FF3F | `_` | Fullwidth underscore |
| `` ` `` | U+FF40 | `` ` `` | Fullwidth grave accent |
| `｛` | U+FF5B | `{` | Fullwidth left curly bracket |
| `｜` | U+FF5C | `\|` | Fullwidth vertical line |
| `｝` | U+FF5D | `}` | Fullwidth right curly bracket |
| `～` | U+FF5E | `~` | Fullwidth tilde |

## ✨ Pro Tips

```
  ✓ Always dry-run first       Preview changes with default mode
  ✓ Version control safe       Log shows exactly what changed
  ✓ Lightning fast             Processes thousands of files in seconds
  ✓ Zero deps at runtime       Only glob is required
```

## 🔨 Building

```bash
npm run build    # Compile TypeScript
npm run dev      # Watch mode
```

**Quality checks:**
- TypeScript strict mode enabled
- Zero `any` types
- Full type safety

## 📜 License

MIT

---

<div align="center">

**Made with care to clean up your code.** ✨

</div>
