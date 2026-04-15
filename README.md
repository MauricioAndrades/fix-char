```
▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖     ▗▄▄▖▗▖ ▗▖ ▗▄▖ ▗▄▄▖ 
▐▌     █   ▝▚▞▘     ▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌
▐▛▀▀▘  █    ▐▌      ▐▌   ▐▛▀▜▌▐▛▀▜▌▐▛▀▚▖
▐▌   ▗▄█▄▖▗▞▘▝▚▖    ▝▚▄▄▖▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌                
```
**Fix unwanted Unicode characters in your text files.**

```
1. git clone https://github.com/MauricioAndrades/fix-char
2. cd fix-char
3. npm link
```

```
fix-char src/**/*.ts
fix-char src/**/*.md
```

Clean up smart quotes, dashes, spaces, and other problematic Unicode variants that sneak into your code and docs through copy-paste, clipboard operations, and rich text editors.

Replaces Unicode variants with their ASCII equivalents:

| Type | Examples | Result |
|------|----------|--------|
| **Smart quotes** | ', ', ", " | Regular quotes: ', ", etc. |
| **Dashes** | –, —, −, ‐ | Hyphens: `-` |
| **Spaces** | NBSP, zero-width, thin | Regular spaces |
| **Fullwidth ASCII** | Common in CJK input | Regular ASCII |
| **Punctuation** | …, ‖, †, ‡ | Safe equivalents|
