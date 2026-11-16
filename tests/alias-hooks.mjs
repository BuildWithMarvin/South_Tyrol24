import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(root, specifier.slice(2));
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`];
    const found = candidates.find((file) => existsSync(file) && !file.endsWith(path.sep));
    if (found) {
      return nextResolve(pathToFileURL(found).href, context);
    }
  }

  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json") && url.startsWith("file:")) {
    return {
      format: "json",
      shortCircuit: true,
      source: readFileSync(fileURLToPath(url), "utf8"),
    };
  }

  return nextLoad(url, context);
}
