import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { spawnSync } from "node:child_process";

test("Nâng cấp database cũ giữ hồ sơ, file, trạng thái và quan hệ vị trí", () => {
  const dir = mkdtempSync(join(tmpdir(), "anninh-migration-"));
  try {
    const db = new DatabaseSync(join(dir, "site.sqlite"));
    db.exec(
      readFileSync(new URL("../schema.sql", import.meta.url), "utf8").replace(
        "job_id TEXT REFERENCES",
        "job_id TEXT NOT NULL REFERENCES",
      ),
    );
    db.prepare("INSERT INTO jobs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").run(
      "old-job",
      "DEMO",
      "demo",
      "DEMO",
      "",
      "DEMO",
      1,
      "DEMO",
      "DEMO",
      "DEMO",
      "closed",
      "2025-01-01",
      "2025-01-01",
    );
    db.prepare("INSERT INTO applications VALUES(?,?,?,?,?,?,?)").run(
      "old-app",
      "old-job",
      '{"name":"DEMO"}',
      "file-kept",
      "Đang xem xét",
      "DEMO — ghi chú",
      "2025-01-01",
    );
    db.close();
    const run = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import {db} from './db.mjs';
      const row = db.prepare('SELECT * FROM applications').get();
      const jobColumn = db.prepare('PRAGMA table_info(applications)').all().find(c => c.name === 'job_id');
      db.prepare('INSERT INTO applications(id,job_id,data,created_at) VALUES(?,NULL,?,?)').run('new-general','{}','2026-01-01');
      console.log(JSON.stringify({row, nullable: !jobColumn.notnull, violations: db.prepare('PRAGMA foreign_key_check').all(), count: db.prepare('SELECT COUNT(*) n FROM applications').get().n})); db.close();`,
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATA_DIR: dir },
        encoding: "utf8",
      },
    );
    assert.equal(run.status, 0, run.stderr);
    const result = JSON.parse(run.stdout);
    assert.equal(result.row.id, "old-app");
    assert.equal(result.row.job_id, "old-job");
    assert.equal(result.row.file_id, "file-kept");
    assert.equal(result.row.status, "Đang xem xét");
    assert.equal(result.row.notes, "DEMO — ghi chú");
    assert.equal(result.nullable, true);
    assert.deepEqual(result.violations, []);
    assert.equal(result.count, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
