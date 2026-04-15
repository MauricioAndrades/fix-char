```
▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖     ▗▄▄▖▗▖ ▗▖ ▗▄▖ ▗▄▄▖ 
▐▌     █   ▝▚▞▘     ▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌
▐▛▀▀▘  █    ▐▌      ▐▌   ▐▛▀▜▌▐▛▀▜▌▐▛▀▚▖
▐▌   ▗▄█▄▖▗▞▘▝▚▖    ▝▚▄▄▖▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌                
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

### Quotation Marks (U+2018–U+203A)

| Input | Code | Output |
|-------|------|--------|
| `'` | U+2018 (Left single) | `'` |
| `'` | U+2019 (Right single) | `'` |
| `"` | U+201C (Left double) | `"` |
| `"` | U+201D (Right double) | `"` |

### Dashes & Hyphens (U+2010–U+2015)

| Input | Code | Output |
|-------|------|--------|
| `–` | U+2013 (en dash) | `-` |
| `—` | U+2014 (em dash) | `--` |
| `−` | U+2212 (minus) | `-` |

### Spaces & Invisible Characters (U+00A0, U+2000–U+200F)

| Input | Code | Output |
|-------|------|--------|
| ` ` | U+00A0 (NBSP) | ` ` (space) |
| `` | U+200B (zero-width) | (removed) |
| `` | U+200D (joiner) | (removed) |

**Complete mapping:** See `src/index.ts`

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
