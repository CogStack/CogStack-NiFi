#!/usr/bin/env python3
"""Exercise host installation with fake commands and isolated system files."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

INSTALLER_DIR = Path(__file__).resolve().parents[1] / "installation_utils"

FAKE_COMMAND = r'''
import json
import os
import sys
from pathlib import Path

name = Path(sys.argv[0]).name
args = sys.argv[1:]
with open(os.environ["INSTALLER_TEST_LOG"], "a") as log:
    log.write(json.dumps([name, *args]) + "\n")

failure = os.environ.get("INSTALLER_TEST_FAIL")
if failure and failure in " ".join([name, *args]):
    sys.exit(42)

if name == "sudo":
    if args[:1] == ["tee"]:
        path = Path(args[1])
        assert path.is_relative_to(os.environ["INSTALLER_TEST_ROOT"]), path
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = sys.stdin.read()
        path.write_text(payload)
        sys.stdout.write(payload)
    elif args[:1] == ["gpg"] or args[:1] == ["bash"]:
        # Never execute a privileged command, downloaded script, or real write.
        sys.stdin.read()
elif name == "curl":
    if "-o" in args:
        Path(args[args.index("-o") + 1]).write_text("# fake Helm installer\n")
    else:
        print("fake signing key or Azure installer")
elif name == "id":
    print("1000" if args == ["-u"] else "installer")
elif name == "dpkg":
    print("arm64")
elif name == "pip3":
    print("pip install help" if os.environ.get("INSTALLER_TEST_LEGACY_PIP") else "--break-system-packages")
elif name in ("kubectl", "helm", "k3s"):
    print("fake client version")
else:
    sys.exit("Unexpected command: " + name)
'''


class HostInstallerTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.etc = self.root / "etc"
        self.etc.mkdir()
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.log = self.root / "commands.jsonl"
        self.installer = self.root / "scripts" / "install_docker_and_utils.sh"
        self.installer.parent.mkdir()
        for name in ("install_docker_and_utils.sh", "detect_os.sh"):
            # Only redirect system paths; execute the checked-in shell logic.
            source = (INSTALLER_DIR / name).read_text().replace("/etc/", f"{self.etc}/")
            (self.installer.parent / name).write_text(source)
        for name in ("sudo", "curl", "id", "dpkg", "pip3", "kubectl", "helm", "k3s"):
            command = self.bin / name
            command.write_text(f"#!{sys.executable}\n{FAKE_COMMAND}")
            command.chmod(0o755)
        self.env = {
            **os.environ,
            "PATH": f"{self.bin}{os.pathsep}{os.environ['PATH']}",
            "TMPDIR": f"{self.root}/",
            "SUDO_USER": "installer",
            "INSTALLER_TEST_LOG": str(self.log),
            "INSTALLER_TEST_ROOT": str(self.root),
            "INSTALLER_TEST_FAIL": "",
            "INSTALLER_TEST_LEGACY_PIP": "",
            "INSTALL_KUBERNETES": "true",
            "INSTALL_K3S": "",
            "KUBERNETES_MINOR_VERSION": "v1.37",
            "HELM_VERSION": "v4.3.1",
            "K3S_VERSION": "v1.37.2+k3s1",
        }

    def run_installer(self, distribution: str = "ubuntu", **overrides: str) -> subprocess.CompletedProcess[str]:
        (self.etc / "os-release").write_text(f"ID={distribution}\nVERSION_CODENAME=noble\n")
        # Ubuntu commonly has more than one release file. Detection must emit one ID.
        (self.etc / "lsb-release").write_text("DISTRIB_ID=Ubuntu\n")
        self.log.write_text("")
        return subprocess.run(
            ["bash", str(self.installer)], cwd=self.root, env={**self.env, **overrides},
            text=True, capture_output=True, timeout=30,
        )

    def commands(self) -> list[list[str]]:
        return [json.loads(line) for line in self.log.read_text().splitlines()]

    def test_debian_and_ubuntu_install_and_hold_kubernetes_packages(self) -> None:
        for distribution in ("debian", "ubuntu"):
            with self.subTest(distribution=distribution):
                result = self.run_installer(distribution)
                self.assertEqual(result.returncode, 0, result.stderr)
                commands = self.commands()
                self.assertIn(
                    ["sudo", "apt-get", "install", "-y", "kubelet", "kubeadm", "kubectl"], commands,
                )
                self.assertIn(["sudo", "apt-mark", "hold", "kubelet", "kubeadm", "kubectl"], commands)
                self.assertIn(["sudo", "systemctl", "enable", "kubelet.service"], commands)
                docker = (self.etc / "apt/sources.list.d/docker.list").read_text()
                self.assertIn(f"https://download.docker.com/linux/{distribution}", docker)
                self.assertIn("arch=arm64", docker)
                kubernetes = (self.etc / "apt/sources.list.d/kubernetes.list").read_text()
                self.assertIn("https://pkgs.k8s.io/core:/stable:/v1.37/deb/", kubernetes)

    def test_rhel_and_centos_exclude_kubernetes_from_normal_upgrades(self) -> None:
        for distribution in ("rhel", "centos"):
            with self.subTest(distribution=distribution):
                result = self.run_installer(distribution)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn(
                    ["sudo", "yum", "install", "-y", "kubelet", "kubeadm", "kubectl",
                     "--disableexcludes=kubernetes"],
                    self.commands(),
                )
                repository = (self.etc / "yum.repos.d/kubernetes.repo").read_text()
                self.assertIn("baseurl=https://pkgs.k8s.io/core:/stable:/v1.37/rpm/", repository)
                self.assertIn("gpgcheck=1", repository)
                self.assertIn("exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni", repository)

    def test_version_overrides_are_used_for_all_tools(self) -> None:
        result = self.run_installer(
            KUBERNETES_MINOR_VERSION="v1.36", HELM_VERSION="v4.2.0", K3S_VERSION="v1.37.1+k3s1",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        commands = self.commands()
        self.assertIn(["curl", "-fsSL", "https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key"], commands)
        helm_install = next(
            command for command in commands if command[:2] == ["sudo", "bash"] and len(command) > 2
        )
        self.assertEqual(helm_install[-2:], ["--version", "v4.2.0"])
        self.assertFalse(Path(helm_install[2]).exists(), "Helm installer should be cleaned up")
        k3s_install = next(command for command in commands if command[:2] == ["sudo", "env"])
        self.assertIn("INSTALL_K3S_VERSION=v1.37.1+k3s1", k3s_install)

    def test_k3s_installs_with_kubeadm_without_starting_or_replacing_commands(self) -> None:
        result = self.run_installer(INSTALL_K3S="true")
        self.assertEqual(result.returncode, 0, result.stderr)
        commands = self.commands()
        self.assertIn(["sudo", "apt-get", "install", "-y", "kubelet", "kubeadm", "kubectl"], commands)
        k3s_install = next(command for command in commands if command[:2] == ["sudo", "env"])
        self.assertIn("INSTALL_K3S_VERSION=v1.37.2+k3s1", k3s_install)
        self.assertIn("INSTALL_K3S_SKIP_ENABLE=true", k3s_install)
        self.assertIn("INSTALL_K3S_SKIP_START=true", k3s_install)
        self.assertIn("INSTALL_K3S_SYMLINK=skip", k3s_install)
        self.assertEqual(k3s_install[-3], "sh")
        self.assertEqual(k3s_install[-1], "server")
        self.assertFalse(Path(k3s_install[-2]).parent.exists(), "Installer directory should be cleaned up")
        self.assertIn(["k3s", "--version"], commands)
        self.assertFalse(any(command[:2] == ["sudo", "systemctl"] and "k3s.service" in command for command in commands))

    def test_k3s_can_be_skipped_while_installing_kubeadm(self) -> None:
        # A disabled component's version is irrelevant and must not block setup.
        result = self.run_installer(INSTALL_K3S="false", K3S_VERSION="unused")
        self.assertEqual(result.returncode, 0, result.stderr)
        commands = self.commands()
        self.assertIn(["sudo", "apt-get", "install", "-y", "kubelet", "kubeadm", "kubectl"], commands)
        self.assertFalse(any("https://get.k3s.io" in command or command[0] == "k3s" for command in commands))

    def test_k3s_can_be_installed_without_kubeadm(self) -> None:
        result = self.run_installer(INSTALL_KUBERNETES="false", INSTALL_K3S="true")
        self.assertEqual(result.returncode, 0, result.stderr)
        commands = self.commands()
        self.assertIn(["k3s", "--version"], commands)
        self.assertFalse(any("kubeadm" in command or command[0] == "helm" for command in commands))

    def test_docker_only_option_skips_kubernetes_and_helm(self) -> None:
        result = self.run_installer(INSTALL_KUBERNETES="false")
        self.assertEqual(result.returncode, 0, result.stderr)
        commands = self.commands()
        self.assertTrue(any("docker-ce" in command for command in commands))
        self.assertFalse(any(
            any("kube" in arg or "helm" in arg or "k3s" in arg for arg in command) for command in commands
        ))

    def test_python_utilities_support_old_and_new_pip_without_replacing_system_pip(self) -> None:
        for legacy in ("", "1"):
            with self.subTest(legacy=legacy):
                result = self.run_installer(INSTALL_KUBERNETES="false", INSTALLER_TEST_LEGACY_PIP=legacy)
                self.assertEqual(result.returncode, 0, result.stderr)
                install = next(command for command in self.commands() if command[:3] == ["sudo", "-H", "pip3"])
                expected = ["sudo", "-H", "pip3", "install", "html2text", "jsoncsv", "detect"]
                if not legacy:
                    expected.append("--break-system-packages")
                self.assertEqual(install, expected)

    def test_invalid_options_fail_before_system_commands(self) -> None:
        for key, value in (
            ("INSTALL_KUBERNETES", "yes"), ("KUBERNETES_MINOR_VERSION", "1.37.0"), ("HELM_VERSION", "latest"),
            ("INSTALL_K3S", "yes"), ("K3S_VERSION", "latest"),
        ):
            with self.subTest(key=key):
                result = self.run_installer(**{key: value})
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(key, result.stderr)
                self.assertEqual(self.commands(), [])

    def test_signing_key_download_failure_stops_installation(self) -> None:
        result = self.run_installer(INSTALLER_TEST_FAIL="/deb/Release.key")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Finished installing", result.stdout)
        self.assertFalse(any("kubelet" in command for command in self.commands()))

    def test_package_install_failure_stops_before_helm(self) -> None:
        result = self.run_installer(INSTALLER_TEST_FAIL="apt-get install -y kubelet")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Finished installing", result.stdout)
        self.assertFalse(any("helm" in arg for command in self.commands() for arg in command))

    def test_helm_download_failure_cleans_up_installer(self) -> None:
        result = self.run_installer(INSTALLER_TEST_FAIL="/scripts/get-helm-4")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Finished installing", result.stdout)
        helm_download = next(
            command for command in self.commands()
            if command[0] == "curl" and any("get-helm-4" in arg for arg in command)
        )
        self.assertFalse(Path(helm_download[-1]).exists(), "Helm installer should be cleaned up on failure")

    def test_k3s_download_failure_stops_and_cleans_up(self) -> None:
        result = self.run_installer(INSTALLER_TEST_FAIL="https://get.k3s.io")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Finished installing", result.stdout)
        download = next(command for command in self.commands() if "https://get.k3s.io" in command)
        self.assertFalse(Path(download[-1]).parent.exists(), "Installer directory should be cleaned up on failure")
        self.assertNotIn(["k3s", "--version"], self.commands())

    def test_k3s_installer_failure_stops_and_cleans_up(self) -> None:
        result = self.run_installer(INSTALLER_TEST_FAIL="INSTALL_K3S_SKIP_ENABLE=true")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Finished installing", result.stdout)
        install = next(command for command in self.commands() if command[:2] == ["sudo", "env"])
        self.assertFalse(Path(install[-2]).parent.exists(), "Installer directory should be cleaned up on failure")
        self.assertNotIn(["k3s", "--version"], self.commands())

    def test_installer_does_not_initialize_a_cluster(self) -> None:
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(any(command[:2] == ["sudo", "kubeadm"] for command in self.commands()))
        self.assertIn("before kubeadm init/join", result.stdout)

    def test_unsupported_distribution_fails(self) -> None:
        result = self.run_installer("fedora")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unsupported distribution", result.stderr)
        self.assertFalse(any("install" in command for command in self.commands()))


if __name__ == "__main__":
    unittest.main()
