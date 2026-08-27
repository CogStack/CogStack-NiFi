# Development environment defaults

The `.env` files in this directory are version-controlled inputs for the
standalone Docker Compose stack and the legacy charts. Their values are public
development defaults, not secrets.

Never store production credentials in these files. Production deployments
must inject credentials through an external secret store or deployment-local
configuration that is not committed to Git.

Moving these files to ignored, locally generated `.env` files requires a
coordinated change to Compose, the chart file symlinks, CI, and developer setup.
That migration should be completed separately rather than leaving fresh
checkouts unable to start.
