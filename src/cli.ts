#!/usr/bin/env node

import { parseArgs } from "node:util";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { processDirectory, fixContent } from "./index.js";

interface CliArgs {
  write: boolean;
  hide: string;
  exclude: string | undefined;
  stdin: boolean;
}

const { values: argv, positionals } = parseArgs({
  args: process.argv.slice(2),
  strict: false,
  allowPositionals: true,
  options: {
    write: { default: false, type: "boolean", short: "w" },
    hide: { default: "EOF", type: "string" },
    exclude: { type: "string" },
    stdin: { default: false, type: "boolean" },
  },
});

const cliArgs = argv as CliArgs;

if (cliArgs.stdin) {
  const input = process.stdin.isTTY
    ? execSync("pbpaste", { encoding: "utf8" })
    : readFileSync(process.stdin.fd, "utf8");
  const output = fixContent(input);
  execSync("pbcopy", { input: output, encoding: "utf8" });
  process.stdout.write(output + "\n");
  process.exit(0);
}

const target = positionals[0] || process.cwd();
const excludeList: string[] = [];

if (cliArgs.exclude) {
  excludeList.push(...cliArgs.exclude.split(",").map((p) => p.trim()));
}

processDirectory({
  target,
  write: cliArgs.write,
  hideEof: cliArgs.hide,
  exclude: excludeList,
  cwd: process.cwd(),
});
