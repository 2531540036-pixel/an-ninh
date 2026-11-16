import express from "express";
import multer from "multer";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  existsSync,
} from "node:fs";
import { resolve, basename } from "node:path";
import { db, dataDir, all, one, run, settings } from "./db.mjs";
const app = express(),
  port = Number(process.env.PORT || 3000),
  uploadDir = resolve(dataDir, "uploads");
mkdirSync(uploadDir, { recursive: true, mode: 0o700 });
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
const hash = (x) => createHash("sha256").update(x).digest("hex");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy":
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-src https://www.google.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  });
  if (req.path.startsWith("/api/")) res.set("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    let origin = req.get("origin");
    const expectedOrigin = process.env.SITE_URL
      ? new URL(process.env.SITE_URL).origin
      : `${req.protocol}://${req.get("host")}`;
    if (origin && origin !== expectedOrigin)
      return res.status(403).json({ error: "Nguồn yêu cầu không hợp lệ." });
  }
  next();
});
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
const text = (v, max = 10000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function required(v, label, max = 200) {
  const s = text(v, max + 1);
  if (!s || s.length > max)
    throw fail(`${label} là bắt buộc, tối đa ${max} ký tự.`);
  return s;
}
const statuses = {
  contacts: ["Mới", "Đang xử lý", "Đã liên hệ", "Hoàn thành"],
  applications: [
    "Mới nhận",
    "Đang xem xét",
    "Đã liên hệ",
    "Mời phỏng vấn",
    "Đạt",
    "Không phù hợp",
  ],
};
function details(b) {
  let d = {
    name: required(b.name, "Họ tên", 120),
    phone: required(b.phone, "Số điện thoại", 24),
    email: required(b.email, "Email", 200),
  };
  if (
    !/^(?:\+84|0)[\d\s.-]{8,13}$/.test(d.phone) ||
    d.phone.replace(/\D/g, "").length < 10
  )
    throw fail("Số điện thoại Việt Nam không hợp lệ.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    throw fail("Email không hợp lệ.");
  return d;
}
function throttle(req, res, key, max, seconds) {
  let now = Date.now(),
    k = `${key}:${req.ip}`,
    r = one("SELECT * FROM attempts WHERE key=?", k);
  if (r && r.expires > now && r.count >= max) {
    res.set("Retry-After", String(Math.ceil((r.expires - now) / 1000)));
    throw fail("Bạn thao tác quá nhanh. Vui lòng thử lại sau.", 429);
  }
  if (!r || r.expires <= now)
    run(
      "INSERT INTO attempts(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=1,expires=excluded.expires",
      k,
      now + seconds * 1000,
    );
  else run("UPDATE attempts SET count=count+1 WHERE key=?", k);
}
function session(req) {
  let raw = (req.headers.cookie || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("an_session="))
    ?.slice(11);
  return (
    raw &&
    one(
      "SELECT a.id,a.username,a.must_change,s.token_hash FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires>?",
      hash(raw),
      Date.now(),
    )
  );
}
function auth(req, res, next) {
  req.admin = session(req);
  if (!req.admin)
    return res.status(401).json({ error: "Vui lòng đăng nhập quản trị." });
  if (
    req.admin.must_change &&
    !["/api/admin/me", "/api/admin/password", "/api/admin/logout"].includes(
      req.originalUrl.split("?")[0],
    )
  )
    return res
      .status(403)
      .json({ error: "Vui lòng đổi mật khẩu tạm thời trước khi sử dụng." });
  next();
}
const cookie = (token, age) =>
  `an_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
app.post("/api/admin/login", (req, res) => {
  throttle(req, res, "login", 8, 900);
  let a = one(
      "SELECT * FROM admins WHERE username=?",
      text(req.body.username, 200),
    ),
    salt = a?.salt || "dummy-login-salt",
    candidate = scryptSync(text(req.body.password, 1000), salt, 64),
    expected = a ? Buffer.from(a.hash, "hex") : Buffer.alloc(64);
  if (!timingSafeEqual(candidate, expected) || !a)
    throw fail("Tên đăng nhập hoặc mật khẩu không đúng.", 401);
  let token = randomBytes(32).toString("base64url");
  run("DELETE FROM sessions WHERE expires<?", Date.now());
  run(
    "INSERT INTO sessions VALUES(?,?,?)",
    hash(token),
    a.id,
    Date.now() + 8 * 3600e3,
  );
  res
    .set("Set-Cookie", cookie(token, 8 * 3600))
    .json({ username: a.username, must_change: !!a.must_change });
});
app.use("/api/admin", auth);
app.get("/api/admin/me", (req, res) =>
  res.json({
    username: req.admin.username,
    must_change: !!req.admin.must_change,
  }),
);
app.post("/api/admin/logout", (req, res) => {
  run("DELETE FROM sessions WHERE token_hash=?", req.admin.token_hash);
  res.set("Set-Cookie", cookie("", 0)).json({ ok: true });
});
app.post("/api/admin/password", (req, res) => {
  throttle(req, res, "password", 8, 900);
  let a = one("SELECT * FROM admins WHERE id=?", req.admin.id);
  if (
    !timingSafeEqual(
      scryptSync(text(req.body.current, 1000), a.salt, 64),
      Buffer.from(a.hash, "hex"),
    )
  )
    throw fail("Mật khẩu hiện tại không đúng.");
  let p = required(req.body.password, "Mật khẩu mới", 200);
  if (p.length < 12) throw fail("Mật khẩu mới cần ít nhất 12 ký tự.");
  if (p === req.body.current)
    throw fail("Mật khẩu mới phải khác mật khẩu hiện tại.");
  let salt = randomBytes(16).toString("hex");
  run(
    "UPDATE admins SET hash=?,salt=?,must_change=0 WHERE id=?",
    scryptSync(p, salt, 64).toString("hex"),
    salt,
    a.id,
  );
  run("DELETE FROM sessions WHERE admin_id=?", a.id);
  res.set("Set-Cookie", cookie("", 0)).json({ ok: true });
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, fieldSize: 20000 },
});
function storeFile(file, isPublic = false) {
  if (!file) throw fail("Vui lòng chọn tệp.");
  let b = file.buffer,
    ext = basename(file.originalname).split(".").pop().toLowerCase(),
    mime;
  if (isPublic) {
    if (
      ext === "png" &&
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      mime = "image/png";
    if (
      ["jpg", "jpeg"].includes(ext) &&
      b[0] === 255 &&
      b[1] === 216 &&
      b[2] === 255
    )
      mime = "image/jpeg";
    if (
      ext === "webp" &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP"
    )
      mime = "image/webp";
  } else {
    if (ext === "pdf" && b.toString("ascii", 0, 5) === "%PDF-")
      mime = "application/pdf";
    if (
      ext === "doc" &&
      b.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex"))
    )
      mime = "application/msword";
    if (
      ext === "docx" &&
      b[0] === 80 &&
      b[1] === 75 &&
      b.includes(Buffer.from("[Content_Types].xml")) &&
      b.includes(Buffer.from("word/"))
    )
      mime =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (!mime)
    throw fail(
      isPublic
        ? "Chỉ nhận ảnh PNG, JPG, WEBP hợp lệ."
        : "Chỉ nhận hồ sơ PDF, DOC, DOCX hợp lệ (tối đa 5 MB).",
    );
  let id = randomUUID(),
    disk_name = id + "." + ext;
  writeFileSync(resolve(uploadDir, disk_name), b, { mode: 0o600 });
  try {
    run(
      "INSERT INTO files VALUES(?,?,?,?,?,?,?)",
      id,
      disk_name,
      text(basename(file.originalname), 150),
      mime,
      b.length,
      isPublic ? 1 : 0,
      new Date().toISOString(),
    );
  } catch (e) {
    unlinkSync(resolve(uploadDir, disk_name));
    throw e;
  }
  return id;
}
function fileResponse(req, res, privateFile) {
  let f = one("SELECT * FROM files WHERE id=?", req.params.id);
  if (!f || (!privateFile && !f.public)) throw fail("Không tìm thấy tệp.", 404);
  if (privateFile)
    res.set(
      "Content-Disposition",
      `attachment; filename="download.${f.disk_name.split(".").pop()}"; filename*=UTF-8''${encodeURIComponent(f.original_name)}`,
    );
  res.type(f.mime).sendFile(resolve(uploadDir, f.disk_name));
}
app.post("/api/admin/images", upload.single("file"), (req, res) =>
  res.json({ url: "/media/" + storeFile(req.file, true) }),
);
app.get("/api/admin/files/:id", (req, res) => fileResponse(req, res, true));
app.get("/media/:id", (req, res) => fileResponse(req, res, false));
app.get("/api/site", (req, res) => res.json(settings()));
app.get("/api/admin/settings", (req, res) => res.json(settings()));
app.put("/api/admin/settings", (req, res) => {
  let s = settings();
  for (let k of Object.keys(s))
    if (k in req.body) s[k] = text(req.body[k], k === "about" ? 10000 : 1000);
  required(s.name, "Tên công ty");
  for (let k of [
    "logo",
    "hero",
    "team",
    "training",
    "serviceBuilding",
    "serviceFactory",
    "serviceBank",
    "serviceHospital",
  ])
    if (s[k] && !/^\/media\/[a-f\d-]+$/.test(s[k]))
      throw fail("Ảnh phải được tải qua chức năng upload.");
  for (let k of ["zalo", "facebook", "map"])
    if (s[k] && !s[k].startsWith("https://"))
      throw fail("Liên kết phải bắt đầu bằng https://");
  if (s.map && !/^https:\/\/(www\.)?google\.com\/maps\//.test(s.map))
    throw fail("Bản đồ phải là liên kết Google Maps.");
  run("UPDATE settings SET data=? WHERE id=1", JSON.stringify(s));
  res.json(s);
});
function slug(value) {
  return (
    text(value, 160)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "bai-viet"
  );
}
function postData(b) {
  let title = required(b.title, "Tiêu đề", 200),
    status = b.status;
  if (!["draft", "published", "hidden"].includes(status))
    throw fail("Trạng thái bài viết không hợp lệ.");
  let image = text(b.image, 200);
  if (image && !/^\/media\/[a-f\d-]+$/.test(image))
    throw fail("Ảnh không hợp lệ.");
  return {
    title,
    slug: slug(b.slug || title),
    category: required(b.category, "Danh mục", 100),
    content: required(b.content, "Nội dung", 100000),
    image,
    status,
  };
}
function jobData(b) {
  let title = required(b.title, "Tên vị trí", 200),
    quantity = Number(b.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000)
    throw fail("Số lượng cần tuyển phải từ 1 đến 10.000.");
  if (!["open", "closed"].includes(b.status))
    throw fail("Trạng thái tuyển dụng không hợp lệ.");
  return {
    title,
    slug: slug(b.slug || title),
    location: required(b.location, "Địa điểm", 300),
    salary: text(b.salary, 200),
    schedule: required(b.schedule, "Thời gian làm việc", 300),
    quantity,
    description: required(b.description, "Mô tả công việc", 20000),
    requirements: required(b.requirements, "Yêu cầu", 20000),
    benefits: required(b.benefits, "Quyền lợi", 20000),
    status: b.status,
  };
}
for (const [table, parse] of [
  ["posts", postData],
  ["jobs", jobData],
]) {
  app.get(`/api/admin/${table}`, (req, res) =>
    res.json(all(`SELECT * FROM ${table} ORDER BY created_at DESC`)),
  );
  app.post(`/api/admin/${table}`, (req, res) => {
    let d = parse(req.body),
      id = randomUUID(),
      now = new Date().toISOString(),
      keys = Object.keys(d);
    run(
      `INSERT INTO ${table}(id,${keys.join(",")},created_at,updated_at) VALUES(${Array(keys.length + 3).fill("?")})`,
      id,
      ...Object.values(d),
      now,
      now,
    );
    res.status(201).json({ id });
  });
  app.put(`/api/admin/${table}/:id`, (req, res) => {
    if (!one(`SELECT id FROM ${table} WHERE id=?`, req.params.id))
      throw fail("Không tìm thấy dữ liệu.", 404);
    let d = parse(req.body);
    run(
      `UPDATE ${table} SET ${Object.keys(d)
        .map((k) => k + "=?")
        .join(",")},updated_at=? WHERE id=?`,
      ...Object.values(d),
      new Date().toISOString(),
      req.params.id,
    );
    res.json({ ok: true });
  });
  app.delete(`/api/admin/${table}/:id`, (req, res) => {
    if (
      table === "jobs" &&
      one("SELECT id FROM applications WHERE job_id=?", req.params.id)
    )
      throw fail(
        "Vị trí đã có hồ sơ ứng tuyển. Hãy đóng tuyển dụng để giữ lịch sử.",
      );
    run(`DELETE FROM ${table} WHERE id=?`, req.params.id);
    res.json({ ok: true });
  });
  app.get(`/api/${table}`, (req, res) => {
    let page = Math.max(1, Math.min(100000, Number(req.query.page) || 1)),
      q = "%" + text(req.query.q, 100) + "%",
      where = table === "posts" ? "status='published'" : "1=1",
      args = [q, q];
    if (req.query.category && table === "posts") {
      where += " AND category=?";
      args.unshift(text(req.query.category, 100));
    }
    if (table === "jobs" && ["open", "closed"].includes(req.query.status)) {
      where += " AND status=?";
      args.unshift(req.query.status);
    }
    where +=
      " AND (title LIKE ? OR " +
      (table === "posts" ? "content" : "location") +
      " LIKE ?)";
    let total = one(
      `SELECT COUNT(*) n FROM ${table} WHERE ${where}`,
      ...args,
    ).n;
    res.json({
      items: all(
        `SELECT * FROM ${table} WHERE ${where} ORDER BY created_at DESC LIMIT 6 OFFSET ?`,
        ...args,
        (page - 1) * 6,
      ),
      total,
      page,
      pages: Math.ceil(total / 6),
    });
  });
  app.get(`/api/${table}/:slug`, (req, res) => {
    let r = one(
      `SELECT * FROM ${table} WHERE (slug=? OR id=?) ${table === "posts" ? "AND status='published'" : ""}`,
      req.params.slug,
      req.params.slug,
    );
    if (!r) throw fail("Không tìm thấy nội dung.", 404);
    res.json(r);
  });
}
app.post("/api/contacts", (req, res) => {
  throttle(req, res, "contact", 10, 3600);
  let b = req.body,
    d = {
      ...details(b),
      company: text(b.company, 300),
      service: required(b.service, "Dịch vụ quan tâm", 200),
      location: required(b.location, "Địa điểm", 500),
      quantity: text(b.quantity, 20),
      message: required(b.message, "Nội dung yêu cầu", 10000),
    };
  if (b.consent !== true)
    throw fail("Vui lòng đồng ý xử lý thông tin để tiếp nhận yêu cầu.");
  if (
    d.quantity &&
    (!/^\d+$/.test(d.quantity) || +d.quantity < 1 || +d.quantity > 10000)
  )
    throw fail("Số nhân viên dự kiến không hợp lệ.");
  let id = randomUUID();
  run(
    "INSERT INTO contacts(id,data,created_at) VALUES(?,?,?)",
    id,
    JSON.stringify(d),
    new Date().toISOString(),
  );
  res.status(201).json({
    id,
    message:
      "Yêu cầu đã được lưu. Bộ phận phụ trách sẽ tiếp nhận thông tin của bạn.",
  });
});
app.post(
  "/api/applications",
  (req, res, next) => {
    try {
      throttle(req, res, "apply", 10, 3600);
      next();
    } catch (e) {
      next(e);
    }
  },
  upload.single("file"),
  (req, res) => {
    const b = req.body;
    const jobId = text(b.job_id, 100);
    const j = jobId
      ? one("SELECT id FROM jobs WHERE id=? AND status='open'", jobId)
      : null;
    if (jobId && !j) throw fail("Vị trí không còn nhận hồ sơ.");
    const d = {
      ...(jobId
        ? details(b)
        : {
            name: required(b.name, "Họ tên", 120),
            phone: required(b.phone, "Số điện thoại", 24),
            email: text(b.email, 200),
          }),
      birth: jobId ? required(b.birth, "Ngày sinh", 10) : text(b.birth, 10),
      gender: text(b.gender, 50),
      address: jobId
        ? required(b.address, "Địa chỉ hiện tại", 500)
        : text(b.address, 500),
      education: text(b.education, 300),
      experience: jobId
        ? required(b.experience, "Kinh nghiệm", 10000)
        : text(b.experience, 10000),
      intro: required(b.intro, "Giới thiệu bản thân", 10000),
      location: jobId
        ? text(b.location, 500)
        : required(b.location, "Khu vực mong muốn", 500),
      availability: text(b.availability, 500),
    };
    if (
      !/^(?:\+84|0)[\d\s.-]{8,13}$/.test(d.phone) ||
      d.phone.replace(/\D/g, "").length < 10
    )
      throw fail("Số điện thoại Việt Nam không hợp lệ.");
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      throw fail("Email không hợp lệ.");
    if (
      d.birth &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(d.birth) ||
        !Number.isFinite(Date.parse(d.birth)) ||
        new Date(d.birth).toISOString().slice(0, 10) !== d.birth ||
        new Date(d.birth) > new Date() ||
        new Date(d.birth).getFullYear() < 1900)
    )
      throw fail("Ngày sinh không hợp lệ.");
    if (b.consent !== "true")
      throw fail("Vui lòng đồng ý xử lý hồ sơ ứng tuyển.");
    let file_id = req.file
        ? storeFile(req.file)
        : jobId
          ? storeFile(req.file)
          : null,
      id = randomUUID();
    try {
      run(
        "INSERT INTO applications(id,job_id,data,file_id,created_at) VALUES(?,?,?,?,?)",
        id,
        j?.id || null,
        JSON.stringify(d),
        file_id,
        new Date().toISOString(),
      );
    } catch (e) {
      let f = one("SELECT * FROM files WHERE id=?", file_id);
      if (f) {
        run("DELETE FROM files WHERE id=?", file_id);
        unlinkSync(resolve(uploadDir, f.disk_name));
      }
      throw e;
    }
    res.status(201).json({
      id,
      message: "Hồ sơ đã được lưu và chuyển đến bộ phận tuyển dụng.",
    });
  },
);
for (const table of ["contacts", "applications"]) {
  app.get(`/api/admin/${table}`, (req, res) => {
    let rows = all(`SELECT * FROM ${table} ORDER BY created_at DESC`).map(
      (r) => ({
        ...r,
        data: JSON.parse(r.data),
        ...(table === "applications"
          ? {
              job_title: r.job_id
                ? one("SELECT title FROM jobs WHERE id=?", r.job_id)?.title
                : "Đăng ký ứng tuyển chung",
            }
          : {}),
      }),
    );
    res.json(rows);
  });
  app.put(`/api/admin/${table}/:id`, (req, res) => {
    if (!statuses[table].includes(req.body.status))
      throw fail("Trạng thái không hợp lệ.");
    run(
      `UPDATE ${table} SET status=?,notes=? WHERE id=?`,
      req.body.status,
      text(req.body.notes, 10000),
      req.params.id,
    );
    res.json({ ok: true });
  });
  app.delete(`/api/admin/${table}/:id`, (req, res) => {
    let r = one(`SELECT * FROM ${table} WHERE id=?`, req.params.id);
    run(`DELETE FROM ${table} WHERE id=?`, req.params.id);
    if (r?.file_id) {
      let f = one("SELECT * FROM files WHERE id=?", r.file_id);
      if (f) {
        run("DELETE FROM files WHERE id=?", f.id);
        try {
          unlinkSync(resolve(uploadDir, f.disk_name));
        } catch {}
      }
    }
    res.json({ ok: true });
  });
}
app.get("/api/admin/dashboard", (req, res) =>
  res.json({
    posts: one("SELECT COUNT(*) n FROM posts").n,
    published: one("SELECT COUNT(*) n FROM posts WHERE status='published'").n,
    contacts: one("SELECT COUNT(*) n FROM contacts").n,
    newContacts: one("SELECT COUNT(*) n FROM contacts WHERE status='Mới'").n,
    applications: one("SELECT COUNT(*) n FROM applications").n,
    newApplications: one(
      "SELECT COUNT(*) n FROM applications WHERE status='Mới nhận'",
    ).n,
    openJobs: one("SELECT COUNT(*) n FROM jobs WHERE status='open'").n,
  }),
);
app.use("/api", (req, res) =>
  res.status(404).json({ error: "API không tồn tại." }),
);
const dist = resolve("dist");
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
app.get(
  /^\/(?!api(?:\/|$)|media(?:\/|$)|assets(?:\/|$)|company-images(?:\/|$)|fonts(?:\/|$)|robots\.txt$|sitemap\.xml$).*$/,
  (req, res, next) => {
    if (!existsSync(resolve(dist, "index.html"))) return next();
    let s = settings(),
      titles = {
        "/": "Dịch vụ bảo vệ chuyên nghiệp",
        "/gioi-thieu": "Giới thiệu & năng lực",
        "/dich-vu": "Dịch vụ bảo vệ",
        "/tin-tuc": "Tin tức & hoạt động",
        "/tuyen-dung": "Tuyển dụng",
        "/lien-he": "Liên hệ tư vấn",
        "/bao-mat": "Chính sách bảo mật",
      },
      title = titles[req.path] || "An Ninh",
      desc = s.about.slice(0, 160),
      image = s.hero;
    let segment = req.path.split("/")[2];
    if (req.path.startsWith("/tin-tuc/") && segment) {
      let p = one(
        "SELECT * FROM posts WHERE slug=? AND status='published'",
        segment,
      );
      if (p) {
        title = p.title;
        desc = p.content.slice(0, 160);
        image = p.image;
      }
    }
    if (req.path.startsWith("/tuyen-dung/") && segment) {
      let j = one("SELECT * FROM jobs WHERE slug=?", segment);
      if (j) {
        title = j.title + " — Tuyển dụng";
        desc = j.description.slice(0, 160);
      }
    }
    const st = {
      "toa-nha-van-phong": "Bảo vệ tòa nhà & văn phòng",
      "nha-may-kho-hang": "Bảo vệ nhà máy & kho hàng",
      "ngan-hang": "Bảo vệ ngân hàng",
      "benh-vien": "Bảo vệ bệnh viện & cơ sở y tế",
    };
    if (req.path.startsWith("/dich-vu/") && st[segment]) {
      title = st[segment];
      desc =
        title +
        " — Tìm hiểu phạm vi công việc, quy trình phối hợp và gửi yêu cầu khảo sát mục tiêu.";
    }
    const origin =
      process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
    let html = readFileSync(resolve(dist, "index.html"), "utf8")
      .replace(
        /<title>.*?<\/title>/,
        `<title>${esc(title + " | An Ninh")}</title>`,
      )
      .replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${esc(desc)}">`,
      )
      .replace(
        /<meta property="og:title" content="[^"]*">/,
        `<meta property="og:title" content="${esc(title + " | An Ninh")}">`,
      )
      .replace(
        /<meta property="og:description" content="[^"]*">/,
        `<meta property="og:description" content="${esc(desc)}">`,
      )
      .replace(
        "</head>",
        `<link rel="canonical" href="${esc(origin + req.path)}"><meta property="og:url" content="${esc(origin + req.path)}">${image ? `<meta property="og:image" content="${esc(origin + image)}">` : ""}${req.path.startsWith("/admin") ? '<meta name="robots" content="noindex,nofollow">' : ""}</head>`,
      );
    res.type("html").send(html);
  },
);
app.use(express.static(dist));
app.get("/robots.txt", (req, res) =>
  res.type("text").send("User-agent: *\nDisallow: /admin\nDisallow: /api/\n"),
);
app.get("/sitemap.xml", (req, res) => {
  let origin = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
  let paths = [
    "/",
    "/gioi-thieu",
    "/dich-vu",
    "/dich-vu/toa-nha-van-phong",
    "/dich-vu/nha-may-kho-hang",
    "/dich-vu/ngan-hang",
    "/dich-vu/benh-vien",
    "/tin-tuc",
    "/tuyen-dung",
    "/lien-he",
    "/bao-mat",
  ];
  for (let r of all("SELECT slug FROM posts WHERE status='published'"))
    paths.push("/tin-tuc/" + r.slug);
  for (let r of all("SELECT slug FROM jobs"))
    paths.push("/tuyen-dung/" + r.slug);
  res
    .type("application/xml")
    .send(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        paths
          .map(
            (p) =>
              `<url><loc>${origin.replace(/&/g, "&amp;").replace(/</g, "&lt;")}${p}</loc></url>`,
          )
          .join("") +
        "</urlset>",
    );
});
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (/^\/(?:assets|company-images|fonts)(?:\/|$)/.test(req.path))
    return res.status(404).send("Không tìm thấy tệp.");
  if (!existsSync(resolve(dist, "index.html")))
    return res.status(503).send("Chạy npm run build trước khi khởi động.");
  res.sendFile(resolve(dist, "index.html"));
});
app.use((err, req, res, next) => {
  let status = err.status || 400,
    msg = err.message;
  if (err.code === "LIMIT_FILE_SIZE") msg = "Tệp vượt quá giới hạn 5 MB.";
  if (err.code?.startsWith("SQLITE")) {
    status = 409;
    msg = err.message.includes("UNIQUE")
      ? "Đường dẫn đã được sử dụng. Vui lòng đổi đường dẫn."
      : "Không thể cập nhật dữ liệu liên quan.";
  }
  if (!err.status && !err.code) {
    status = 500;
    msg = "Có lỗi xử lý. Vui lòng thử lại.";
    console.error(err);
  }
  res.status(status).json({ error: msg });
});
if (process.env.NO_LISTEN !== "1")
  app.listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log(`An Ninh: http://127.0.0.1:${port}`),
  );
export { app, db };
