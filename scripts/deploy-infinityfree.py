"""Upload the PHP build with explicit FTPS. Never delete uploaded CVs or site data."""
import base64
import ftplib
import json
import os
from pathlib import Path
import ssl
import sys
import time


def required(name):
    value = os.environ.get(name, "").strip()
    if not value:
        raise ValueError(f"Chưa cấu hình {name} trong GitHub Actions Secrets/Variables.")
    return value


def prepare_config(root):
    """Optional initial configuration: secrets stay in runner memory and a private PHP file."""
    names = ("INFINITYFREE_DB_HOST", "INFINITYFREE_DB_NAME", "INFINITYFREE_DB_USER", "INFINITYFREE_DB_PASSWORD", "INFINITYFREE_SETUP_KEY")
    present = [bool(os.environ.get(n)) for n in names]
    if not any(present):
        print("Giữ nguyên cấu hình MySQL trên hosting. Nếu cài lần đầu, điền _private/config.php theo hướng dẫn.")
        return
    if not all(present):
        raise ValueError("Cấu hình MySQL chưa đủ: cần DB_HOST, DB_NAME, DB_USER, DB_PASSWORD và SETUP_KEY.")
    site_url = required("INFINITYFREE_SITE_URL").rstrip("/")
    if not site_url.startswith("https://"):
        raise ValueError("INFINITYFREE_SITE_URL phải bắt đầu bằng https://.")
    setup_key = required("INFINITYFREE_SETUP_KEY")
    if len(setup_key) < 24:
        raise ValueError("INFINITYFREE_SETUP_KEY cần ít nhất 24 ký tự.")
    config = {"site_url": site_url, "db_host": required(names[0]), "db_name": required(names[1]), "db_user": required(names[2]), "db_password": os.environ[names[3]], "setup_key": setup_key}
    encoded = base64.b64encode(json.dumps(config, ensure_ascii=False).encode()).decode()
    path = root / "_private/config.php"
    path.write_text("<?php\n// Private hosting configuration. Do not share or commit.\nreturn json_decode(base64_decode('" + encoded + "'), true, 512, JSON_THROW_ON_ERROR);\n")
    path.chmod(0o600)


def upload(root, port=21):
    host = required("INFINITYFREE_FTP_HOST")
    user = required("INFINITYFREE_FTP_USER")
    password = os.environ.get("INFINITYFREE_FTP_PASSWORD", "")
    if not password:
        raise ValueError("Chưa cấu hình INFINITYFREE_FTP_PASSWORD.")
    remote = os.environ.get("INFINITYFREE_FTP_DIR", "/htdocs").strip() or "/htdocs"
    if not remote.startswith("/") or any(p == ".." for p in remote.split("/")) or "\n" in remote or "\r" in remote:
        raise ValueError("INFINITYFREE_FTP_DIR phải là đường dẫn tuyệt đối tới htdocs.")
    if remote == "/" or not remote.rstrip("/").endswith("/htdocs"):
        raise ValueError("Chỉ tải website vào thư mục htdocs.")
    files = sorted(p for p in root.rglob("*") if p.is_file())
    # Upload access restrictions before content. Publish the entry point last.
    files.sort(key=lambda p: (0 if p.name == ".htaccess" else 2 if p.relative_to(root).as_posix() == "index.php" else 1, p.as_posix()))
    context = ssl.create_default_context()
    # One connection, bounded retry per file, no plaintext fallback.
    with ftplib.FTP_TLS(context=context, timeout=45) as ftp:
        ftp.connect(host, port)
        ftp.login(user, password)
        ftp.prot_p()
        ftp.set_pasv(True)
        ftp.cwd(remote)
        base = ftp.pwd().rstrip("/")
        directories = {""}
        for path in files:
            rel = path.relative_to(root)
            parent = rel.parent.as_posix()
            if parent == ".":
                parent = ""
            if parent not in directories:
                current = ""
                for part in parent.split("/"):
                    current = (current + "/" + part).strip("/")
                    if current not in directories:
                        target = base + "/" + current
                        try:
                            ftp.mkd(target)
                        except ftplib.error_perm as exc:
                            # A permission failure is acceptable only if that directory already exists.
                            ftp.cwd(target)
                            ftp.cwd(base)
                        directories.add(current)
            target = base + "/" + rel.as_posix()
            for attempt in range(3):
                try:
                    with path.open("rb") as source:
                        ftp.storbinary("STOR " + target, source)
                    break
                except ftplib.error_temp:
                    if attempt == 2:
                        raise
                    time.sleep(1 + attempt)
            ftp.voidcmd("TYPE I")
            if ftp.size(target) != path.stat().st_size:
                raise RuntimeError("Hosting không giữ đủ tệp vừa tải lên: " + rel.as_posix())
        # Do not delete files: the PHP DirectoryIndex takes precedence over a welcome page.
    print(f"Đã tải và kiểm tra dung lượng {len(files)} tệp qua FTPS. Cần mở website để xác nhận DNS/HTTPS và cài Admin.")


if __name__ == "__main__":
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "hosting/infinityfree/build/htdocs").resolve()
    config_path = root / "_private/config.php"
    try:
        if not (root / "index.php").is_file():
            raise ValueError("Chạy node scripts/package-infinityfree.mjs trước khi triển khai.")
        prepare_config(root)
        upload(root)
    except Exception as exc:
        # FTP error details can contain hostnames but must never echo credentials or config.
        print("Tải lên chưa hoàn tất. " + (str(exc) if isinstance(exc, ValueError) else type(exc).__name__ + ": kiểm tra thông tin FTP, trạng thái hosting và thử lại."), file=sys.stderr)
        sys.exit(1)
    finally:
        if config_path.exists():
            config_path.unlink()
