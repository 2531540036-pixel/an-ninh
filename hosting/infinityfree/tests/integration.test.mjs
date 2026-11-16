import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const origin = process.env.INFINITYFREE_TEST_URL || 'http://127.0.0.1:8091';
const password = randomBytes(60).toString('base64url') + ' — Mật khẩu thử nghiệm';
const newPassword = randomBytes(18).toString('base64url');
await test('00. Trình cài đặt: sai mã bị chặn, đúng mã tạo Admin', async () => {
  const data = {key:'local-test-setup-key-only-32-characters', username:'demo-admin',password,confirm:password};
  const install = b => fetch(origin+'/cai-dat.php',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(b)});
  assert.equal((await install({...data,key:'wrong'})).status,403);
  const r = await install(data);
  assert.equal(r.status,200);
  assert.match(await r.text(),/Website đã sẵn sàng/);
  assert.match(await (await install(data)).text(),/được khóa/);
});
let cookie = "";
async function req(path, method = "GET", body, auth = true, headers = {}) {
  let form = body instanceof FormData;
  let r = await fetch(origin + "/api" + path, {
    method,
    headers: {
      ...(form ? {} : { "Content-Type": "application/json" }),
      Origin: origin,
      ...(auth && cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
  });
  let type = r.headers.get("content-type") || "";
  let data = type.includes("application/json")
    ? await r.json()
    : await r.arrayBuffer();
  return { status: r.status, data, headers: r.headers };
}
let job, post, application, contact, file;
const demo = {
  name: "DEMO — Kiểm thử hệ thống",
  phone: "0901234567",
  email: "demo@example.test",
};
await test("01. Chặn quản trị và tải file khi chưa đăng nhập", async () => {
  assert.equal((await req("/admin/dashboard", "GET", null, false)).status, 401);
  assert.equal(
    (await req("/admin/files/missing", "GET", null, false)).status,
    401,
  );
  assert.equal(
    (
      await req(
        "/admin/login",
        "POST",
        { username: "' OR 1=1 --", password: "bad" },
        false,
      )
    ).status,
    401,
  );
});
await test("02. Đăng nhập, bắt buộc đổi mật khẩu và kết thúc phiên cũ", async () => {
  assert.equal((await req('/admin/login','POST',{username:'demo-admin', password:password.slice(0,72)+'different-tail'},false)).status,401);
  let r = await req(
    "/admin/login",
    "POST",
    { username: "demo-admin", password },
    false,
  );
  assert.equal(r.status, 200);
  cookie = r.headers.get("set-cookie").split(";")[0];
  assert.match(r.headers.get("set-cookie"), /HttpOnly/);
  assert.equal((await req("/admin/me")).data.must_change, false);
  assert.equal((await req("/admin/dashboard")).status, 200);
  assert.equal(
    (
      await req("/admin/password", "POST", {
        current: password,
        password: "short",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await req("/admin/password", "POST", {
        current: password,
        password: newPassword,
      })
    ).status,
    200,
  );
  assert.equal((await req("/admin/dashboard")).status, 401);
  r = await req(
    "/admin/login",
    "POST",
    { username: "demo-admin", password: newPassword },
    false,
  );
  cookie = r.headers.get("set-cookie").split(";")[0];
  assert.equal((await req("/admin/dashboard")).status, 200);
});
await test("03. Bài viết: nháp, xuất bản, tìm kiếm, sửa, ẩn", async () => {
  let p = {
    title: "DEMO — Hoạt động kiểm thử",
    slug: "demo-kiem-thu",
    category: "Tin tức công ty",
    content: "DEMO\n## Tiêu đề phụ\n<script>alert(1)</script>",
    image: "",
    status: "draft",
  };
  let r = await req("/admin/posts", "POST", p);
  assert.equal(r.status, 201);
  post = r.data.id;
  assert.equal((await req("/posts/demo-kiem-thu")).status, 404);
  assert.equal((await req("/posts")).data.total, 0);
  p.status = "published";
  assert.equal((await req("/admin/posts/" + post, "PUT", p)).status, 200);
  assert.equal(
    (
      await req(
        "/posts?q=Hoạt&category=" + encodeURIComponent("Tin tức công ty"),
      )
    ).data.total,
    1,
  );
  assert.equal((await req("/posts/demo-kiem-thu")).data.content, p.content);
  p.title = "DEMO — Đã sửa";
  await req("/admin/posts/" + post, "PUT", p);
  assert.equal((await req("/posts/demo-kiem-thu")).data.title, p.title);
  p.status = "hidden";
  await req("/admin/posts/" + post, "PUT", p);
  assert.equal((await req("/posts/demo-kiem-thu")).status, 404);
  p.status = "published";
  await req("/admin/posts/" + post, "PUT", p);
});
await test("04. Liên hệ: kiểm tra dữ liệu và Admin nhận được thông tin", async () => {
  assert.equal((await req("/contacts", "POST", {})).status, 400);
  let d = {
    ...demo,
    service: "Tòa nhà & văn phòng",
    location: "DEMO — Địa điểm thử",
    quantity: "2",
    message: "DEMO — Yêu cầu kiểm thử, không phải khách hàng thật.",
    consent: true,
  };
  assert.equal(
    (await req("/contacts", "POST", { ...d, email: "bad" })).status,
    400,
  );
  assert.equal(
    (await req("/contacts", "POST", { ...d, phone: "123" })).status,
    400,
  );
  assert.equal(
    (await req("/contacts", "POST", { ...d, consent: false })).status,
    400,
  );
  let r = await req("/contacts", "POST", d);
  assert.equal(r.status, 201);
  contact = r.data.id;
  let rows = (await req("/admin/contacts")).data;
  assert.equal(rows[0].data.message, d.message);
  await req("/admin/contacts/" + contact, "PUT", {
    status: "Đã liên hệ",
    notes: "DEMO — đã kiểm tra",
  });
  assert.equal((await req("/admin/contacts")).data[0].status, "Đã liên hệ");
});
await test("05. Tuyển dụng: tạo vị trí và công khai đầy đủ thông tin", async () => {
  let j = {
    title: "DEMO — Nhân viên bảo vệ",
    slug: "demo-nhan-vien",
    location: "DEMO — Mục tiêu thử",
    salary: "DEMO — Không phải mức lương thật",
    schedule: "DEMO — Ca thử",
    quantity: 2,
    description: "DEMO — Mô tả",
    requirements: "DEMO — Yêu cầu",
    benefits: "DEMO — Quyền lợi",
    status: "open",
  };
  let r = await req("/admin/jobs", "POST", j);
  assert.equal(r.status, 201);
  job = { ...j, id: r.data.id };
  let pub = await req("/jobs/demo-nhan-vien");
  assert.equal(pub.data.title, j.title);
  assert.equal((await req("/jobs?q=DEMO")).data.total, 1);
});
function apply({
  name = "cv.pdf",
  bytes = "%PDF-1.7\nDEMO\n%%EOF",
  birth = "1990-01-01",
  jobId = job.id,
} = {}) {
  let f = new FormData();
  for (let [k, v] of Object.entries({
    ...demo,
    job_id: jobId,
    birth,
    address: "DEMO — Địa chỉ",
    experience: "DEMO — Kinh nghiệm",
    intro: "DEMO — Hồ sơ kiểm thử",
    consent: "true",
  }))
    f.set(k, v);
  f.set("file", new Blob([bytes]), name);
  return f;
}
await test("06. Hồ sơ: upload, lưu database, tải riêng tư và cập nhật trạng thái", async () => {
  let r = await req("/applications", "POST", apply());
  assert.equal(r.status, 201);
  application = r.data.id;
  let rows = (await req("/admin/applications")).data;
  assert.equal(rows[0].data.name, demo.name);
  file = rows[0].file_id;
  assert.equal(
    (await req("/admin/files/" + file, "GET", null, false)).status,
    401,
  );
  let pub = await fetch(origin + "/media/" + file);
  assert.equal(pub.status, 404);
  let cv = await req("/admin/files/" + file);
  assert.equal(cv.status, 200);
  assert.match(cv.headers.get("content-disposition"), /attachment/);
  assert.match(Buffer.from(cv.data).toString(), /DEMO/);
  await req("/admin/applications/" + application, "PUT", {
    status: "Mời phỏng vấn",
    notes: "DEMO — ghi chú",
  });
  assert.equal(
    (await req("/admin/applications")).data[0].notes,
    "DEMO — ghi chú",
  );
});
await test("07. Từ chối giả mạo file, quá dung lượng, ngày sai và vị trí đã đóng", async () => {
  assert.equal(
    (
      await req(
        "/applications",
        "POST",
        apply({ name: "cv.pdf", bytes: "<script>bad</script>" }),
      )
    ).status,
    400,
  );
  assert.equal(
    (await req("/applications", "POST", apply({ birth: "invalid" }))).status,
    400,
  );
  assert.equal(
    (
      await req(
        "/applications",
        "POST",
        apply({ bytes: "%PDF-" + ".".repeat(5 * 1024 * 1024) }),
      )
    ).status,
    413,
  );
  assert.equal(
    (await req("/admin/jobs/" + job.id, "PUT", { ...job, status: "closed" }))
      .status,
    200,
  );
  assert.equal((await req("/jobs/demo-nhan-vien")).data.status, "closed");
  assert.equal((await req("/applications", "POST", apply())).status, 400);
  assert.equal((await req("/admin/jobs/" + job.id, "DELETE")).status, 400);
});
await test("08. Ảnh công khai hợp lệ, chặn SVG và sửa cấu hình công ty", async () => {
  let bad = new FormData();
  bad.set("file", new Blob(['<svg onload="alert(1)"/>']), "logo.svg");
  assert.equal((await req("/admin/images", "POST", bad)).status, 400);
  let f = new FormData();
  f.set(
    "file",
    new Blob([
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
        "base64",
      ),
    ]),
    "demo.png",
  );
  let r = await req("/admin/images", "POST", f);
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal((await fetch(origin + r.data.url)).status, 200);
  assert.equal(
    (await req("/admin/settings", "PUT", { logo: "javascript:alert(1)" }))
      .status,
    400,
  );
  assert.equal(
    (
      await req("/admin/settings", "PUT", {
        tagline: "DEMO — Kiểm thử",
        logo: r.data.url,
      })
    ).status,
    200,
  );
  assert.equal((await req("/site")).data.tagline, "DEMO — Kiểm thử");
  assert.equal(
    (await req("/admin/settings", "PUT", { map: "https://evil.example" }))
      .status,
    400,
  );
});
await test("08b. Đăng ký chung khi không có vị trí: CV/email tùy chọn, dữ liệu riêng tư và xác thực", async () => {
  assert.equal((await req("/jobs?status=open")).data.total, 0);
  assert.equal((await req("/jobs?status=closed")).data.total, 1);
  const make = (overrides = {}, withFile = false) => {
    const f = new FormData();
    for (const [k, v] of Object.entries({
      name: demo.name,
      phone: demo.phone,
      location: "DEMO — Đà Nẵng",
      intro: "DEMO — Chưa có kinh nghiệm",
      availability: "DEMO — Ca ngày",
      consent: "true",
      ...overrides,
    }))
      f.set(k, v);
    if (withFile) f.set("file", new Blob(["%PDF-1.7\nDEMO\n%%EOF"]), "cv.pdf");
    return f;
  };
  const first = await req("/applications", "POST", make());
  assert.equal(first.status, 201);
  const row = (await req("/admin/applications")).data.find(
    (r) => r.id === first.data.id,
  );
  assert.equal(row.job_id, null);
  assert.equal(row.file_id, null);
  assert.equal(row.data.email, "");
  assert.equal(row.data.availability, "DEMO — Ca ngày");
  assert.equal(row.job_title, "Đăng ký ứng tuyển chung");
  assert.equal(
    (await req("/admin/applications", "GET", null, false)).status,
    401,
  );
  const second = await req(
    "/applications",
    "POST",
    make({ email: demo.email }, true),
  );
  assert.equal(second.status, 201);
  const withFile = (await req("/admin/applications")).data.find(
    (r) => r.id === second.data.id,
  );
  assert.equal(
    (await fetch(origin + "/media/" + withFile.file_id)).status,
    404,
  );
  assert.equal(
    (await req("/applications", "POST", make({ location: "" }))).status,
    400,
  );
  assert.equal(
    (await req("/applications", "POST", make({ consent: "false" }))).status,
    400,
  );
  assert.equal(
    (await req("/applications", "POST", make({ email: "bad" }))).status,
    400,
  );
  await req("/admin/applications/" + first.data.id, "DELETE");
  await req("/admin/applications/" + second.data.id, "DELETE");
  assert.equal((await req("/admin/files/" + withFile.file_id)).status, 404);
});
await test("09. Chống yêu cầu khác nguồn, dữ liệu tồn tại khi mở lại database, thống kê đúng", async () => {
  assert.equal(
    (
      await req("/admin/settings", "PUT", { tagline: "bad" }, true, {
        Origin: "https://evil.example",
      })
    ).status,
    403,
  );
  assert.equal((await req('/admin/contacts')).data.length,1);
  assert.equal((await req('/admin/applications')).data[0].notes,'DEMO — ghi chú');
  let d = (await req("/admin/dashboard")).data;
  assert.equal(d.contacts, 1);
  assert.equal(d.applications, 1);
  assert.equal(d.published, 1);
  assert.equal(d.openJobs, 0);
});
await test("10. Xóa bài, liên hệ, hồ sơ, tệp và vị trí; đăng xuất", async () => {
  assert.equal((await req("/admin/posts/" + post, "DELETE")).status, 200);
  assert.equal((await req("/posts")).data.total, 0);
  await req("/admin/contacts/" + contact, "DELETE");
  await req("/admin/applications/" + application, "DELETE");
  assert.equal((await req("/admin/files/" + file)).status, 404);
  assert.equal((await req("/admin/jobs/" + job.id, "DELETE")).status, 200);
  assert.equal((await req("/jobs")).data.total, 0);
  await req("/admin/logout", "POST");
  assert.equal((await req("/admin/me")).status, 401);
});

await test("11. HTML, SEO từng trang, sitemap và các tệp giao diện build", async () => {
  let r = await fetch(origin + "/gioi-thieu");
  let html = await r.text();
  assert.equal(r.status, 200);
  assert.match(html, /<title>Giới thiệu &amp; năng lực \| An Ninh<\/title>/);
  assert.match(html, /rel="canonical"/);
  assert.match(r.headers.get("content-security-policy"), /script-src 'self'/);
  let script = html.match(/src="(\/assets\/[^\"]+\.js)"/);
  assert.ok(script);
  assert.equal((await fetch(origin + script[1])).status, 200);
  let admin = await (await fetch(origin + "/admin")).text();
  assert.match(admin, /noindex,nofollow/);
  let sitemap = await (await fetch(origin + "/sitemap.xml")).text();
  assert.match(sitemap, /dich-vu\/benh-vien/);
  let svc = await (await fetch(origin + "/dich-vu/ngan-hang")).text();
  assert.match(svc, /<title>Bảo vệ ngân hàng/);
  const image = await fetch(origin + "/company-images/doi-ngu-an-ninh.jpg");
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type"), /image\/jpeg/);
  assert.equal(
    (await fetch(origin + "/company-images/missing.jpg")).status,
    404,
  );
  const font = await fetch(origin + "/fonts/Manrope-Variable.ttf");
  assert.equal(font.status, 200);
});

await test('12. Apache chặn cấu hình, SQL, CV trực tiếp và dotfile',async()=>{
  for(const path of ['/_private/config.php','/_private/uploads/test.bin','/_app/schema.sql','/_app/defaults.json','/.htaccess','/_app/../_private/config.php']) {
    const r = await fetch(origin+path);
    assert.equal(r.status,403,path);
    assert.doesNotMatch(await r.text(),/local-test-only|setup-key-only/);
  }
});
await test('13. Giới hạn đăng nhập, thiếu Origin và nguồn giả mạo',async()=>{
  const r = await fetch(origin+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'demo-admin',password:newPassword})});
  assert.equal(r.status,403);
  for(let i=0;i<8;i++) await req('/admin/login','POST',{username:'absent',password:'invalid'},false);
  const blocked = await req('/admin/login','POST',{username:'demo-admin',password:newPassword},false);
  assert.equal(blocked.status,429);
  assert.ok(Number(blocked.headers.get('retry-after'))>0);
});
