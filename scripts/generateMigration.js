import { spawnSync } from "child_process";

const args = process.argv.slice(2);

const generate = spawnSync(
  "npx",
  ["typeorm-ts-node-esm", "migration:generate", ...args],
  { stdio: "inherit" },
);

if (generate.status !== 0) {
  process.exit(generate.status ?? 1);
}

// TypeORM's CLI hardcodes `import { MigrationInterface, QueryRunner } from "typeorm"`,
// which fails under verbatimModuleSyntax. Auto-fix it to a type-only import.
const fix = spawnSync("npx", ["eslint", "--fix", "src/migration"], {
  stdio: "inherit",
});

process.exit(fix.status ?? 0);
