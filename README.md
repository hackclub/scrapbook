# Scrapbook

Scrapbook helps you **share the things you're working on every day!** As a [Hack Clubber](https://hackclub.com/), you are always learning and building things. Scrapbook allows you to share updates on the things you're doing with the rest of the Hack Club community, and keeps you motivated by recording each day you contribute, tallying that up onto a streak shown on your profile.

## Development

Install [Bun 1](https://bun.com/), then:

```sh
git clone https://github.com/hackclub/scrapbook.git
cd scrapbook
bun install --frozen-lockfile
bun run generate
bun run dev
```

Put the web environment in `apps/web/.env` and the bot environment in
`apps/slack-bot/.env`. Open <http://localhost:3000> for the website.

```sh
bun run dev:slack-bot     # Bot with Bun's watcher
bun run build            # Generate Prisma client and build the website
bun test                 # Offline bot runtime smoke tests
bun run start            # Serve the built website
bun run start:slack-bot   # Run the bot
bun run --cwd apps/slack-bot checkFormat
bun run --cwd apps/slack-bot format
```

The repository is a Bun workspace with one root `bun.lock`. Run installs at the
repository root and commit the lockfile when updating dependencies. Scripts
explicitly use Bun for Next.js and Prisma so their Node shebangs do not select a
separate Node runtime.

## Code checks

Oxlint and Oxfmt are installed at the workspace root. ESLint and Prettier are
replaced by these scripts:

```sh
bun run lint          # Check JavaScript/TypeScript correctness and unused code
bun run lint:fix      # Apply safe lint fixes
bun run format        # Format source, manifests, configs, and workflow files
bun run format:check  # Check formatting without writing
bun run check         # Lint, format check, and offline tests
```

Oxfmt retains the web app's single quotes / no semicolons and the bot's double
quotes / semicolons. The formatter covers source, JSON, YAML, and workflow
files. Documentation, CSS, Prisma schemas/migrations, the bot transcript, and
generated build files are
excluded in `.oxfmtrc.json`.

Oxlint enables correctness rules plus React and Next.js checks. Native image
markup remains allowed for external/user content, and React Compiler purity and
synchronous-effect restrictions are not enabled for this existing Pages Router
app. Exceptions for trusted transcript templates, the public widget API, manual
migration helpers, and the feed's initial cursor effect are documented inline.

[GitHub Actions](.github/workflows/ci.yml) runs independent **Lint**, **Format**,
**Tests**, **Build (web)**, and **Build (slack-bot)** jobs on pushes and pull
requests. The build jobs use the actual deployment Dockerfiles and a synthetic
BuildKit `APP_URL`; they do not push images or deploy. Coolify continues to own
deployments through `compose.yml`.

## Coolify / Docker Compose

Use the repository's `compose.yml` with the repository root as the build context.
Both Dockerfiles build with `dhi.io/bun:1-dev` and run with the
nonroot, shell-free `dhi.io/bun:1` image. If DHI pulls require
credentials, configure `dhi.io` registry credentials on the Coolify build server.

Supply the existing `scrappy.env` on the deployment server and set
`PG_DATABASE_URL`, `GRAPHITE_HOST`, and `APP_URL` in Coolify as before. `APP_URL`
is also needed at build time because Next.js embeds the avatar rewrites. In
Coolify, enable its build-time scope and use **Docker BuildKit secrets**. The
Dockerfile reads secret ID `APP_URL`; the Compose build argument remains a
fallback for local builds. Use the hostname without a scheme, matching the
existing configuration.
Database credentials are runtime-only. Existing port mappings remain web
`3002:3000` and bot `3001:3001`.

```sh
docker compose build
```

Prisma generation runs during image builds; database migrations remain an
explicit operation against the intended database. The image build does not
apply migrations. See [dependency upgrade notes](docs/dependency-upgrade.md)
for the release review and compatibility changes.
