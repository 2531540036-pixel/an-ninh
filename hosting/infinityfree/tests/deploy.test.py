"""Real local FTPS transfers. Dev-only requirements: pyftpdlib and pyopenssl."""
import importlib.util
import logging
import os
from pathlib import Path
import ssl
import subprocess
import tempfile
import threading
import unittest
from unittest.mock import patch

from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import TLS_FTPHandler
from pyftpdlib.servers import FTPServer

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("deploy", ROOT / "scripts/deploy-infinityfree.py")
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)
logging.getLogger("pyftpdlib").setLevel(logging.ERROR)


class TransferTest(unittest.TestCase):
    def test_encrypted_transfer_preserves_private_data_and_checks_certificate(self):
        with tempfile.TemporaryDirectory(prefix="anninh-ftps-") as tmp:
            root = Path(tmp)
            remote = root / "server"
            source = root / "build"
            (remote / "htdocs/_private/uploads").mkdir(parents=True)
            (remote / "htdocs/_private/uploads/keep.bin").write_bytes(b"private-existing-cv")
            (remote / "htdocs/_private/installed.lock").write_text("existing-installation")
            (source / "_private").mkdir(parents=True)
            (source / "assets").mkdir()
            (source / ".htaccess").write_text("DirectoryIndex index.php\n")
            (source / "_private/.htaccess").write_text("Deny from all\n")
            (source / "index.php").write_text("<?php echo 'fixture';\n")
            (source / "assets/app.js").write_bytes(b"console.log('fixture');\n" * 400)
            cert, key = root / "cert.pem", root / "key.pem"
            subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", str(key), "-out", str(cert), "-days", "1", "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost"], check=True, capture_output=True)
            authorizer = DummyAuthorizer()
            authorizer.add_user("fixture", "local-fixture-password", str(remote), perm="elradfmwMT")
            handler = type("LocalTLSHandler", (TLS_FTPHandler,), {"certfile":str(cert), "keyfile":str(key), "authorizer":authorizer, "tls_control_required":True, "tls_data_required":True})
            server = FTPServer(("127.0.0.1", 0), handler)
            thread = threading.Thread(target=server.serve_forever, kwargs={"timeout":0.05, "blocking":True, "handle_exit":False}, daemon=True)
            thread.start()
            port = server.socket.getsockname()[1]
            env = {"INFINITYFREE_FTP_HOST":"localhost", "INFINITYFREE_FTP_USER":"fixture", "INFINITYFREE_FTP_PASSWORD":"local-fixture-password", "INFINITYFREE_FTP_DIR":"/htdocs", "SSL_CERT_FILE":str(cert), "INFINITYFREE_SITE_URL":"https://localhost", "INFINITYFREE_DB_HOST":"mysql", "INFINITYFREE_DB_NAME":"fixture", "INFINITYFREE_DB_USER":"fixture", "INFINITYFREE_DB_PASSWORD":"db-fixture-password", "INFINITYFREE_SETUP_KEY":"local-fixture-setup-key-32-characters"}
            try:
                with patch.dict(os.environ, env, clear=True):
                    deploy.prepare_config(source)
                    deploy.upload(source, port)
                for file in source.rglob("*"):
                    if file.is_file():
                        self.assertEqual((remote / "htdocs" / file.relative_to(source)).read_bytes(), file.read_bytes())
                self.assertEqual((remote / "htdocs/_private/uploads/keep.bin").read_bytes(),b"private-existing-cv")
                self.assertEqual((remote / "htdocs/_private/installed.lock").read_text(),"existing-installation")
                with patch.dict(os.environ, {**env, "SSL_CERT_FILE":"/nonexistent-ca.pem"}, clear=True):
                    with self.assertRaises(ssl.SSLCertVerificationError):
                        deploy.upload(source, port)
            finally:
                server.close_all()
                thread.join(timeout=2)

    def test_incomplete_configuration_stops_before_upload(self):
        with tempfile.TemporaryDirectory(prefix="anninh-config-") as tmp:
            with patch.dict(os.environ, {"INFINITYFREE_DB_HOST":"mysql"}, clear=True):
                with self.assertRaises(ValueError):
                    deploy.prepare_config(Path(tmp))


if __name__ == "__main__":
    unittest.main()
