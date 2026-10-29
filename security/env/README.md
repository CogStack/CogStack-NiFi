# Development environment defaults

The `.env` files in this directory are version-controlled inputs for the
standalone Docker Compose stack and the owned Helm charts. Their values are public
development defaults, not secrets.

Never store production credentials in these files. Production deployments
must inject credentials through an external secret store or deployment-local
configuration that is not committed to Git.

The repository explicitly allows these public defaults in `.gitignore`.
New default files must also be added to that allowlist. OpenSSL templates under
`security/templates/` are tracked source files; generated certificates and keys
remain ignored.

Put local overrides under `deploy/local/security/` or outside the repository,
then select their parent directory with `COGSTACK_CONFIG_DIR`. See
[deployment configuration](../../docs/deploy/configuration.md#deployment-specific-overrides).
