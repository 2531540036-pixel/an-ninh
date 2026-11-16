import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
export const dataDir = resolve(process.env.DATA_DIR || "data");
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
export const db = new DatabaseSync(resolve(dataDir, "site.sqlite"));
db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
// Preserve existing applications when upgrading databases created before open registrations.
if (
  db
    .prepare("PRAGMA table_info(applications)")
    .all()
    .find((c) => c.name === "job_id")?.notnull
) {
  db.exec(`BEGIN IMMEDIATE;
    CREATE TABLE applications_upgrade(id TEXT PRIMARY KEY, job_id TEXT REFERENCES jobs(id), data TEXT NOT NULL, file_id TEXT, status TEXT NOT NULL DEFAULT 'Mới nhận', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
    INSERT INTO applications_upgrade SELECT * FROM applications;
    DROP TABLE applications;
    ALTER TABLE applications_upgrade RENAME TO applications;
    CREATE INDEX applications_job ON applications(job_id);
    COMMIT;`);
}
export const initialSettings = {
  name: "Công ty Cổ phần Dịch vụ Bảo vệ An Ninh",
  shortName: "AN NINH",
  tagline: "Nơi gửi trọn niềm tin",
  founded: "25/6/2006",
  founder: "Nguyễn Duy Tư",
  phone: "",
  hotline: "",
  email: "",
  address: "",
  map: "",
  zalo: "",
  facebook: "",
  logo: "",
  hero: "",
  team: "",
  training: "",
  serviceBuilding: "",
  serviceFactory: "",
  serviceBank: "",
  serviceHospital: "",
  footer: "Thông tin liên hệ chính thức đang được cập nhật.",
  about:
    "Công ty An Ninh được thành lập ngày 25/6/2006 bởi ông Nguyễn Duy Tư, từng là sĩ quan nghiệp vụ trong lực lượng Công an nhân dân. Trước nhu cầu bảo đảm an ninh trong quá trình phát triển kinh tế, công ty ra đời nhằm bảo vệ tính mạng, tài sản của các đơn vị, doanh nghiệp và cá nhân; góp phần giữ gìn trật tự, an toàn xã hội.",
  historyNote:
    "Ngày thành lập và thông tin người sáng lập theo nội dung doanh nghiệp cung cấp; tiểu sử chi tiết đang được bổ sung.",
};
db.prepare("INSERT OR IGNORE INTO settings(id,data) VALUES(1,?)").run(
  JSON.stringify(initialSettings),
);
export const all = (sql, ...args) => db.prepare(sql).all(...args);
export const one = (sql, ...args) => db.prepare(sql).get(...args);
export const run = (sql, ...args) => db.prepare(sql).run(...args);
export const settings = () =>
  JSON.parse(one("SELECT data FROM settings WHERE id=1").data);
