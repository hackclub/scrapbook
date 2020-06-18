# [Summer Scrapbook](https://scrapbook.hackclub.com/)

**Share updates of your learning every day**: Every day this summer, [Hack Clubbers](https://hackclub.com/) are learning & building projects, sharing short video & photo updates each day.

We at Hack Club HQ made this because the times of ouur lives when we’ve really improved our skills came from **showing up every day**. Even if we didn’t make something amazing every day, the consistency was key. Scrapbook is a tool to help us all do that while stuck at home this summer.

This repo is the website for [Hack Club](https://hackclub.com/)’s [Summer Scrapbook](https://scrapbook.hackclub.com/), which is part of the [2020 Summer of Making](https://summer.hackclub.com/).

## How do I join?

[Join the Hack Club Slack to participate.](https://hack.af/som-slack/)

## How does it work?

Behind the scenes, the site runs on [Next.js](https://nextjs.org), React.js, & [SWR](https://swr.now.sh) for data fetching. All pages are [static-rendered](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation), hosted on [Vercel](https://vercel.com). Videos are hosted by [Mux](https://mux.com). The custom domains use a [Vercel serverless function](https://github.com/hackclub/summer-domains). The [Slack integration](https://github.com/hackclub/scrappy) runs on [Express.js](https://expressjs.com), hosted on [Heroku](https://heroku.com). All the data is stored in [Airtable](https://airtable.com), fetched using our service [airbridge](https://github.com/hackclub/api2). We built it in a week.

## CSS customization

To customize the CSS on your profile page, run `/scrappy setcss <link>` in Slack, giving a link to a CSS file or a [GitHub Gist](https://gist.github.com). [Here’s the default CSS](https://scrapbook.hackclub.com/themes/default.css), for your overwriting pleasure.

### Colors & fonts

If you’d like to change the page-wide fonts or colors, you can change yours with [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). Here’s the values the site uses by default:

```css
:root {
  --colors-pink: #ff62dc;
  --colors-orange: #ff5b00;
  --colors-yellow: #f7ff00;
  --colors-green: #28ff00;
  --colors-cyan: #00ffff;
  --colors-blue: #00a4ff;
  --colors-purple: #c210ff;

  --colors-darker: #151613;
  --colors-dark: #20201d;
  --colors-darkless: #2b2b27;
  --colors-black: #1d201d;
  --colors-slate: #3b413a;
  --colors-muted: #777f76;
  --colors-smoke: #d5d8d5;
  --colors-snow: #f5f5f4;
  --colors-white: #ffffff;

  --fonts-body: 'Baloo 2', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  --fonts-display: 'Shrikhand', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  --fonts-mono: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace;
}
```

Some “relative” colors use these colors for various components:

- `--colors-background` – page background color
- `--colors-text` – page text color
- `--colors-elevated` – “elevated” content, like the posts
- `--colors-sunken` – “sunken” content

Our dark mode is powered by [`prefers-color-scheme: dark`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).

## Custom domains

To put your profile on your own domain, run `/scrappy setdomain <domain>` in Slack, giving your website’s hostname (e.g. [`scrapbook.zachlatta.com`](https://scrapbook.zachlatta.com)). Then, add a `CNAME` record on your DNS provider, pointed to `cname.vercel-dns.com`. If you’re curious how this works, it’s [open source right here](http://github.com/hackclub/summer-domains).

<small>
  (Unfortunately, if your DNS is managed by Vercel, you’re not able to use this
  feature.)
</small>

## Public API

The backend is powered by Airtable served over [Airbridge](https://github.com/hackclub/api2), but the site exposes a public JSON API powered by [Next.js API routes](https://nextjs.org/docs/api-routes/introduction) that reformats data in a more useful way. The live site runs entirely on this API.

- [`/api/posts`](https://scrapbook.hackclub.com/api/posts) – Get all posts (used on the homepage)
- [`/api/users`](https://scrapbook.hackclub.com/api/users) – Get all users
- [`/api/users/:username`](https://scrapbook.hackclub.com/api/users/zrl) – Get a specific user’s profile + posts

---

By [@lachlanjc](https://lachlanjc.com) for Hack Club, 2020. MIT License.
