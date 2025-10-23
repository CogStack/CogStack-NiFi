import os


class NiFiAPIConfig:
    NIFI_URL_SCHEME: str = "https"
    NIFI_HOST: str = "localhost"
    NIFI_PORT: int = 8443
    NIFI_REGISTRY_PORT: int = 18443

    NIFI_USERNAME: str = os.environ.get("NIFI_SINGLE_USER_CREDENTIALS_USERNAME", "admin")
    NIFI_PASSWORD: str = os.environ.get("NIFI_SINGLE_USER_CREDENTIALS_PASSWORD", "cogstackNiFi")

    ROOT_CERT_CA_PATH: str = os.path.abspath("../../../../security/certificates/root/root-ca.pem")
    NIFI_CERT_PEM_PATH: str = os.path.abspath("../../../../security/certificates/nifi/nifi.pem")
    NIFI_CERT_KEY_PATH: str = os.path.abspath("../../../../security/certificates/nifi/nifi.key")

    VERIFY_SSL: bool = True

    @property
    def nifi_base_url(self) -> str:
        """Full NiFi base URL, e.g. https://localhost:8443"""
        return f"{self.NIFI_URL_SCHEME}://{self.NIFI_HOST}:{self.NIFI_PORT}"

    @property
    def nifi_api_url(self) -> str:
        """"NiFi REST API root, e.g. https://localhost:8443/nifi-api"""
        return f"{self.nifi_base_url}/nifi-api"
    
    @property
    def nifi_registry_base_url(self) -> str:
        """"NiFi Registry REST API root, e.g. https://localhost:18443/nifi-registry"""
        return f"{self.NIFI_URL_SCHEME}://{self.NIFI_HOST}:{self.NIFI_REGISTRY_PORT}/nifi-registry/"

    @property
    def nifi_registry_api_url(self) -> str:
        """"NiFi Registry REST API root, e.g. https://localhost:18443/nifi-registry/nifi-registry-api"""
        return f"{self.NIFI_URL_SCHEME}://{self.NIFI_HOST}:{self.NIFI_REGISTRY_PORT}/nifi-registry-api"

    def auth_credentials(self) -> tuple[str, str]:
        """Convenience for requests auth=(user, password)."""
        return (self.NIFI_USERNAME, self.NIFI_PASSWORD)

    def get_nifi_ssl_certs(self) -> tuple[str, str]:
        """Convenience for requests cert=(cert_path, key_path)."""
        return (self.NIFI_CERT_PEM_PATH, self.NIFI_CERT_KEY_PATH)
