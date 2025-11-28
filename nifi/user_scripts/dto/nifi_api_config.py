import os
from pathlib import Path

CERTS_ROOT = Path(__file__).resolve().parents[3] / "security" / "certificates"


class NiFiAPIConfig:

    def __init__(self):
        self.nifi_url_scheme = "https"
        self.nifi_host = "localhost"
        self.nifi_port = 8443
        self.nifi_registry_port = 18443
        self.nifi_username = os.environ.get("NIFI_SINGLE_USER_CREDENTIALS_USERNAME", "admin")
        self.nifi_password = os.environ.get("NIFI_SINGLE_USER_CREDENTIALS_PASSWORD", "cogstackNiFi")
        self.root_cert_ca_path = (CERTS_ROOT / "root" / "root-ca.pem").as_posix()
        self.nifi_cert_pem_path = (CERTS_ROOT / "nifi" / "nifi.pem").as_posix()
        self.nifi_cert_key_path = (CERTS_ROOT / "nifi" / "nifi.key").as_posix()
        self.verify_ssl = True

    @property
    def nifi_base_url(self) -> str:
        """Full NiFi base URL, e.g. https://localhost:8443"""
        return f"{self.nifi_url_scheme}://{self.nifi_host}:{self.nifi_port}"

    @property
    def nifi_api_url(self) -> str:
        """NiFi REST API root, e.g. https://localhost:8443/nifi-api"""
        return f"{self.nifi_base_url}/nifi-api"

    @property
    def nifi_registry_base_url(self) -> str:
        """NiFi Registry REST API root, e.g. https://localhost:18443/nifi-registry/"""
        return f"{self.nifi_url_scheme}://{self.nifi_host}:{self.nifi_registry_port}/nifi-registry/"

    @property
    def nifi_registry_api_url(self) -> str:
        """nifi registry rest api root, e.g. https://localhost:18443/nifi-registry/nifi-registry-api"""
        return f"{self.nifi_url_scheme}://{self.nifi_host}:{self.nifi_registry_port}/nifi-registry-api/"

    def auth_credentials(self) -> tuple[str, str]:
        """convenience for requests auth=(user, password)."""
        return (self.nifi_username, self.nifi_password)

    def get_nifi_ssl_certs_paths(self) -> tuple[str, str]:
        """convenience for requests cert=(cert_path, key_path)."""
        return (self.nifi_cert_pem_path, self.nifi_cert_key_path)
