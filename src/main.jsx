import React, { useEffect, useState, useRef } from "react";
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
import Photo from "./Photo.jsx";
import { media, serviceMedia, gallery } from "./company-media.js";
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
        !a.pathname.startsWith("/company-images/") &&
        e.button === 0 &&
        !e.shiftKey &&
        !e.altKey &&
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
      <Careers site={site} />
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
      <main id="noi-dung" key={path}>
        {page}
      </main>
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
function Brand({ site }) {
  return (
    <a className="brand" href="/" aria-label="An Ninh — Trang chủ">
      <Photo src={site.logo} photo={media.logo} className="brand-mark" eager />
      <span>
        <strong>{site.shortName}</strong>
        <small>SECURITY SERVICE</small>
      </span>
    </a>
  );
}
function Header({ site, path }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <a className="skip-link" href="#noi-dung">
        Đến nội dung
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand site={site} />
          <nav
            id="main-nav"
            className={open ? "open" : ""}
            aria-label="Điều hướng chính"
          >
            {[
              ["/", "Trang chủ"],
              ["/gioi-thieu", "Về An Ninh"],
              ["/dich-vu", "Dịch vụ"],
              ["/tin-tuc", "Hoạt động"],
              ["/tuyen-dung", "Tuyển dụng"],
            ].map(([url, title]) => (
              <a
                key={url}
                href={url}
                aria-current={
                  path === url || (url !== "/" && path.startsWith(url + "/"))
                    ? "page"
                    : undefined
                }
              >
                {title}
              </a>
            ))}
          </nav>
          <a className="button header-cta" href="/lien-he">
            Kết nối với chúng tôi <ArrowUpRight size={17} />
          </a>
          <button
            className="menu-toggle"
            aria-controls="main-nav"
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
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
function ServiceCards({ site, items = services }) {
  return (
    <div className="service-grid">
      {items.map((service) => {
        const index = services.indexOf(service);
        return (
          <a
            className="service-card"
            href={`/dich-vu/${service.slug}`}
            key={service.slug}
          >
            <div className="service-picture">
              <Photo
                src={site[serviceImageKeys[index]]}
                photo={serviceMedia[index]}
              />
              <span className="round-arrow">
                <ArrowUpRight size={22} />
              </span>
            </div>
            <div className="service-body">
              <span className="service-number">
                0{index + 1} / DỊCH VỤ BẢO VỆ
              </span>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
function ActivityGallery({ compact = false }) {
  const [category, setCategory] = useState("Tất cả"),
    [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  const items = (compact ? gallery.slice(0, 4) : gallery).filter(
    (item) => category === "Tất cả" || item.category === category,
  );
  return (
    <div className="activity-gallery">
      {!compact && (
        <div className="gallery-filters" aria-label="Lọc ảnh">
          {["Tất cả", "Đội ngũ", "Đào tạo", "Mục tiêu", "Ghi nhận"].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className={compact ? "gallery-grid compact" : "gallery-grid"}>
        {items.map((item) => (
          <button
            className="gallery-item"
            key={item.title}
            onClick={() => setSelected(item)}
            aria-label={`Xem ảnh: ${item.title}`}
          >
            <Photo photo={item.photo} />
            <span>
              <small>{item.category}</small>
              <strong>{item.title}</strong>
              <Plus size={20} />
            </span>
          </button>
        ))}
      </div>
      <p className="photo-source">Hình ảnh từ hồ sơ công ty qua các thời kỳ.</p>
      <dialog
        ref={dialog}
        className="photo-dialog"
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        {selected && (
          <>
            <div className="dialog-top">
              <div>
                <small>{selected.category}</small>
                <h3>{selected.title}</h3>
              </div>
              <button
                autoFocus
                onClick={() => dialog.current.close()}
                aria-label="Đóng ảnh"
              >
                <X />
              </button>
            </div>
            <Photo photo={selected.photo} contain />
            <p>{selected.photo.alt}. Hình ảnh tư liệu trong hồ sơ công ty.</p>
          </>
        )}
      </dialog>
    </div>
  );
}
function Home({ site }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api("/posts")
      .then((d) => setPosts(d.items.slice(0, 3)))
      .catch(() => {});
  }, []);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <Label>AN NINH · TỪ NĂM 2006</Label>
          <h1>
            Vững vàng
            <br />
            bảo vệ.
            <br />
            <span>Trọn vẹn niềm tin.</span>
          </h1>
          <p>
            Đồng hành cùng doanh nghiệp trong việc bảo vệ con người, tài sản và
            sự an toàn mỗi ngày.
          </p>
          <div className="actions">
            <Button href="/lien-he">Tư vấn phương án bảo vệ</Button>
            <a className="text-link" href="/gioi-thieu">
              Về An Ninh <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-top">
            <span>
              <i /> CON NGƯỜI LÀ NỀN TẢNG
            </span>
            <ShieldCheck size={25} />
          </div>
          <Photo src={site.hero || site.team} photo={media.team} eager />
          <div className="hero-image-caption">
            <span>
              Đội ngũ An Ninh
              <small>
                Kỷ luật trong tác phong. Trách nhiệm trong công việc.
              </small>
            </span>
            <span className="image-index">01 / AN NINH</span>
          </div>
          <a className="hero-mini" href="/gioi-thieu#hinh-anh">
            <Photo src={site.training} photo={media.training} />
            <span>
              Từ huấn luyện
              <br />
              <strong>đến thực tiễn.</strong>
            </span>
            <ArrowUpRight size={24} />
          </a>
        </div>
      </section>
      <section className="trust-strip">
        <div className="container">
          <div>
            <strong>
              2006<span>KHỞI ĐẦU HÀNH TRÌNH</span>
            </strong>
            <p>Thành lập ngày {site.founded}</p>
          </div>
          <div>
            <ShieldCheck />
            <span>
              Bảo vệ bằng
              <br />
              <strong>tinh thần trách nhiệm</strong>
            </span>
          </div>
          <div>
            <Users />
            <span>
              Xây dựng từ
              <br />
              <strong>nền tảng con người</strong>
            </span>
          </div>
          <a href="/gioi-thieu#hinh-anh">
            Khám phá hình ảnh thực tế <ArrowUpRight size={20} />
          </a>
        </div>
      </section>
      <section className="section container">
        <SectionTitle
          label="GIẢI PHÁP AN NINH"
          title={
            <>
              Hiểu từng mục tiêu.
              <br />
              Bảo vệ đúng nhu cầu.
            </>
          }
          link={{ href: "/dich-vu", text: "Khám phá dịch vụ" }}
        >
          Phương án riêng cho đặc điểm vận hành của từng đơn vị.
        </SectionTitle>
        <ServiceCards site={site} />
      </section>
      <section className="story-section">
        <div className="container story-layout">
          <div className="story-image">
            <Photo src={site.team} photo={media.hospital} />
            <span className="vertical-caption">
              AN NINH / CON NGƯỜI & TRÁCH NHIỆM
            </span>
          </div>
          <div className="story-copy">
            <Label>CÂU CHUYỆN AN NINH</Label>
            <h2>
              Niềm tin bắt đầu
              <br />
              từ trách nhiệm.
            </h2>
            <p>
              Được thành lập bởi ông {site.founder}, từng là sĩ quan nghiệp vụ
              trong lực lượng Công an nhân dân, An Ninh mang nền tảng nghiệp vụ
              vào công tác bảo vệ.
            </p>
            <p>
              Chúng tôi hướng đến sự an toàn của con người và tài sản, góp phần
              giữ gìn trật tự trong hoạt động của mỗi đơn vị.
            </p>
            <div className="values-inline">
              <span>
                <Check size={17} /> Trách nhiệm
              </span>
              <span>
                <Check size={17} /> Kỷ luật
              </span>
              <span>
                <Check size={17} /> Phối hợp
              </span>
            </div>
            <Button href="/gioi-thieu" light>
              Tìm hiểu về chúng tôi
            </Button>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionTitle
          label="CON NGƯỜI AN NINH"
          title="Nghiệp vụ được rèn luyện mỗi ngày."
          link={{ href: "/gioi-thieu#hinh-anh", text: "Xem thư viện ảnh" }}
        >
          Từ tác phong, nghiệp vụ bảo vệ đến PCCC và kỹ năng sơ cấp cứu.
        </SectionTitle>
        <ActivityGallery compact />
      </section>
      <section className="career-banner container">
        <div>
          <Label>ĐỒNG HÀNH CÙNG AN NINH</Label>
          <h2>
            Một công việc có trách nhiệm.
            <br />
            Một đội ngũ để gắn bó.
          </h2>
          <p>
            Tìm hiểu nghề bảo vệ và để lại thông tin ứng tuyển. Chúng tôi tiếp
            nhận hồ sơ để trao đổi khi có công việc phù hợp.
          </p>
          <Button href="/tuyen-dung">Tìm hiểu & đăng ký ứng tuyển</Button>
        </div>
        <Photo src={site.training} photo={media.training} />
      </section>
      {posts.length > 0 && (
        <section className="section container">
          <SectionTitle
            label="TIN TỨC & HOẠT ĐỘNG"
            title="Nhịp sống An Ninh."
            link={{ href: "/tin-tuc", text: "Tất cả bài viết" }}
          />
          <div className="news-grid">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
      <ConsultCTA />
    </>
  );
}
function PageHead({ label, title, text }) {
  return (
    <section className="page-head">
      <div className="container">
        <a className="breadcrumb" href="/">
          An Ninh <ChevronRight size={14} /> <span>{label}</span>
        </a>
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
        label="VỀ AN NINH"
        title={
          <>
            Vững nền tảng.
            <br />
            <span>Bền niềm tin.</span>
          </>
        }
        text="Hành trình bảo vệ con người và tài sản, bắt đầu từ tinh thần trách nhiệm."
      />
      <section className="section container about-layout">
        <div>
          <Label>THÀNH LẬP NGÀY {site.founded}</Label>
          <h2>
            Từ nền tảng nghiệp vụ,
            <br />
            đến sự an toàn mỗi ngày.
          </h2>
          <p>{site.about}</p>
          <div className="founder">
            <small>NGƯỜI SÁNG LẬP</small>
            <h3>Ông {site.founder}</h3>
            <p>Từng là sĩ quan nghiệp vụ trong lực lượng Công an nhân dân.</p>
          </div>
        </div>
        <Photo src={site.team} photo={media.team} />
      </section>
      <section className="principles-section">
        <div className="container">
          <Label>ĐIỀU CHÚNG TÔI THEO ĐUỔI</Label>
          <div className="principle-grid">
            {[
              [
                "01",
                "Trách nhiệm",
                "Thực hiện đúng nhiệm vụ, đặt sự an toàn của con người và tài sản trong từng công việc.",
              ],
              [
                "02",
                "Kỷ luật",
                "Rèn luyện tác phong, tuân thủ nội quy và duy trì việc bàn giao, báo cáo ca trực.",
              ],
              [
                "03",
                "Phối hợp",
                "Thống nhất đầu mối, trao đổi rõ ràng và phối hợp theo phương án của đơn vị.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="nang-luc" className="section container training-layout">
        <Photo src={site.training} photo={media.training} />
        <div>
          <Label>NĂNG LỰC ĐỘI NGŨ</Label>
          <h2>
            Rèn kỹ năng.
            <br />
            Vững tác phong.
          </h2>
          <p>
            Hồ sơ công ty ghi nhận hoạt động đào tạo nghiệp vụ bảo vệ, võ thuật,
            phòng cháy chữa cháy, sơ cấp cứu và tập huấn ứng xử tại cơ sở y tế.
          </p>
          <ul className="checklist">
            {[
              "Nghiệp vụ bảo vệ và kiểm soát mục tiêu",
              "Phối hợp xử lý các tình huống phát sinh",
              "Kỹ năng PCCC, sơ cấp cứu và ứng xử",
            ].map((t) => (
              <li key={t}>
                <Check />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="hinh-anh" className="section gallery-section">
        <div className="container">
          <SectionTitle
            label="THƯ VIỆN HÌNH ẢNH"
            title="Những hình ảnh kể câu chuyện An Ninh."
          >
            Đội ngũ, đào tạo và hoạt động qua các thời kỳ. Chọn ảnh để xem lớn.
          </SectionTitle>
          <ActivityGallery />
          <p className="archive-note">
            Các hình ảnh mục tiêu và ghi nhận trong hồ sơ phản ánh hoạt động tại
            thời điểm ghi hình.
          </p>
        </div>
      </section>
      <ConsultCTA />
    </>
  );
}
function Services({ site }) {
  const [q, setQ] = useState("");
  const found = services.filter((s) =>
    s.title.toLocaleLowerCase("vi").includes(q.toLocaleLowerCase("vi")),
  );
  return (
    <>
      <PageHead
        label="DỊCH VỤ BẢO VỆ"
        title={
          <>
            Mỗi mục tiêu.
            <br />
            <span>Một phương án riêng.</span>
          </>
        }
        text="Từ văn phòng, nhà máy đến ngân hàng và cơ sở y tế. Cùng xây dựng phương án bảo vệ phù hợp với cách đơn vị của bạn vận hành."
      />
      <section className="section container">
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Tìm lĩnh vực bảo vệ…"
        />
        <ServiceCards site={site} items={found} />
        {!found.length && (
          <Empty
            title="Chưa tìm thấy dịch vụ phù hợp"
            text="Thử từ khóa khác hoặc gửi nhu cầu để chúng tôi tiếp nhận."
          />
        )}
      </section>
      <Process />
      <ConsultCTA />
    </>
  );
}
function Process() {
  return (
    <section className="process-section">
      <div className="container">
        <SectionTitle
          label="CÁCH CHÚNG TÔI ĐỒNG HÀNH"
          title="Rõ ràng từ bước đầu tiên."
        />
        <div className="process-grid">
          {[
            [
              "Lắng nghe",
              "Tiếp nhận nhu cầu, địa điểm và thời gian cần bảo vệ.",
            ],
            [
              "Khảo sát",
              "Tìm hiểu mặt bằng, luồng di chuyển và các yêu cầu phối hợp.",
            ],
            [
              "Thống nhất",
              "Xây dựng phương án, nhân sự, ca trực và phạm vi nhiệm vụ.",
            ],
            [
              "Triển khai",
              "Bố trí lực lượng, bàn giao, giám sát và điều chỉnh theo thực tế.",
            ],
          ].map(([t, d], i) => (
            <article key={t}>
              <span>0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
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
          <Photo
            src={site[serviceImageKeys[services.indexOf(s)]]}
            photo={serviceMedia[services.indexOf(s)]}
            className="service-detail-image"
          />
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
        ) : q || cat ? (
          <Empty
            title="Không có bài viết phù hợp"
            text="Thử từ khóa hoặc danh mục khác."
          />
        ) : (
          <>
            <SectionTitle
              label="HÌNH ẢNH TỪ HỒ SƠ CÔNG TY"
              title="Hoạt động & con người An Ninh."
            />
            <ActivityGallery />
          </>
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
function Careers({ site }) {
  const [data, setData] = useState(null),
    [err, setErr] = useState(""),
    [page, setPage] = useState(1);
  useEffect(() => {
    let active = true;
    setErr("");
    api("/jobs?status=open&page=" + page)
      .then((d) => active && setData(d))
      .catch((e) => active && setErr(e.message));
    return () => {
      active = false;
    };
  }, [page]);
  const jobs = data?.items.filter((j) => j.status === "open") || [];
  return (
    <>
      <section className="careers-hero container">
        <div>
          <Label>GIA NHẬP ĐỘI NGŨ AN NINH</Label>
          <h1>
            Bắt đầu công việc.
            <br />
            <span>
              Gắn bó bằng
              <br />
              trách nhiệm.
            </span>
          </h1>
          <p>
            Bạn mong muốn làm việc trong lĩnh vực bảo vệ? Tìm hiểu công việc và
            gửi thông tin để An Ninh trao đổi cơ hội phù hợp với bạn.
          </p>
          <Button href="/tuyen-dung#dang-ky">
            Đăng ký ứng tuyển <span className="sr-only">vào An Ninh</span>
          </Button>
          <div className="career-tags">
            <span>Nghiệp vụ bảo vệ</span>
            <span>Tác phong kỷ luật</span>
            <span>Tinh thần đồng đội</span>
          </div>
        </div>
        <div className="careers-visual">
          <Photo src={site.training} photo={media.training} eager />
          <span>CON NGƯỜI LÀ NỀN TẢNG CỦA AN NINH</span>
        </div>
      </section>
      <section className="section career-content">
        <div className="container">
          <SectionTitle
            label="TÌM HIỂU TRƯỚC KHI ỨNG TUYỂN"
            title="Công việc của người bảo vệ."
          />
          <div className="career-info-grid">
            <article>
              <ShieldCheck />
              <h3>Bạn sẽ làm gì?</h3>
              <ul>
                <li>
                  Kiểm soát người, phương tiện ra vào theo nội quy mục tiêu.
                </li>
                <li>Tuần tra, quan sát và báo cáo các dấu hiệu bất thường.</li>
                <li>
                  Hướng dẫn khách, giữ gìn trật tự và phối hợp với đơn vị.
                </li>
                <li>
                  Ghi chép, bàn giao ca và thực hiện nhiệm vụ được phân công.
                </li>
              </ul>
            </article>
            <article>
              <Users />
              <h3>Điều gì cần ở bạn?</h3>
              <ul>
                <li>Trung thực, có trách nhiệm và chấp hành kỷ luật.</li>
                <li>
                  Sức khỏe phù hợp với công việc và ca trực được thống nhất.
                </li>
                <li>
                  Tác phong lịch sự, biết lắng nghe và phối hợp cùng đồng đội.
                </li>
                <li>
                  Nếu chưa có kinh nghiệm, hãy chia sẻ rõ khi đăng ký để được tư
                  vấn.
                </li>
              </ul>
            </article>
            <article>
              <Briefcase />
              <h3>Thu nhập & quyền lợi</h3>
              <ul>
                <li>
                  Mức lương, phụ cấp và lịch làm việc được trao đổi theo vị trí,
                  mục tiêu.
                </li>
                <li>
                  Các chế độ hợp đồng, bảo hiểm và nghỉ phép được làm rõ khi
                  phỏng vấn theo quy định áp dụng.
                </li>
                <li>
                  Nội dung hướng dẫn nghiệp vụ và yêu cầu trang phục được trao
                  đổi trước khi nhận việc.
                </li>
              </ul>
              <p className="muted">
                Hãy hỏi rõ những nội dung bạn quan tâm trước khi đồng ý nhận
                việc.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section container job-section">
        <SectionTitle
          label="CƠ HỘI NGHỀ NGHIỆP"
          title="Tìm công việc phù hợp với bạn."
        />
        {err && <Notice error>{err}</Notice>}
        {!data && !err ? (
          <p role="status">Đang tải thông tin tuyển dụng…</p>
        ) : jobs.length ? (
          <div className="job-list">
            {jobs.map((j) => (
              <a key={j.id} href={`/tuyen-dung/${j.slug}`}>
                <div>
                  <span className="badge green">Đang nhận hồ sơ</span>
                  <h3>{j.title}</h3>
                  <p>
                    <MapPin size={16} />
                    {j.location}
                    <Clock size={16} />
                    {j.schedule}
                  </p>
                </div>
                <span>
                  {j.salary || "Thu nhập trao đổi khi phỏng vấn"}
                  <ArrowUpRight size={24} />
                </span>
              </a>
            ))}
          </div>
        ) : (
          !err && (
            <div className="talent-callout">
              <div className="talent-icon">
                <FileText size={30} />
              </div>
              <div>
                <h3>Chưa thấy vị trí phù hợp? Vẫn có thể gửi hồ sơ.</h3>
                <p>
                  Hiện chưa có đợt tuyển dụng đang mở trên website. An Ninh tiếp
                  nhận thông tin để liên hệ khi có nhu cầu phù hợp với khu vực
                  và thời gian làm việc của bạn.
                </p>
              </div>
              <a className="text-link" href="/tuyen-dung#dang-ky">
                Để lại thông tin <ArrowRight size={18} />
              </a>
            </div>
          )
        )}
        <Pager page={page} pages={data?.pages || 0} onChange={setPage} />
      </section>
      <section className="application-section" id="dang-ky">
        <div className="container application-layout">
          <div>
            <Label>ĐĂNG KÝ ỨNG TUYỂN</Label>
            <h2>
              Cho chúng tôi
              <br />
              biết về bạn.
            </h2>
            <p>
              Chỉ cần để lại thông tin liên hệ, khu vực mong muốn và vài dòng
              giới thiệu. Bạn có thể đính kèm CV nếu đã chuẩn bị.
            </p>
            <ol className="application-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>Gửi thông tin</strong>
                  <p>Điền biểu mẫu ngay bên cạnh.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Trao đổi công việc</strong>
                  <p>
                    Bộ phận tuyển dụng xem xét và liên hệ khi có nhu cầu phù
                    hợp.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Hoàn thiện hồ sơ</strong>
                  <p>
                    Trao đổi rõ vị trí, ca trực, thu nhập và giấy tờ cần chuẩn
                    bị.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <QuickApplication />
        </div>
      </section>
      <section className="section container career-faq">
        <SectionTitle
          label="BẠN CÓ THỂ QUAN TÂM"
          title="Một vài điều trước khi bắt đầu."
        />
        {[
          [
            "Chưa có kinh nghiệm có thể đăng ký không?",
            "Bạn có thể để lại thông tin và ghi rõ chưa có kinh nghiệm. Bộ phận tuyển dụng sẽ trao đổi yêu cầu của công việc khi có nhu cầu phù hợp.",
          ],
          [
            "Tôi cần chuẩn bị hồ sơ gì?",
            "Khi đăng ký trực tuyến, bạn chỉ cần thông tin liên hệ và giới thiệu ngắn. CV là tùy chọn. Các giấy tờ bổ sung sẽ được hướng dẫn khi trao đổi công việc.",
          ],
          [
            "Tôi có thể chọn khu vực và ca làm việc không?",
            "Hãy ghi khu vực, thời gian và ca làm việc mong muốn trong biểu mẫu. Việc bố trí được trao đổi theo nhu cầu của từng mục tiêu.",
          ],
          [
            "Gửi hồ sơ có nghĩa là đã được nhận việc không?",
            "Biểu mẫu là bước đăng ký nguyện vọng. Kết quả tuyển dụng và thời điểm nhận việc được trao đổi sau khi xem xét hồ sơ và phỏng vấn.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <Plus size={19} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  );
}
function QuickApplication() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    if (d.get("file")?.size > 5 * 1024 * 1024) {
      setError("CV vượt quá 5 MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }
    if (!d.get("file")?.size) d.delete("file");
    d.set("consent", "true");
    setBusy(true);
    setError("");
    try {
      const r = await api("/applications", { method: "POST", body: d });
      setSuccess(
        `Đã tiếp nhận đăng ký của bạn. Mã hồ sơ: ${r.id.slice(0, 8)}. An Ninh sẽ liên hệ khi có nhu cầu phù hợp.`,
      );
      form.reset();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form-panel quick-application">
      <h3>Thông tin ứng tuyển</h3>
      <p>Các trường có dấu * là bắt buộc.</p>
      {error && <Notice error>{error}</Notice>}
      {success ? (
        <>
          <Notice>{success}</Notice>
          <button onClick={() => setSuccess("")}>Gửi đăng ký khác</button>
        </>
      ) : (
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field
              label="Họ và tên"
              name="name"
              required
              autoComplete="name"
              maxLength={120}
            />
            <Field
              label="Số điện thoại"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              pattern="(\+84|0)[0-9 .\-]{8,13}"
            />
            <Field
              label="Email (nếu có)"
              name="email"
              type="email"
              autoComplete="email"
            />
            <Field
              label="Khu vực mong muốn làm việc"
              name="location"
              required
              placeholder="Ví dụ: Đà Nẵng, Tam Kỳ…"
            />
            <Field
              label="Thời gian / ca làm việc mong muốn"
              name="availability"
              wide
              placeholder="Ví dụ: ca ngày, có thể bắt đầu từ…"
            />
            <Field label="Giới thiệu & kinh nghiệm" required wide>
              <textarea
                name="intro"
                required
                rows={4}
                maxLength={10000}
                placeholder="Chia sẻ kinh nghiệm, kỹ năng hoặc ghi rõ nếu bạn chưa từng làm bảo vệ…"
              />
            </Field>
            <Field label="CV đính kèm (không bắt buộc)" wide>
              <input type="file" name="file" accept=".pdf,.doc,.docx" />
              <small>PDF, DOC, DOCX · tối đa 5 MB.</small>
            </Field>
          </div>
          <Consent />
          <button className="button" disabled={busy}>
            {busy ? "Đang gửi đăng ký…" : "Gửi đăng ký ứng tuyển"}
            <ArrowUpRight size={18} />
          </button>
        </form>
      )}
    </div>
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
          <Label>CÙNG BẠN GIỮ GÌN SỰ AN TOÀN</Label>
          <h2>Bắt đầu bằng một cuộc trao đổi.</h2>
          <p>Chia sẻ nhu cầu. Cùng tìm phương án bảo vệ phù hợp.</p>
        </div>
        <Button href="/lien-he">Kết nối với An Ninh</Button>
      </div>
    </section>
  );
}
function Footer({ site }) {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Brand site={site} />
          <p>{site.name}</p>
          <span className="footer-tagline">Nơi gửi trọn niềm tin.</span>
        </div>
        <div>
          <h4>Khám phá An Ninh</h4>
          <a href="/gioi-thieu">Về chúng tôi</a>
          <a href="/dich-vu">Giải pháp bảo vệ</a>
          <a href="/gioi-thieu#hinh-anh">Thư viện hình ảnh</a>
          <a href="/tin-tuc">Tin tức & hoạt động</a>
        </div>
        <div>
          <h4>Kết nối</h4>
          <a href="/lien-he">
            Liên hệ tư vấn <ArrowUpRight size={15} />
          </a>
          <a href="/tuyen-dung">
            Gia nhập An Ninh <ArrowUpRight size={15} />
          </a>
          {site.hotline || site.phone ? (
            <a href={`tel:${site.hotline || site.phone}`}>
              {site.hotline || site.phone}
            </a>
          ) : null}
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
          {site.address && <p>{site.address}</p>}
          {site.facebook && (
            <a href={site.facebook} target="_blank" rel="noreferrer">
              Facebook ↗
            </a>
          )}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} An Ninh · Thành lập {site.founded}
        </span>
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
      (!job || (r.job_id || "general") === job) &&
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
  let jobs = [
    ...new Map(rows.map((r) => [r.job_id || "general", r.job_title])).entries(),
  ];
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
                      availability: "Thời gian mong muốn",
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
