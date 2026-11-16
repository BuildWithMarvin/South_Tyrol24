// Lets `node --test` import the Next.js route handler: resolves the `@/` alias
// and extensionless `next/server`, and allows the JSON import without attributes.
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
