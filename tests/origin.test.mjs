import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";

const directory = mkdtempSync(join(tmpdir(), "anninh-origins-"));
process.env.DATA_DIR = directory;
process.env.NO_LISTEN = "1";
process.env.PORT = "3000";
delete process.env.TRUST_PROXY;
delete process.env.CODESPACE_NAME;
delete process.env.SITE_URL;
delete process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const { app, db } = await import("../server.mjs");
const salt = randomBytes(16).toString("hex");
const password = randomBytes(24).toString("base64url");
db.prepare(
  "INSERT INTO admins(username,hash,salt,must_change) VALUES(?,?,?,1)",
).run(
  "origin-test-admin",
  scryptSync(password, salt, 64).toString("hex"),
  salt,
);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const endpoint = `http://127.0.0.1:${server.address().port}`;
const codespace = "friendly-demo-1234567890";
const publicOrigin = `https://${codespace}-3000.app.github.dev`;
async function login(origin, headers = {}) {
  return fetch(endpoint + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, ...headers },
    body: JSON.stringify({ username: "origin-test-admin", password }),
  });
}

await test("Đăng nhập HTTP trực tiếp vẫn hoạt động khi không có cấu hình proxy", async () => {
  assert.equal((await login(endpoint)).status, 200);
});
await test("Codespaces: đăng nhập HTTPS thành công dù SITE_URL cũ là localhost và chưa bật trust proxy", async () => {
  process.env.CODESPACE_NAME = codespace;
  process.env.SITE_URL = "http://localhost:3000";
  process.env.NODE_ENV = "production";
  const response = await login(publicOrigin, { "X-Forwarded-Proto": "https" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).must_change, true);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
  assert.match(response.headers.get("set-cookie"), /SameSite=Strict/);
  assert.match(response.headers.get("set-cookie"), /Secure/);
});
await test("Codespaces: địa chỉ HTTPS đúng được nhận khi khởi chạy trực tiếp, không có SITE_URL", async () => {
  delete process.env.SITE_URL;
  assert.equal((await login(publicOrigin)).status, 200);
});
await test("Chặn Codespace khác, sai cổng/giao thức, miền giả, null và header chuyển tiếp giả", async () => {
  process.env.SITE_URL = "http://localhost:3000";
  for (const origin of [
    "https://other-demo-1234567890-3000.app.github.dev",
    `https://${codespace}-3001.app.github.dev`,
    `http://${codespace}-3000.app.github.dev`,
    `${publicOrigin}.evil.example`,
    "https://evil.example",
    "null",
  ]) {
    const response = await login(origin, {
      "X-Forwarded-Host": new URL(
        origin === "null" ? "https://evil.example" : origin,
      ).host,
      "X-Forwarded-Proto": "https",
    });
    assert.equal(response.status, 403, origin);
  }
});
await test("Codespaces đổi Origin thành localhost: đăng nhập và đọc phiên thành công với Referer công khai", async () => {
  process.env.CODESPACE_NAME = codespace;
  process.env.SITE_URL = publicOrigin;
  process.env.NODE_ENV = "production";
  for (const rewrittenOrigin of [
    "http://localhost:3000",
    "https://localhost:3000",
  ]) {
    const response = await login(rewrittenOrigin, {
      Referer: publicOrigin + "/admin",
      "Sec-Fetch-Site": "same-origin",
    });
    assert.equal(response.status, 200, rewrittenOrigin);
    const cookie = response.headers.get("set-cookie").split(";")[0];
    assert.match(response.headers.get("set-cookie"), /Secure/);
    const me = await fetch(endpoint + "/api/admin/me", {
      headers: { Cookie: cookie },
    });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).username, "origin-test-admin");
  }
});
await test("Nguồn localhost giả, sai cổng, thiếu bằng chứng cùng nguồn và yêu cầu cross-site vẫn bị chặn", async () => {
  process.env.CODESPACE_NAME = codespace;
  process.env.SITE_URL = publicOrigin;
  for (const [origin, headers] of [
    [
      "http://localhost:3001",
      { Referer: publicOrigin + "/admin", "Sec-Fetch-Site": "same-origin" },
    ],
    ["http://localhost:3000", {}],
    [
      "http://localhost:3000",
      { Referer: "https://evil.example/", "Sec-Fetch-Site": "cross-site" },
    ],
    [publicOrigin, { "Sec-Fetch-Site": "cross-site" }],
  ])
    assert.equal((await login(origin, headers)).status, 403);
});
await test("Tên miền production đã cấu hình tiếp tục được chấp nhận và chặn nguồn khác", async () => {
  delete process.env.CODESPACE_NAME;
  process.env.SITE_URL = "https://anninh.example.test";
  assert.equal((await login(process.env.SITE_URL)).status, 200);
  assert.equal((await login(publicOrigin)).status, 403);
  assert.equal((await login("https://evil.example")).status, 403);
  assert.equal(
    (
      await login("http://localhost:3000", {
        Referer: publicOrigin + "/admin",
        "Sec-Fetch-Site": "same-origin",
      })
    ).status,
    403,
  );
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(directory, { recursive: true, force: true });
});
