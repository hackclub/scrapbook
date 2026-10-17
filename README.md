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
