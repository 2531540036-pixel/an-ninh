import { randomBytes, scryptSync } from "node:crypto";
import { db, run } from "../db.mjs";
const username = process.env.ADMIN_USERNAME || "admin";
const password =
  process.env.ADMIN_PASSWORD || randomBytes(18).toString("base64url");
if (password.length < 12) throw Error("Mật khẩu cần ít nhất 12 ký tự");
const salt = randomBytes(16).toString("hex");
run(
  "INSERT INTO admins(username,hash,salt,must_change) VALUES(?,?,?,1) ON CONFLICT(username) DO UPDATE SET hash=excluded.hash,salt=excluded.salt,must_change=1",
  username,
  scryptSync(password, salt, 64).toString("hex"),
  salt,
);
run("DELETE FROM sessions");
console.log("Tên đăng nhập:", username);
console.log("Mật khẩu tạm thời:", password);
console.log(
  "Phải đổi mật khẩu sau khi đăng nhập. Không chia sẻ thông tin này.",
);
db.close();
