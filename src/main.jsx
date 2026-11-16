import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Building2,
  Factory,
  Landmark,
  Hospital,
  Check,
  Menu,
  X,
  ChevronRight,
  Search,
  Plus,
  LogOut,
  Upload,
  Eye,
  EyeOff,
  LockKeyhole,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Download,
  Briefcase,
  Clock,
  Shield,
  GraduationCap,
  Flame,
  ClipboardCheck,
} from "lucide-react";
import "./style.css";
const h = React.createElement;
const services = [
  {
    slug: "toa-nha-van-phong",
    title: "Tòa nhà & văn phòng",
    icon: Building2,
    desc: "Kiểm soát ra vào, tuần tra và giữ gìn an ninh trong khu vực làm việc.",
    tasks: [
      "Kiểm soát người và phương tiện ra vào theo quy định của đơn vị.",
      "Tuần tra khu vực được phân công, ghi nhận các dấu hiệu bất thường.",
      "Hướng dẫn khách và phối hợp với ban quản lý khi có sự cố.",
    ],
  },
  {
    slug: "nha-may-kho-hang",
    title: "Nhà máy & kho hàng",
    icon: Factory,
    desc: "Phương án bảo vệ gắn với luồng người, hàng hóa và hoạt động sản xuất.",
    tasks: [
      "Kiểm soát người, phương tiện và hàng hóa theo chứng từ được duyệt.",
      "Tuần tra các khu vực sản xuất, kho và vành đai mục tiêu.",
      "Ghi nhận ca trực, bàn giao và báo cáo tình huống phát sinh.",
    ],
  },
  {
    slug: "ngan-hang",
    title: "Ngân hàng",
    icon: Landmark,
    desc: "Giữ gìn trật tự khu vực giao dịch, phối hợp bảo vệ người và tài sản.",
    tasks: [
      "Hướng dẫn khách, giữ gìn trật tự khu vực được giao.",
      "Quan sát, phát hiện dấu hiệu bất thường và báo cáo đúng quy trình.",
      "Phối hợp với cán bộ phụ trách theo phương án của từng điểm giao dịch.",
    ],
  },
  {
    slug: "benh-vien",
    title: "Bệnh viện & cơ sở y tế",
    icon: Hospital,
    desc: "Bảo đảm trật tự với tác phong phù hợp môi trường chăm sóc sức khỏe.",
    tasks: [
      "Hướng dẫn người bệnh và thân nhân tại các khu vực được phân công.",
      "Kiểm soát ra vào, tuần tra và hỗ trợ giữ gìn trật tự.",
      "Phối hợp với nhân viên y tế xử lý tình huống theo quy định cơ sở.",
    ],
  },
];
const serviceImageKeys = [
  "serviceBuilding",
  "serviceFactory",
  "serviceBank",
  "serviceHospital",
];
const categories = [
  "Tin tức công ty",
  "Hoạt động nhân viên",
  "Đào tạo nghiệp vụ",
  "Kiến thức an ninh",
  "Thông tin tuyển dụng",
  "Tin tức ngành bảo vệ",
];
const statusOptions = {
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
async function api(path, options = {}) {
  let form = options.body instanceof FormData;
  let r = await fetch("/api" + path, {
    ...options,
    headers: form ? {} : { "Content-Type": "application/json" },
    body: options.body
      ? form
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });
  let d = await r.json();
  if (!r.ok)
    throw Object.assign(new Error(d.error || "Không thể kết nối hệ thống."), {
      status: r.status,
    });
  return d;
}
function App() {
  let [path, setPath] = useState(location.pathname),
    [site, setSite] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    const pop = () => setPath(location.pathname);
    window.addEventListener("popstate", pop);
    const click = (e) => {
      const a = e.target.closest("a");
      if (
        a &&
        a.origin === location.origin &&
        !a.target &&
        !a.hasAttribute("download") &&
        !a.pathname.startsWith("/api/") &&
        !a.pathname.startsWith("/media/") &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        history.pushState({}, "", a.pathname + a.search + a.hash);
        setPath(a.pathname);
        if (a.hash)
          setTimeout(
            () =>
              document
                .getElementById(decodeURIComponent(a.hash.slice(1)))
                ?.scrollIntoView(),
            100,
          );
        else window.scrollTo(0, 0);
      }
    };
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("popstate", pop);
      document.removeEventListener("click", click);
    };
  }, []);
  useEffect(() => {
    api("/site")
      .then(setSite)
      .catch((e) => setError(e.message));
  }, [path]);
  useEffect(() => {
    let titles = {
      "/": "Dịch vụ bảo vệ chuyên nghiệp",
      "/gioi-thieu": "Giới thiệu & năng lực",
      "/dich-vu": "Dịch vụ bảo vệ",
      "/tin-tuc": "Tin tức & hoạt động",
      "/tuyen-dung": "Cơ hội nghề nghiệp",
      "/lien-he": "Liên hệ tư vấn",
      "/bao-mat": "Chính sách bảo mật",
    };
    document.title = (titles[path] || "An Ninh") + " | Bảo vệ An Ninh";
    document.querySelector('meta[name="description"]').content =
      site?.about?.slice(0, 160) || "Dịch vụ bảo vệ An Ninh";
  }, [path, site]);
  if (error)
    return (
      <div className="fatal">
        <h1>Chưa thể tải website</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>Thử lại</button>
      </div>
    );
  if (!site) return <div className="loading">Đang tải An Ninh…</div>;
  if (path.startsWith("/admin"))
    return <Admin site={site} updateSite={setSite} />;
  let page =
    path === "/" ? (
      <Home site={site} />
    ) : path === "/gioi-thieu" ? (
      <About site={site} />
    ) : path === "/dich-vu" ? (
      <Services site={site} />
    ) : path.startsWith("/dich-vu/") ? (
      <ServiceDetail site={site} slug={path.split("/")[2]} />
    ) : path === "/tin-tuc" ? (
      <News />
    ) : path.startsWith("/tin-tuc/") ? (
      <Post slug={path.split("/")[2]} />
    ) : path === "/tuyen-dung" ? (
      <Careers />
    ) : path.startsWith("/tuyen-dung/") ? (
      <Job slug={path.split("/")[2]} />
    ) : path === "/lien-he" ? (
      <Contact site={site} />
    ) : path === "/bao-mat" ? (
      <Privacy />
    ) : (
      <NotFound />
    );
  return (
    <>
      <Header site={site} path={path} />
      <main key={path}>{page}</main>
      <Footer site={site} />
      {site.hotline && (
        <a className="quick-call" href={"tel:" + site.hotline}>
          <Phone size={18} />
          <span>Gọi tư vấn</span>
        </a>
      )}
      {site.zalo && (
        <a
          className="quick-zalo"
          href={site.zalo}
          target="_blank"
          rel="noreferrer"
        >
          Zalo
        </a>
      )}
    </>
  );
}
function Header({ site, path }) {
  let [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>CÔNG TY CỔ PHẦN DỊCH VỤ BẢO VỆ AN NINH</span>
          <span>
            Thành lập ngày {site.founded} <i />{" "}
            {site.hotline ? (
              <a href={"tel:" + site.hotline}>{site.hotline}</a>
            ) : (
              "Nơi gửi trọn niềm tin"
            )}
          </span>
        </div>
      </div>
      <header>
        <div className="container header-inner">
          <a className="brand" href="/">
            {site.logo ? (
              <img src={site.logo} alt="Logo An Ninh" />
            ) : (
              <ShieldCheck size={40} strokeWidth={1.4} />
            )}
            <span>
              <strong>{site.shortName}</strong>
              <small>SECURITY SERVICE</small>
            </span>
          </a>
          <button
            className="menu-toggle"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? "open" : ""}>
            {[
              ["/", "Trang chủ"],
              ["/gioi-thieu", "Giới thiệu"],
              ["/dich-vu", "Dịch vụ"],
              ["/tin-tuc", "Tin tức"],
              ["/tuyen-dung", "Tuyển dụng"],
              ["/lien-he", "Liên hệ"],
            ].map(([url, t]) => (
              <a
                className={
                  path === url || (url !== "/" && path.startsWith(url + "/"))
                    ? "active"
                    : ""
                }
                href={url}
                key={url}
              >
                {t}
              </a>
            ))}
          </nav>
          <a href="/lien-he" className="button header-cta">
            Yêu cầu tư vấn <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
    </>
  );
}
function Button({ href, children, light = false }) {
  return (
    <a href={href} className={"button " + (light ? "outline" : "")}>
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}
function Photo({ src, type = "team", className = "", caption = true }) {
  return src ? (
    <figure className={"photo " + className}>
      <img
        src={src}
        alt={
          type === "training"
            ? "Hoạt động huấn luyện của công ty"
            : "Hình ảnh thực tế của công ty An Ninh"
        }
      />
    </figure>
  ) : (
    <figure className={"photo placeholder " + className}>
      <div className="architecture">
        <div className="building b1" />
        <div className="building b2" />
        <div className="building b3" />
        <div className="ground" />
        <Shield size={90} strokeWidth={0.7} />
      </div>
      {caption && (
        <figcaption>
          {type === "training"
            ? "Ảnh huấn luyện nghiệp vụ"
            : "Ảnh đội ngũ An Ninh"}{" "}
          · chờ bổ sung bản gốc
        </figcaption>
      )}
    </figure>
  );
}
function Label({ children }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
function SectionTitle({ label, title, children, link }) {
  return (
    <div className="section-heading">
      <div>
        <Label>{label}</Label>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {link && (
        <a className="text-link" href={link.href}>
          {link.text}
          <ArrowRight size={18} />
        </a>
      )}
    </div>
  );
}
function Home({ site }) {
  let [posts, setPosts] = useState([]),
    [jobs, setJobs] = useState([]);
  useEffect(() => {
    api("/posts")
      .then((d) => setPosts(d.items.slice(0, 3)))
      .catch(() => {});
    api("/jobs")
      .then((d) =>
        setJobs(d.items.filter((x) => x.status === "open").slice(0, 2)),
      )
      .catch(() => {});
  }, []);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <Label>AN NINH · SECURITY SERVICE</Label>
          <h1>
            Vững nghiệp vụ.
            <br />
            Trọn <em>niềm tin.</em>
          </h1>
          <p>
            Dịch vụ bảo vệ dành cho doanh nghiệp, đơn vị và cá nhân. Phương án
            cụ thể cho từng mục tiêu, bắt đầu từ việc hiểu đúng nhu cầu của bạn.
          </p>
          <div className="actions">
            <Button href="/lien-he">Liên hệ tư vấn</Button>
            <a className="hero-secondary" href="/dich-vu">
              Khám phá dịch vụ <ArrowRight size={20} />
            </a>
          </div>
          <div className="hero-foot">
            <ShieldCheck size={24} />
            <span>
              Bảo vệ con người. Gìn giữ tài sản.
              <br />
              <strong>Đồng hành cùng sự an toàn của đơn vị.</strong>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <Photo src={site.hero} />
          <div className="hero-date">
            <span>TỪ NGÀY</span>
            <strong>
              25.06<span>2006</span>
            </strong>
            <small>Dấu mốc thành lập An Ninh</small>
          </div>
          <div className="visual-label">
            AN NINH SECURITY <span>01 / GIỚI THIỆU</span>
          </div>
        </div>
      </section>
      <div className="service-strip container">
        <span>LĨNH VỰC BẢO VỆ</span>
        {services.map((s) => (
          <a key={s.slug} href={"/dich-vu/" + s.slug}>
            <s.icon size={23} />
            {s.title}
            <ArrowUpRight size={15} />
          </a>
        ))}
      </div>
      <section className="section container about-home">
        <div className="about-image">
          <Photo src={site.team} />
          <div className="image-note">
            <span>AN NINH</span>Tác phong từ nền tảng nghiệp vụ
          </div>
        </div>
        <div>
          <Label>VỀ CHÚNG TÔI</Label>
          <h2>
            An toàn của bạn.
            <br />
            Trách nhiệm của chúng tôi.
          </h2>
          <p>{site.about}</p>
          <div className="founder">
            <span>NGƯỜI SÁNG LẬP</span>
            <strong>Ông {site.founder}</strong>
            <p>Từng là sĩ quan nghiệp vụ trong lực lượng Công an nhân dân.</p>
          </div>
          <a href="/gioi-thieu" className="text-link">
            Tìm hiểu về An Ninh <ArrowRight size={18} />
          </a>
        </div>
      </section>
      <section className="section cream">
        <div className="container">
          <SectionTitle
            label="DỊCH VỤ BẢO VỆ"
            title={
              <>
                Mỗi mục tiêu.
                <br />
                Một phương án phù hợp.
              </>
            }
            link={{ href: "/dich-vu", text: "Tất cả dịch vụ" }}
          >
            Khảo sát đặc điểm hoạt động để xác định phạm vi công việc, ca trực
            và trách nhiệm phối hợp.
          </SectionTitle>
          <div className="service-grid">
            {services.map((s, i) => (
              <a
                className="service-card"
                href={"/dich-vu/" + s.slug}
                key={s.slug}
              >
                {site[serviceImageKeys[i]] && (
                  <img
                    className="service-thumb"
                    src={site[serviceImageKeys[i]]}
                    alt={s.title}
                  />
                )}
                <div className="service-top">
                  <s.icon size={42} strokeWidth={1} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="text-link">
                  Xem chi tiết <ArrowUpRight size={18} />
                </span>
              </a>
            ))}
          </div>
          <div className="service-note">
            Bạn có yêu cầu bảo vệ khác?{" "}
            <a href="/lien-he">
              Trao đổi với chúng tôi <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
      <section className="section container training">
        <div>
          <Label>NỀN TẢNG NGHIỆP VỤ</Label>
          <h2>
            Sẵn sàng từ
            <br />
            những buổi huấn luyện.
          </h2>
          <p>
            Hồ sơ doanh nghiệp ghi nhận hoạt động đào tạo nghiệp vụ bảo vệ, rèn
            luyện võ thuật, phòng cháy chữa cháy và tập huấn ứng xử tại cơ sở y
            tế.
          </p>
          <div className="training-list">
            {[
              [
                GraduationCap,
                "Nghiệp vụ bảo vệ",
                "Rèn tác phong, kỹ năng quan sát và xử lý tình huống.",
              ],
              [
                Flame,
                "Phòng cháy & chữa cháy",
                "Thực hành sử dụng phương tiện và phối hợp khi có sự cố.",
              ],
              [
                ClipboardCheck,
                "Quy trình & ứng xử",
                "Chú trọng bàn giao, báo cáo và giao tiếp tại mục tiêu.",
              ],
            ].map(([Icon, t, d]) => (
              <div key={t}>
                <Icon size={24} />
                <span>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </span>
              </div>
            ))}
          </div>
          <a className="text-link" href="/gioi-thieu#nang-luc">
            Xem năng lực doanh nghiệp <ArrowRight size={18} />
          </a>
        </div>
        <Photo src={site.training} type="training" />
      </section>
      <section className="process section">
        <div className="container">
          <SectionTitle
            label="QUY TRÌNH PHỐI HỢP"
            title="Rõ việc, rõ trách nhiệm."
          />
          <div className="steps">
            {[
              "Tiếp nhận yêu cầu",
              "Khảo sát mục tiêu",
              "Đề xuất phương án",
              "Thống nhất hợp đồng",
              "Triển khai nhân sự",
              "Kiểm tra & giám sát",
            ].map((t, i) => (
              <div key={t}>
                <span>0{i + 1}</span>
                <h3>{t}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionTitle
          label="TIN TỨC & HOẠT ĐỘNG"
          title="Góc nhìn từ An Ninh."
          link={{ href: "/tin-tuc", text: "Xem tất cả" }}
        />
        {posts.length ? (
          <div className="news-grid">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <Empty
            title="Tin tức đang được cập nhật"
            text="Các hoạt động và thông tin mới sẽ được đăng tải tại đây."
          />
        )}
      </section>
      <section className="recruit-banner container">
        <div>
          <Label>CƠ HỘI NGHỀ NGHIỆP</Label>
          <h2>
            Cùng An Ninh
            <br />
            gìn giữ sự bình yên.
          </h2>
          <p>
            {jobs.length
              ? "Tìm hiểu các vị trí đang tuyển và gửi hồ sơ trực tiếp đến bộ phận phụ trách."
              : "Theo dõi thông báo tuyển dụng chính thức từ công ty."}
          </p>
        </div>
        <div>
          {jobs.map((j) => (
            <a className="job-mini" href={"/tuyen-dung/" + j.slug} key={j.id}>
              <span>
                <strong>{j.title}</strong>
                <small>{j.location}</small>
              </span>
              <ArrowUpRight />
            </a>
          ))}
          <Button href="/tuyen-dung">Khám phá cơ hội việc làm</Button>
        </div>
      </section>
      <ConsultCTA />
    </>
  );
}
function PageHead({ label, title, text }) {
  return (
    <section className="page-head">
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a>
          <ChevronRight size={14} />
          {label}
        </div>
        <Label>{label}</Label>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}
function About({ site }) {
  return (
    <>
      <PageHead
        label="GIỚI THIỆU"
        title="Nơi gửi trọn niềm tin."
        text="Tìm hiểu nền tảng, con người và định hướng của Công ty An Ninh."
      />
      <section className="section container about-home">
        <Photo src={site.team} />
        <div>
          <Label>CÂU CHUYỆN AN NINH</Label>
          <h2>
            Từ nền tảng nghiệp vụ
            <br />
            đến trách nhiệm bảo vệ.
          </h2>
          <p>{site.about}</p>
          <div className="founder">
            <span>DẤU MỐC THÀNH LẬP</span>
            <strong>{site.founded}</strong>
            <p>{site.historyNote}</p>
          </div>
          <h3>Người sáng lập — Ông {site.founder}</h3>
          <p>
            Từng là sĩ quan nghiệp vụ trong lực lượng Công an nhân dân. Tiểu sử
            chi tiết sẽ được cập nhật khi có tài liệu bổ sung.
          </p>
        </div>
      </section>
      <section className="section cream">
        <div className="container">
          <SectionTitle
            label="ĐỊNH HƯỚNG"
            title="Gìn giữ an toàn bằng trách nhiệm."
          />
          <div className="values">
            {[
              [
                "Sứ mệnh",
                "Bảo vệ tính mạng, tài sản của đơn vị, doanh nghiệp và cá nhân; góp phần giữ gìn trật tự, an toàn xã hội.",
              ],
              [
                "Định hướng",
                "Đồng hành với nhu cầu bảo đảm an ninh của khách hàng trong quá trình phát triển kinh tế.",
              ],
              [
                "Giá trị cốt lõi",
                "Trách nhiệm trong công việc. Kỷ luật trong tác phong. Rõ ràng trong phối hợp.",
              ],
            ].map(([t, d]) => (
              <article key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="nang-luc" className="section container training">
        <div>
          <Label>HỒ SƠ NĂNG LỰC</Label>
          <h2>
            Con người &<br />
            hoạt động đào tạo.
          </h2>
          <p>
            Hình ảnh hồ sơ được cung cấp ghi nhận đội ngũ nhân viên, hoạt động
            đào tạo nghiệp vụ, võ thuật, PCCC, sơ cấp cứu và tập huấn ứng xử tại
            cơ sở y tế.
          </p>
          <ul className="checklist">
            <li>
              <Check />
              Huấn luyện nghiệp vụ và tác phong bảo vệ.
            </li>
            <li>
              <Check />
              Rèn luyện kỹ năng ứng phó tình huống.
            </li>
            <li>
              <Check />
              Trang bị bộ đàm và công cụ hỗ trợ theo hồ sơ.
            </li>
          </ul>
          <p className="muted">
            Các giấy khen và hình ảnh mục tiêu trong hồ sơ là tài liệu lịch sử,
            không đại diện cho danh sách khách hàng hoặc tình trạng giấy phép
            hiện tại.
          </p>
        </div>
        <Photo src={site.training} type="training" />
      </section>
      <ConsultCTA />
    </>
  );
}
function Services({ site }) {
  let [q, setQ] = useState("");
  return (
    <>
      <PageHead
        label="DỊCH VỤ BẢO VỆ"
        title="Hiểu mục tiêu. Đúng phương án."
        text="Các nhóm mục tiêu được ghi nhận trong hồ sơ năng lực doanh nghiệp. Phạm vi triển khai cụ thể được thống nhất sau khảo sát."
      />
      <section className="section container">
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Tìm dịch vụ bảo vệ…"
        />
        <div className="service-grid">
          {services
            .filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
            .map((s, i) => (
              <a
                className="service-card"
                key={s.slug}
                href={"/dich-vu/" + s.slug}
              >
                {site[
                  serviceImageKeys[services.findIndex((x) => x.slug === s.slug)]
                ] && (
                  <img
                    className="service-thumb"
                    src={
                      site[
                        serviceImageKeys[
                          services.findIndex((x) => x.slug === s.slug)
                        ]
                      ]
                    }
                    alt={s.title}
                  />
                )}
                <div className="service-top">
                  <s.icon size={42} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="text-link">
                  Xem chi tiết <ArrowUpRight size={18} />
                </span>
              </a>
            ))}
        </div>
        {!services.some((s) =>
          s.title.toLowerCase().includes(q.toLowerCase()),
        ) && (
          <Empty
            title="Không tìm thấy dịch vụ"
            text="Thử từ khóa khác hoặc gửi yêu cầu tư vấn."
          />
        )}
      </section>
      <ConsultCTA />
    </>
  );
}
function ServiceDetail({ slug, site }) {
  let s = services.find((x) => x.slug === slug);
  if (!s) return <NotFound />;
  return (
    <>
      <PageHead label="DỊCH VỤ BẢO VỆ" title={s.title} text={s.desc} />
      <section className="section container detail-layout">
        <article>
          {site[serviceImageKeys[services.indexOf(s)]] && (
            <img
              className="service-detail-image"
              src={site[serviceImageKeys[services.indexOf(s)]]}
              alt={s.title}
            />
          )}
          <div className="service-symbol">
            <s.icon size={80} strokeWidth={1} />
            <span>{s.title}</span>
          </div>
          <h2>Phạm vi công việc dự kiến</h2>
          <p>
            Phương án bảo vệ được xây dựng sau khi tìm hiểu mặt bằng, thời gian
            hoạt động và yêu cầu phối hợp của đơn vị. Các đầu việc dưới đây là
            nội dung tham khảo để trao đổi trong quá trình khảo sát.
          </p>
          <ul className="checklist">
            {s.tasks.map((t) => (
              <li key={t}>
                <Check />
                {t}
              </li>
            ))}
          </ul>
          <h2>Triển khai theo đặc điểm mục tiêu</h2>
          <p>
            Tiếp nhận yêu cầu → khảo sát → thống nhất phương án và hợp đồng → bố
            trí nhân sự → kiểm tra, giám sát và điều chỉnh theo thực tế.
          </p>
          <h2>Trách nhiệm và phối hợp</h2>
          <p>
            Thống nhất đầu mối liên hệ, phạm vi nhiệm vụ, chế độ báo cáo và cách
            bàn giao ca ngay từ đầu. Mục tiêu là giúp đơn vị chủ động kiểm soát
            an ninh và duy trì hoạt động ổn định.
          </p>
          <p className="muted">
            Nhân sự, thời gian và chi phí được đề xuất riêng sau khảo sát; không
            áp dụng một mức giá chung cho mọi mục tiêu.
          </p>
        </article>
        <aside className="consult-box">
          <ShieldCheck size={32} />
          <h3>Trao đổi nhu cầu của bạn</h3>
          <p>
            Gửi thông tin mục tiêu để công ty tiếp nhận và đề xuất bước khảo sát
            phù hợp.
          </p>
          <Button href={"/lien-he?service=" + encodeURIComponent(s.title)}>
            Yêu cầu tư vấn
          </Button>
          <a href="/dich-vu" className="text-link">
            Các dịch vụ khác <ArrowRight size={16} />
          </a>
        </aside>
      </section>
    </>
  );
}
function Empty({ title, text }) {
  return (
    <div className="empty">
      <FileText size={30} strokeWidth={1} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function SearchBox({ value, onChange, placeholder = "Tìm kiếm…" }) {
  return (
    <label className="searchbox">
      <Search size={19} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
function Pager({ page, pages, onChange }) {
  return (
    pages > 1 && (
      <div className="pager">
        {Array.from({ length: pages }, (_, i) => (
          <button
            className={page === i + 1 ? "selected" : ""}
            key={i}
            onClick={() => onChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    )
  );
}
function date(s) {
  return new Date(s).toLocaleDateString("vi-VN");
}
function PostCard({ post: p }) {
  return (
    <a className="post-card" href={"/tin-tuc/" + p.slug}>
      {p.image ? (
        <img src={p.image} alt={p.title} />
      ) : (
        <div className="post-cover">
          <FileText size={48} strokeWidth={1} />
          <span>AN NINH / THÔNG TIN</span>
        </div>
      )}
      <div>
        <small>
          {p.category} <span>· {date(p.created_at)}</span>
        </small>
        <h3>{p.title}</h3>
        <p>{p.content.replace(/\[Ảnh\]\([^)]*\)/g, "").slice(0, 135)}…</p>
        <span className="text-link">
          Đọc bài viết <ArrowUpRight size={16} />
        </span>
      </div>
    </a>
  );
}
function News() {
  let [q, setQ] = useState(""),
    [cat, setCat] = useState(""),
    [page, setPage] = useState(1),
    [data, setData] = useState(null),
    [err, setErr] = useState("");
  useEffect(() => {
    let active = true;
    api(
      "/posts?q=" +
        encodeURIComponent(q) +
        "&category=" +
        encodeURIComponent(cat) +
        "&page=" +
        page,
    )
      .then((d) => active && setData(d))
      .catch((e) => active && setErr(e.message));
    return () => {
      active = false;
    };
  }, [q, cat, page]);
  return (
    <>
      <PageHead
        label="TIN TỨC & HOẠT ĐỘNG"
        title="Chuyện nghề. Chuyện An Ninh."
        text="Thông tin công ty, hoạt động đào tạo và kiến thức an ninh."
      />
      <section className="section container">
        <div className="filterbar">
          <SearchBox
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="Tìm bài viết…"
          />
          <select
            aria-label="Danh mục tin tức"
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {err && <Notice error>{err}</Notice>}
        {data?.items.length ? (
          <div className="news-grid">
            {data.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <Empty
            title={
              q || cat
                ? "Không có bài viết phù hợp"
                : "Tin tức đang được cập nhật"
            }
            text="Các bài viết đã xuất bản sẽ xuất hiện tại đây."
          />
        )}
        <Pager page={page} pages={data?.pages || 0} onChange={setPage} />
      </section>
    </>
  );
}
function Content({ text = "" }) {
  return (
    <div className="prose">
      {text.split("\n").map((line, i) => {
        let m = line.match(/^\[Ảnh\]\((\/media\/[a-f\d-]+)\)$/);
        if (m)
          return (
            <img
              key={i}
              src={m[1]}
              alt="Ảnh minh họa bài viết"
              loading="lazy"
            />
          );
        return line.startsWith("## ") ? (
          <h2 key={i}>{line.slice(3)}</h2>
        ) : line.startsWith("- ") ? (
          <p className="bullet" key={i}>
            • {line.slice(2)}
          </p>
        ) : (
          <p key={i}>{line || "\u00a0"}</p>
        );
      })}
    </div>
  );
}
function Post({ slug }) {
  let [p, setP] = useState(null),
    [related, setRelated] = useState([]),
    [err, setErr] = useState("");
  useEffect(() => {
    api("/posts/" + slug)
      .then((d) => {
        setP(d);
        document.title = d.title + " | An Ninh";
        api("/posts?category=" + encodeURIComponent(d.category))
          .then((x) =>
            setRelated(x.items.filter((y) => y.id !== d.id).slice(0, 3)),
          )
          .catch(() => {});
      })
      .catch((e) => setErr(e.message));
  }, [slug]);
  if (err) return <NotFound text={err} />;
  if (!p) return <div className="loading">Đang tải bài viết…</div>;
  return (
    <>
      <PageHead
        label={p.category}
        title={p.title}
        text={"Đăng ngày " + date(p.created_at)}
      />
      <article className="section article container">
        {p.image && (
          <img className="article-image" src={p.image} alt={p.title} />
        )}
        <Content text={p.content} />
        <a href="/tin-tuc" className="text-link">
          Tất cả bài viết <ArrowRight size={18} />
        </a>
      </article>
      {related.length > 0 && (
        <section className="section container">
          <h2>Bài viết liên quan</h2>
          <div className="news-grid">
            {related.map((p) => (
              <PostCard post={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
function Careers() {
  let [data, setData] = useState(null),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [err, setErr] = useState("");
  useEffect(() => {
    api("/jobs?q=" + encodeURIComponent(q) + "&page=" + page)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [q, page]);
  return (
    <>
      <PageHead
        label="TUYỂN DỤNG"
        title="Một công việc. Một trách nhiệm."
        text="Tìm hiểu công việc, yêu cầu và quyền lợi trước khi gửi hồ sơ đến An Ninh."
      />
      <section className="section container">
        <div className="career-intro">
          <Users size={42} strokeWidth={1} />
          <div>
            <h2>Gia nhập đội ngũ An Ninh</h2>
            <p>
              Các thông báo tuyển dụng chính thức được cập nhật tại đây. Công ty
              chưa công bố mức lương hoặc chế độ cho vị trí nào thì website sẽ
              không tự đưa ra cam kết.
            </p>
          </div>
        </div>
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm vị trí hoặc địa điểm làm việc…"
        />
        {err && <Notice error>{err}</Notice>}
        {data?.items.length ? (
          <div className="job-list">
            {data.items.map((j) => (
              <a href={"/tuyen-dung/" + j.slug} key={j.id}>
                <div>
                  <span
                    className={"badge " + (j.status === "open" ? "green" : "")}
                  >
                    {j.status === "open" ? "Đang tuyển" : "Đã đóng"}
                  </span>
                  <h3>{j.title}</h3>
                  <p>
                    <MapPin size={16} />
                    {j.location} <Clock size={16} />
                    {j.schedule}
                  </p>
                </div>
                <span>
                  {j.salary || "Lương: chưa công bố"}
                  <ArrowUpRight size={24} />
                </span>
              </a>
            ))}
          </div>
        ) : (
          <Empty
            title="Chưa có thông báo tuyển dụng"
            text="Vui lòng quay lại để xem các vị trí được công ty công bố."
          />
        )}
        <Pager page={page} pages={data?.pages || 0} onChange={setPage} />
      </section>
    </>
  );
}
function Field({
  label,
  name,
  type = "text",
  required = false,
  children,
  ...props
}) {
  return (
    <label className={"field " + (props.wide ? "wide" : "")}>
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          required={required}
          maxLength={props.maxLength || 500}
          {...Object.fromEntries(
            Object.entries(props).filter(([k]) => k !== "wide"),
          )}
        />
      )}
    </label>
  );
}
function Notice({ error, children }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={"notice " + (error ? "error" : "success")}
    >
      {children}
    </div>
  );
}
function Consent() {
  return (
    <label className="consent">
      <input type="checkbox" name="consent" required />
      <span>
        Tôi đồng ý để An Ninh xử lý thông tin nhằm tiếp nhận yêu cầu theo{" "}
        <a href="/bao-mat" target="_blank">
          chính sách bảo mật
        </a>
        .
      </span>
    </label>
  );
}
function Contact({ site }) {
  let [busy, setBusy] = useState(false),
    [msg, setMsg] = useState(""),
    [err, setErr] = useState(""),
    [sent, setSent] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    let f = e.currentTarget,
      d = Object.fromEntries(new FormData(f));
    d.consent = d.consent === "on";
    try {
      let r = await api("/contacts", { method: "POST", body: d });
      setMsg(r.message + " Mã tiếp nhận: " + r.id.slice(0, 8));
      setSent(true);
      f.reset();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead
        label="LIÊN HỆ TƯ VẤN"
        title="Bắt đầu từ nhu cầu của bạn."
        text="Chia sẻ thông tin mục tiêu cần bảo vệ. Chúng tôi sẽ tiếp nhận để trao đổi phương án phù hợp."
      />
      <section className="section container contact-layout">
        <aside>
          <Label>KẾT NỐI VỚI AN NINH</Label>
          <h2>
            Cùng trao đổi
            <br />
            về sự an toàn.
          </h2>
          <p>{site.name}</p>
          <div className="contact-info">
            {[
              [Phone, "Điện thoại", site.hotline || site.phone],
              [Mail, "Email", site.email],
              [MapPin, "Địa chỉ", site.address],
            ].map(([Icon, t, v]) => (
              <div key={t}>
                <Icon size={22} />
                <span>
                  <small>{t}</small>
                  {v ? (
                    <strong>
                      {t === "Điện thoại" ? (
                        <a href={"tel:" + v}>{v}</a>
                      ) : t === "Email" ? (
                        <a href={"mailto:" + v}>{v}</a>
                      ) : (
                        v
                      )}
                    </strong>
                  ) : (
                    <strong className="muted">Đang cập nhật</strong>
                  )}
                </span>
              </div>
            ))}
          </div>
          {site.map?.startsWith("https://www.google.com/maps/embed") && (
            <iframe
              className="map-frame"
              title="Bản đồ địa chỉ công ty"
              src={site.map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          {site.map && (
            <a
              href={site.map}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Xem bản đồ <ArrowUpRight size={18} />
            </a>
          )}
          <p className="muted">
            Thông tin mới nhất do doanh nghiệp xác nhận sẽ được cập nhật tại
            đây.
          </p>
        </aside>
        <div className="form-panel">
          <h2>Gửi yêu cầu tư vấn</h2>
          <p>Các trường có dấu * là bắt buộc.</p>
          {msg && <Notice>{msg}</Notice>}
          {err && <Notice error>{err}</Notice>}
          {!sent ? (
            <form onSubmit={submit}>
              <div className="form-grid">
                <Field label="Họ và tên" name="name" required maxLength={120} />
                <Field label="Công ty / đơn vị" name="company" />
                <Field
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  pattern="(\+84|0)[0-9 .\-]{8,13}"
                  required
                />
                <Field label="Email" name="email" type="email" required />
                <Field label="Dịch vụ quan tâm" required>
                  <select
                    name="service"
                    required
                    defaultValue={
                      new URLSearchParams(location.search).get("service") || ""
                    }
                  >
                    <option value="">Chọn dịch vụ</option>
                    {services.map((s) => (
                      <option key={s.slug}>{s.title}</option>
                    ))}
                    <option>Nhu cầu bảo vệ khác</option>
                  </select>
                </Field>
                <Field
                  label="Số nhân viên dự kiến"
                  name="quantity"
                  type="number"
                  min="1"
                  max="10000"
                />
                <Field
                  label="Địa điểm cần triển khai"
                  name="location"
                  required
                  wide
                />
                <Field label="Nội dung yêu cầu" required wide>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    maxLength="10000"
                    placeholder="Loại hình mục tiêu, thời gian cần bảo vệ và các yêu cầu cụ thể…"
                  />
                </Field>
              </div>
              <Consent />
              <button className="button" disabled={busy}>
                {busy ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}
                <ArrowUpRight size={18} />
              </button>
            </form>
          ) : (
            <button
              className="button"
              onClick={() => {
                setSent(false);
                setMsg("");
              }}
            >
              Gửi yêu cầu khác
            </button>
          )}
        </div>
      </section>
    </>
  );
}
function Job({ slug }) {
  let [j, setJ] = useState(null),
    [err, setErr] = useState(""),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/jobs/" + slug)
      .then((d) => {
        setJ(d);
        document.title = d.title + " | Tuyển dụng An Ninh";
      })
      .catch((e) => setErr(e.message));
  }, [slug]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    let f = e.currentTarget,
      d = new FormData(f);
    d.set("job_id", j.id);
    d.set("consent", "true");
    let file = d.get("file");
    if (file.size > 5 * 1024 * 1024) {
      setErr("Tệp vượt quá 5 MB.");
      setBusy(false);
      return;
    }
    try {
      let r = await api("/applications", { method: "POST", body: d });
      setMsg(r.message + " Mã hồ sơ: " + r.id.slice(0, 8));
      f.reset();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  if (!j)
    return err ? (
      <NotFound text={err} />
    ) : (
      <div className="loading">Đang tải vị trí…</div>
    );
  return (
    <>
      <PageHead label="TUYỂN DỤNG" title={j.title} text={j.location} />
      <section className="section container detail-layout">
        <article>
          <div className="job-facts">
            <span>
              <MapPin />
              {j.location}
            </span>
            <span>
              <Clock />
              {j.schedule}
            </span>
            <span>
              <Users />
              {j.quantity} nhân sự
            </span>
            <span>
              <Briefcase />
              {j.salary || "Mức lương chưa công bố"}
            </span>
          </div>
          {[
            ["Mô tả công việc", j.description],
            ["Yêu cầu ứng viên", j.requirements],
            ["Quyền lợi", j.benefits],
          ].map(([t, d]) => (
            <section key={t}>
              <h2>{t}</h2>
              <Content text={d} />
            </section>
          ))}
        </article>
        <aside className="consult-box">
          <span className="badge">
            {j.status === "open" ? "Đang tuyển" : "Đã đóng tuyển dụng"}
          </span>
          <h3>Chuẩn bị hồ sơ</h3>
          <p>
            CV hoặc hồ sơ định dạng PDF, DOC, DOCX; tối đa 5 MB. Không gửi giấy
            tờ tùy thân không cần thiết.
          </p>
          {j.status === "open" && (
            <a
              className="button"
              href={"/tuyen-dung/" + slug + "#ung-tuyen"}
              onClick={() =>
                setTimeout(
                  () => document.getElementById("ung-tuyen")?.scrollIntoView(),
                  30,
                )
              }
            >
              Ứng tuyển ngay <ArrowRight size={18} />
            </a>
          )}
        </aside>
      </section>
      <section id="ung-tuyen" className="section cream">
        <div className="container application-panel">
          <Label>GỬI HỒ SƠ</Label>
          <h2>Ứng tuyển vào An Ninh</h2>
          {err && <Notice error>{err}</Notice>}
          {msg && <Notice>{msg}</Notice>}
          {j.status === "closed" ? (
            <Notice error>
              Vị trí đã đóng tuyển dụng và không tiếp nhận hồ sơ mới.
            </Notice>
          ) : (
            !msg && (
              <form onSubmit={submit}>
                <div className="form-grid">
                  <Field
                    label="Họ và tên"
                    name="name"
                    required
                    maxLength={120}
                  />
                  <Field
                    label="Ngày sinh"
                    name="birth"
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().slice(0, 10)}
                    required
                  />
                  <Field label="Giới tính">
                    <select name="gender">
                      <option value="">Không cung cấp</option>
                      <option>Nam</option>
                      <option>Nữ</option>
                      <option>Khác</option>
                    </select>
                  </Field>
                  <Field
                    label="Số điện thoại"
                    name="phone"
                    type="tel"
                    required
                    pattern="(\+84|0)[0-9 .\-]{8,13}"
                  />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Trình độ học vấn" name="education" />
                  <Field
                    label="Địa chỉ hiện tại"
                    name="address"
                    required
                    wide
                  />
                  <Field label="Kinh nghiệm làm việc" required wide>
                    <textarea
                      name="experience"
                      required
                      rows="3"
                      maxLength="10000"
                      placeholder="Nếu chưa có kinh nghiệm, vui lòng ghi rõ."
                    />
                  </Field>
                  <Field label="Giới thiệu bản thân" required wide>
                    <textarea
                      name="intro"
                      required
                      rows="3"
                      maxLength="10000"
                    />
                  </Field>
                  <Field
                    label="CV / hồ sơ xin việc (tối đa 5 MB)"
                    required
                    wide
                  >
                    <input
                      type="file"
                      name="file"
                      accept=".pdf,.doc,.docx"
                      required
                    />
                  </Field>
                </div>
                <Consent />
                <button className="button" disabled={busy}>
                  {busy ? "Đang gửi hồ sơ…" : "Gửi hồ sơ ứng tuyển"}
                  <ArrowUpRight size={18} />
                </button>
              </form>
            )
          )}
        </div>
      </section>
    </>
  );
}
function Privacy() {
  return (
    <>
      <PageHead
        label="CHÍNH SÁCH BẢO MẬT"
        title="Thông tin của bạn được tiếp nhận như thế nào?"
      />
      <section className="section container article">
        <h2>Mục đích tiếp nhận</h2>
        <p>
          Thông tin liên hệ được sử dụng để tư vấn dịch vụ. Thông tin ứng viên
          và hồ sơ đính kèm được sử dụng để xem xét tuyển dụng và trao đổi với
          ứng viên.
        </p>
        <h2>Thông tin được lưu trữ</h2>
        <p>
          Website lưu các trường bạn cung cấp trong biểu mẫu và tệp hồ sơ ứng
          tuyển trên máy chủ. Hồ sơ ứng viên chỉ được cung cấp qua khu vực quản
          trị có đăng nhập. Cookie phiên chỉ phục vụ đăng nhập quản trị, không
          dùng cho quảng cáo.
        </p>
        <h2>Quyền của người gửi</h2>
        <p>
          Bạn có thể yêu cầu bộ phận phụ trách của An Ninh sửa hoặc xóa thông
          tin đã gửi. Vui lòng cung cấp mã tiếp nhận và sử dụng thông tin liên
          hệ chính thức trên trang Liên hệ khi được cập nhật.
        </p>
        <h2>Phạm vi truy cập</h2>
        <p>
          Quản trị viên được cấp quyền có thể xem và xử lý thông tin để thực
          hiện các mục đích trên. Không gửi giấy tờ hoặc dữ liệu nhạy cảm không
          cần thiết qua biểu mẫu.
        </p>
      </section>
    </>
  );
}
function ConsultCTA() {
  return (
    <section className="consult-cta">
      <div className="container">
        <div>
          <Label>TƯ VẤN DỊCH VỤ BẢO VỆ</Label>
          <h2>Bạn đang cần một phương án bảo vệ?</h2>
          <p>Chia sẻ nhu cầu để bắt đầu trao đổi về mục tiêu của bạn.</p>
        </div>
        <Button href="/lien-he">Trao đổi với An Ninh</Button>
      </div>
    </section>
  );
}
function Footer({ site }) {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <a className="brand" href="/">
            <ShieldCheck size={38} />
            <span>
              <strong>{site.shortName}</strong>
              <small>SECURITY SERVICE</small>
            </span>
          </a>
          <p>{site.name}</p>
          <p>{site.tagline}</p>
          <small>Thành lập ngày {site.founded}</small>
        </div>
        <div>
          <h4>Tìm hiểu</h4>
          <a href="/gioi-thieu">Giới thiệu & năng lực</a>
          <a href="/dich-vu">Dịch vụ bảo vệ</a>
          <a href="/tin-tuc">Tin tức & hoạt động</a>
          <a href="/tuyen-dung">Cơ hội nghề nghiệp</a>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <p>{site.address || "Địa chỉ: đang cập nhật"}</p>
          {site.hotline || site.phone ? (
            <a href={"tel:" + (site.hotline || site.phone)}>
              {site.hotline || site.phone}
            </a>
          ) : (
            <p>Điện thoại: đang cập nhật</p>
          )}
          {site.email && <a href={"mailto:" + site.email}>{site.email}</a>}
          {site.facebook && (
            <a href={site.facebook} target="_blank" rel="noreferrer">
              Facebook ↗
            </a>
          )}
          <p>{site.footer}</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} An Ninh. Bảo lưu mọi quyền.</span>
        <div>
          <a href="/bao-mat">Chính sách bảo mật</a>
          <a href="/admin">Quản trị</a>
        </div>
      </div>
    </footer>
  );
}
function NotFound({
  text = "Trang bạn tìm không tồn tại hoặc chưa được xuất bản.",
}) {
  return (
    <section className="section container">
      <Label>404</Label>
      <h1>Chưa tìm thấy nội dung</h1>
      <p>{text}</p>
      <Button href="/">Về trang chủ</Button>
    </section>
  );
}
function Admin({ site, updateSite }) {
  let [user, setUser] = useState(undefined),
    [tab, setTab] = useState("dashboard"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [rev, setRev] = useState(0);
  useEffect(() => {
    api("/admin/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  const reload = () => setRev((v) => v + 1);
  async function logout() {
    try {
      await api("/admin/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }
  if (user === undefined)
    return <div className="loading">Đang kiểm tra phiên đăng nhập…</div>;
  if (!user) return <Login onLogin={setUser} />;
  if (user.must_change) return <Password forced onDone={() => setUser(null)} />;
  let tabs = [
    ["dashboard", "Tổng quan", Building2],
    ["posts", "Tin tức", FileText],
    ["contacts", "Yêu cầu tư vấn", Mail],
    ["applications", "Hồ sơ ứng tuyển", Users],
    ["jobs", "Vị trí tuyển dụng", Briefcase],
    ["settings", "Thông tin công ty", ShieldCheck],
    ["password", "Đổi mật khẩu", LockKeyhole],
  ];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="brand">
          <ShieldCheck size={32} />
          <span>
            <strong>AN NINH</strong>
            <small>QUẢN TRỊ WEBSITE</small>
          </span>
        </a>
        <div className="admin-nav">
          {tabs.map(([id, t, Icon]) => (
            <button
              className={tab === id ? "active" : ""}
              key={id}
              onClick={() => {
                setTab(id);
                setError("");
                setNotice("");
              }}
            >
              <Icon size={19} />
              {t}
            </button>
          ))}
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          Xem website <ArrowUpRight size={17} />
        </a>
        <button onClick={logout}>
          <LogOut size={19} />
          Đăng xuất
        </button>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <span>
            QUẢN TRỊ / {tabs.find((x) => x[0] === tab)?.[1].toUpperCase()}
          </span>
          <span>{user.username}</span>
        </div>
        <div className="admin-content">
          <h1>{tabs.find((x) => x[0] === tab)?.[1]}</h1>
          {error && <Notice error>{error}</Notice>}
          {notice && <Notice>{notice}</Notice>}
          {tab === "dashboard" ? (
            <Dashboard rev={rev} />
          ) : tab === "posts" || tab === "jobs" ? (
            <ContentManager key={tab} type={tab} reload={reload} />
          ) : tab === "contacts" || tab === "applications" ? (
            <Inbox key={tab} type={tab} reload={reload} />
          ) : tab === "settings" ? (
            <Settings site={site} onUpdate={updateSite} />
          ) : (
            <Password onDone={() => setUser(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
function Login({ onLogin }) {
  let [show, setShow] = useState(false),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      onLogin(
        await api("/admin/login", {
          method: "POST",
          body: Object.fromEntries(new FormData(e.currentTarget)),
        }),
      );
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-aside">
        <a href="/" className="brand">
          <ShieldCheck size={44} />
          <span>
            <strong>AN NINH</strong>
            <small>SECURITY SERVICE</small>
          </span>
        </a>
        <div>
          <Label>KHU VỰC QUẢN TRỊ</Label>
          <h1>
            Quản lý nội dung.
            <br />
            Kết nối khách hàng.
          </h1>
          <p>
            Tiếp nhận yêu cầu, quản lý hồ sơ ứng viên và cập nhật thông tin
            chính thức của công ty.
          </p>
        </div>
        <small>Chỉ dành cho quản trị viên được cấp quyền.</small>
      </div>
      <div className="login-form">
        <LockKeyhole size={30} />
        <h2>Đăng nhập quản trị</h2>
        <p>Sử dụng tài khoản được người phụ trách cấp.</p>
        {err && <Notice error>{err}</Notice>}
        <form onSubmit={submit}>
          <Field
            label="Tên đăng nhập"
            name="username"
            required
            autoComplete="username"
          />
          <label className="field">
            <span>Mật khẩu *</span>
            <div className="password-input">
              <input
                type={show ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                maxLength="200"
              />
              <button
                type="button"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            <ArrowRight size={18} />
          </button>
        </form>
        <a href="/">← Về website</a>
      </div>
    </div>
  );
}
function Password({ forced = false, onDone }) {
  let [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr("");
    let d = Object.fromEntries(new FormData(e.currentTarget));
    if (d.password !== d.confirm) {
      setErr("Mật khẩu xác nhận không khớp.");
      return;
    }
    setBusy(true);
    try {
      await api("/admin/password", { method: "POST", body: d });
      alert("Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
      onDone();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={"password-panel " + (forced ? "forced" : "")}>
      <LockKeyhole size={30} />
      <h2>{forced ? "Thiết lập mật khẩu mới" : "Đổi mật khẩu"}</h2>
      <p>
        {forced
          ? "Bạn cần đổi mật khẩu tạm thời trước khi sử dụng trang quản trị."
          : "Sau khi thay đổi, tất cả phiên đăng nhập sẽ được kết thúc."}
      </p>
      {err && <Notice error>{err}</Notice>}
      <form onSubmit={submit}>
        <Field
          label="Mật khẩu hiện tại"
          name="current"
          type="password"
          required
          autoComplete="current-password"
        />
        <Field
          label="Mật khẩu mới (tối thiểu 12 ký tự)"
          name="password"
          type="password"
          minLength="12"
          required
          autoComplete="new-password"
        />
        <Field
          label="Nhập lại mật khẩu mới"
          name="confirm"
          type="password"
          minLength="12"
          required
          autoComplete="new-password"
        />
        <button className="button" disabled={busy}>
          Lưu mật khẩu mới
        </button>
      </form>
    </div>
  );
}
function Dashboard({ rev }) {
  let [d, setD] = useState(null),
    [err, setErr] = useState("");
  useEffect(() => {
    api("/admin/dashboard")
      .then(setD)
      .catch((e) => setErr(e.message));
  }, [rev]);
  return (
    <>
      {err && <Notice error>{err}</Notice>}
      <p className="muted">Thống kê trực tiếp từ cơ sở dữ liệu website.</p>
      <div className="stats">
        {[
          ["Tổng số bài viết", "posts"],
          ["Bài viết đã đăng", "published"],
          ["Yêu cầu liên hệ", "contacts"],
          ["Liên hệ chưa xử lý", "newContacts"],
          ["Hồ sơ ứng tuyển", "applications"],
          ["Hồ sơ mới nhận", "newApplications"],
          ["Vị trí đang tuyển", "openJobs"],
        ].map(([label, k]) => (
          <div key={k}>
            <small>{label}</small>
            <strong>{d?.[k] ?? "—"}</strong>
          </div>
        ))}
      </div>
      <div className="admin-tip">
        <h3>Bắt đầu cập nhật website</h3>
        <p>
          1. Xác nhận thông tin liên hệ và tải logo, ảnh thực tế trong “Thông
          tin công ty”.
        </p>
        <p>2. Tạo bài viết và chọn “Xuất bản” để hiển thị ngoài website.</p>
        <p>
          3. Tạo vị trí tuyển dụng với yêu cầu và quyền lợi đã được công ty phê
          duyệt.
        </p>
        <p>
          4. Tiếp nhận và cập nhật tiến độ ở mục yêu cầu tư vấn hoặc hồ sơ ứng
          tuyển.
        </p>
      </div>
    </>
  );
}
const emptyPost = {
  title: "",
  slug: "",
  category: categories[0],
  content: "",
  image: "",
  status: "draft",
};
const emptyJob = {
  title: "",
  slug: "",
  location: "",
  salary: "",
  schedule: "",
  quantity: 1,
  description: "",
  requirements: "",
  benefits: "",
  status: "closed",
};
function ContentManager({ type, reload }) {
  let [rows, setRows] = useState([]),
    [edit, setEdit] = useState(null),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(1),
    [err, setErr] = useState(""),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("/admin/" + type)
      .then(setRows)
      .catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, [type]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/admin/" + type + (edit.id ? "/" + edit.id : ""), {
        method: edit.id ? "PUT" : "POST",
        body: edit,
      });
      setEdit(null);
      setMsg(
        "Đã lưu dữ liệu. Website đã được cập nhật theo trạng thái đã chọn.",
      );
      load();
      reload();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(r) {
    if (!confirm(`Xóa “${r.title}”? Thao tác này không thể hoàn tác.`)) return;
    try {
      await api("/admin/" + type + "/" + r.id, { method: "DELETE" });
      load();
      reload();
      setMsg("Đã xóa nội dung.");
    } catch (e) {
      setErr(e.message);
    }
  }
  const change = (k, v) => setEdit((e) => ({ ...e, [k]: v }));
  let filtered = rows.filter(
      (r) =>
        (r.title + " " + r.slug).toLowerCase().includes(q.toLowerCase()) &&
        (!filter || r.status === filter),
    ),
    pages = Math.ceil(filtered.length / 10);
  return (
    <>
      {err && <Notice error>{err}</Notice>}
      {msg && <Notice>{msg}</Notice>}
      {edit ? (
        <div className="editor">
          <div className="editor-title">
            <h2>
              {edit.id ? "Chỉnh sửa" : "Tạo mới"}{" "}
              {type === "posts" ? "bài viết" : "vị trí tuyển dụng"}
            </h2>
            <button onClick={() => setEdit(null)}>
              <X /> Đóng
            </button>
          </div>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field
                label={type === "posts" ? "Tiêu đề" : "Tên vị trí"}
                required
                wide
              >
                <input
                  value={edit.title}
                  required
                  maxLength="200"
                  onChange={(e) => change("title", e.target.value)}
                />
              </Field>
              <Field label="Đường dẫn (để trống để tự tạo)">
                <input
                  value={edit.slug}
                  maxLength="160"
                  onChange={(e) => change("slug", e.target.value)}
                />
              </Field>
              <Field label="Trạng thái">
                <select
                  value={edit.status}
                  onChange={(e) => change("status", e.target.value)}
                >
                  {(type === "posts"
                    ? [
                        ["draft", "Bản nháp"],
                        ["published", "Xuất bản"],
                        ["hidden", "Ẩn bài viết"],
                      ]
                    : [
                        ["open", "Mở tuyển dụng"],
                        ["closed", "Đóng tuyển dụng"],
                      ]
                  ).map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              {type === "posts" ? (
                <>
                  <Field label="Danh mục">
                    <select
                      value={edit.category}
                      onChange={(e) => change("category", e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <ImageUpload
                    label="Ảnh đại diện"
                    value={edit.image}
                    onChange={(v) => change("image", v)}
                  />
                  <div className="wide">
                    <TextEditor
                      value={edit.content}
                      onChange={(v) => change("content", v)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Field label="Địa điểm làm việc" required>
                    <input
                      value={edit.location}
                      required
                      onChange={(e) => change("location", e.target.value)}
                    />
                  </Field>
                  <Field label="Lương / khoảng lương">
                    <input
                      value={edit.salary}
                      placeholder="Chỉ nhập khi công ty đã phê duyệt"
                      onChange={(e) => change("salary", e.target.value)}
                    />
                  </Field>
                  <Field label="Thời gian làm việc" required>
                    <input
                      value={edit.schedule}
                      required
                      onChange={(e) => change("schedule", e.target.value)}
                    />
                  </Field>
                  <Field label="Số lượng cần tuyển" required>
                    <input
                      value={edit.quantity}
                      type="number"
                      required
                      min="1"
                      max="10000"
                      onChange={(e) => change("quantity", e.target.value)}
                    />
                  </Field>
                  {[
                    ["description", "Mô tả công việc"],
                    ["requirements", "Yêu cầu ứng viên"],
                    ["benefits", "Quyền lợi"],
                  ].map(([k, t]) => (
                    <Field label={t} required wide key={k}>
                      <textarea
                        value={edit[k]}
                        required
                        rows="5"
                        onChange={(e) => change(k, e.target.value)}
                      />
                    </Field>
                  ))}
                </>
              )}
            </div>
            <button className="button" disabled={busy}>
              {busy ? "Đang lưu…" : "Lưu thay đổi"}
              <Check size={18} />
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="manager-tools">
            <SearchBox
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Tìm theo tiêu đề hoặc đường dẫn…"
            />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              {(type === "posts"
                ? [
                    ["draft", "Bản nháp"],
                    ["published", "Đã đăng"],
                    ["hidden", "Đã ẩn"],
                  ]
                : [
                    ["open", "Đang tuyển"],
                    ["closed", "Đã đóng"],
                  ]
              ).map(([v, t]) => (
                <option value={v} key={v}>
                  {t}
                </option>
              ))}
            </select>
            <button
              className="button"
              onClick={() => {
                setEdit({ ...(type === "posts" ? emptyPost : emptyJob) });
                setErr("");
                setMsg("");
              }}
            >
              <Plus size={18} />
              Tạo mới
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 10, page * 10).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.title}</strong>
                      <small>/{r.slug}</small>
                    </td>
                    <td>
                      <span className="badge">
                        {
                          {
                            draft: "Bản nháp",
                            published: "Đã đăng",
                            hidden: "Đã ẩn",
                            open: "Đang tuyển",
                            closed: "Đã đóng",
                          }[r.status]
                        }
                      </span>
                    </td>
                    <td>{date(r.created_at)}</td>
                    <td className="row-actions">
                      <button
                        onClick={() => {
                          setEdit({ ...r });
                          setErr("");
                          setMsg("");
                        }}
                      >
                        Sửa
                      </button>
                      <button onClick={() => remove(r)}>Xóa</button>
                      {(type === "jobs" || r.status === "published") && (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={
                            (type === "posts" ? "/tin-tuc/" : "/tuyen-dung/") +
                            r.slug
                          }
                        >
                          Xem ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <Empty
                title="Chưa có dữ liệu"
                text="Thêm nội dung mới để bắt đầu."
              />
            )}
          </div>
          <Pager page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </>
  );
}
function TextEditor({ value, onChange }) {
  let [preview, setPreview] = useState(false);
  return (
    <div className="text-editor">
      <label>Nội dung bài viết *</label>
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => onChange(value + "\n## Tiêu đề phụ\n")}
        >
          + Tiêu đề phụ
        </button>
        <button
          type="button"
          onClick={() => onChange(value + "\n- Mục danh sách\n")}
        >
          + Danh sách
        </button>
        <InlineImage
          onInsert={(url) => onChange(value + "\n[Ảnh](" + url + ")\n")}
        />
        <button type="button" onClick={() => setPreview(!preview)}>
          <Eye size={16} />
          {preview ? "Soạn thảo" : "Xem trước"}
        </button>
      </div>
      {preview ? (
        <Content text={value} />
      ) : (
        <textarea
          aria-label="Nội dung bài viết"
          required
          value={value}
          rows="16"
          maxLength="100000"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập nội dung. Dùng ## ở đầu dòng để thêm tiêu đề phụ. Nội dung được hiển thị an toàn, không thực thi mã HTML."
        />
      )}
    </div>
  );
}
function InlineImage({ onInsert }) {
  let [busy, setBusy] = useState(false);
  return (
    <label className="inline-upload">
      {busy ? "Đang tải…" : "+ Ảnh trong bài"}
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        disabled={busy}
        onChange={async (e) => {
          let f = e.target.files[0];
          if (!f) return;
          setBusy(true);
          try {
            let d = new FormData();
            d.set("file", f);
            let r = await api("/admin/images", { method: "POST", body: d });
            onInsert(r.url);
          } catch (x) {
            alert(x.message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </label>
  );
}
function ImageUpload({ label, value, onChange }) {
  let [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  return (
    <div className="image-upload">
      <span>{label}</span>
      {value && <img src={value} alt={label} />}
      <label className="upload-button">
        <Upload size={16} />
        {busy ? "Đang tải ảnh…" : "Tải ảnh JPG / PNG / WEBP"}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          disabled={busy}
          onChange={async (e) => {
            let f = e.target.files[0];
            if (!f) return;
            setBusy(true);
            setErr("");
            try {
              let d = new FormData();
              d.set("file", f);
              let r = await api("/admin/images", { method: "POST", body: d });
              onChange(r.url);
            } catch (x) {
              setErr(x.message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {value && (
        <button type="button" onClick={() => onChange("")}>
          Bỏ ảnh
        </button>
      )}
      {err && <Notice error>{err}</Notice>}
      <small>
        Tối đa 5 MB. Giữ nguyên tỉ lệ logo và dùng ảnh doanh nghiệp có quyền sử
        dụng.
      </small>
    </div>
  );
}
function Settings({ site, onUpdate }) {
  let [d, setD] = useState({ ...site }),
    [err, setErr] = useState(""),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const change = (k, v) => setD((x) => ({ ...x, [k]: v }));
  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      let r = await api("/admin/settings", { method: "PUT", body: d });
      onUpdate(r);
      setMsg("Đã cập nhật thông tin công ty trên website.");
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="editor">
      {err && <Notice error>{err}</Notice>}
      {msg && <Notice>{msg}</Notice>}
      <p className="muted">
        Chỉ công bố thông tin đã được doanh nghiệp xác nhận. Để trống số điện
        thoại hoặc địa chỉ nếu chưa xác nhận.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid">
          {[
            ["name", "Tên công ty"],
            ["shortName", "Tên hiển thị"],
            ["tagline", "Thông điệp"],
            ["founded", "Ngày thành lập"],
            ["founder", "Người sáng lập"],
            ["phone", "Điện thoại"],
            ["hotline", "Hotline"],
            ["email", "Email"],
            ["address", "Địa chỉ"],
            ["map", "Liên kết Google Maps"],
            ["zalo", "Liên kết Zalo (https://)"],
            ["facebook", "Liên kết Facebook (https://)"],
            ["footer", "Nội dung chân trang"],
            ["historyNote", "Ghi chú nguồn thông tin lịch sử"],
          ].map(([k, t]) => (
            <Field key={k} label={t}>
              <input
                value={d[k]}
                type={k === "email" ? "email" : "text"}
                maxLength="1000"
                onChange={(e) => change(k, e.target.value)}
              />
            </Field>
          ))}
          <Field label="Giới thiệu công ty" wide>
            <textarea
              value={d.about}
              rows="6"
              maxLength="10000"
              onChange={(e) => change("about", e.target.value)}
            />
          </Field>
          {[
            ["logo", "Logo gốc"],
            ["hero", "Ảnh banner chính"],
            ["team", "Ảnh đội ngũ"],
            ["training", "Ảnh huấn luyện"],
            ["serviceBuilding", "Ảnh bảo vệ tòa nhà"],
            ["serviceFactory", "Ảnh bảo vệ nhà máy"],
            ["serviceBank", "Ảnh bảo vệ ngân hàng"],
            ["serviceHospital", "Ảnh bảo vệ bệnh viện"],
          ].map(([k, t]) => (
            <ImageUpload
              label={t}
              key={k}
              value={d[k]}
              onChange={(v) => change(k, v)}
            />
          ))}
        </div>
        <button className="button" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu thông tin công ty"}
          <Check size={18} />
        </button>
      </form>
    </div>
  );
}
function Inbox({ type, reload }) {
  let [rows, setRows] = useState([]),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [job, setJob] = useState(""),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState(null),
    [err, setErr] = useState(""),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("/admin/" + type)
      .then(setRows)
      .catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, [type]);
  let filtered = rows.filter(
    (r) =>
      (r.data.name + " " + r.data.phone + " " + r.data.email)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!status || r.status === status) &&
      (!job || r.job_id === job) &&
      (!from || r.created_at.slice(0, 10) >= from) &&
      (!to || r.created_at.slice(0, 10) <= to),
  );
  async function save() {
    setBusy(true);
    try {
      await api("/admin/" + type + "/" + edit.id, {
        method: "PUT",
        body: { status: edit.status, notes: edit.notes },
      });
      setMsg("Đã lưu trạng thái và ghi chú.");
      setEdit(null);
      load();
      reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(r) {
    if (
      !confirm(
        "Xóa vĩnh viễn thông tin này" +
          (type === "applications" ? " và tệp hồ sơ đính kèm" : "") +
          "?",
      )
    )
      return;
    try {
      await api("/admin/" + type + "/" + r.id, { method: "DELETE" });
      setEdit(null);
      setMsg("Đã xóa dữ liệu.");
      load();
      reload();
    } catch (e) {
      setErr(e.message);
    }
  }
  let jobs = [...new Map(rows.map((r) => [r.job_id, r.job_title])).entries()];
  return (
    <>
      {err && <Notice error>{err}</Notice>}
      {msg && <Notice>{msg}</Notice>}
      <div className="manager-tools">
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm tên, số điện thoại hoặc email…"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Lọc trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions[type].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {type === "applications" && (
          <select
            value={job}
            onChange={(e) => {
              setJob(e.target.value);
              setPage(1);
            }}
            aria-label="Lọc vị trí"
          >
            <option value="">Tất cả vị trí</option>
            {jobs.map(([id, t]) => (
              <option value={id} key={id}>
                {t}
              </option>
            ))}
          </select>
        )}
        <label className="date-filter">
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="date-filter">
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <p className="muted">{filtered.length} kết quả</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã / ngày gửi</th>
              <th>Họ tên</th>
              <th>Liên hệ</th>
              <th>{type === "contacts" ? "Dịch vụ" : "Vị trí"}</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page - 1) * 10, page * 10).map((r) => (
              <tr key={r.id}>
                <td>
                  <small>{r.id.slice(0, 8)}</small>
                  {date(r.created_at)}
                </td>
                <td>
                  <strong>{r.data.name}</strong>
                </td>
                <td>
                  {r.data.phone}
                  <small>{r.data.email}</small>
                </td>
                <td>{type === "contacts" ? r.data.service : r.job_title}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
                <td className="row-actions">
                  <button
                    onClick={() => {
                      setEdit({ ...r });
                      setErr("");
                    }}
                  >
                    Chi tiết
                  </button>
                  <button onClick={() => remove(r)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <Empty
            title="Chưa có thông tin phù hợp"
            text="Dữ liệu gửi từ website sẽ xuất hiện tại đây."
          />
        )}
      </div>
      <Pager
        page={page}
        pages={Math.ceil(filtered.length / 10)}
        onChange={setPage}
      />
      {edit && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Chi tiết hồ sơ"
        >
          <div className="modal-panel">
            <div className="editor-title">
              <div>
                <small>Mã: {edit.id}</small>
                <h2>{edit.data.name}</h2>
              </div>
              <button onClick={() => setEdit(null)} aria-label="Đóng chi tiết">
                <X />
              </button>
            </div>
            <dl className="record-details">
              {Object.entries(edit.data).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt>
                    {{
                      name: "Họ tên",
                      phone: "Số điện thoại",
                      email: "Email",
                      company: "Đơn vị",
                      service: "Dịch vụ",
                      location: "Địa điểm",
                      quantity: "Số nhân sự",
                      message: "Yêu cầu",
                      birth: "Ngày sinh",
                      gender: "Giới tính",
                      address: "Địa chỉ",
                      education: "Học vấn",
                      experience: "Kinh nghiệm",
                      intro: "Giới thiệu",
                    }[k] || k}
                  </dt>
                  <dd>{v || "—"}</dd>
                </React.Fragment>
              ))}
            </dl>
            {edit.job_title && (
              <p>
                <strong>Vị trí:</strong> {edit.job_title}
              </p>
            )}
            {edit.file_id && (
              <a
                href={"/api/admin/files/" + edit.file_id}
                download
                className="button outline"
              >
                <Download size={17} />
                Tải CV / hồ sơ
              </a>
            )}
            <Field label="Trạng thái">
              <select
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
              >
                {statusOptions[type].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Ghi chú nội bộ">
              <textarea
                value={edit.notes}
                rows="4"
                maxLength="10000"
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              />
            </Field>
            <div className="actions">
              <button className="button" onClick={save} disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu xử lý"}
              </button>
              <button onClick={() => setEdit(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
