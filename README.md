# [Summer Scrapbook](https://scrapbook.hackclub.com/)

This repo is the website for [Hack Club](https://hackclub.com/)’s [Summer Scrapbook](https://scrapbook.hackclub.com/), which is part of the [2020 Summer of Making](https://summer.hackclub.com/).

[About this project](https://scrapbook.hackclub.com/about/)

## Public API

The backend is powered by Airtable served over [api2](https://github.com/hackclub/api2), but the site exposes a public JSON API that reformats data in a more useful way. The live site runs entirely on this API.

- [`/api/posts`](https://scrapbook.hackclub.com/api/posts) – Get all posts (used on the homepage)
- [`/api/users`](https://scrapbook.hackclub.com/api/users) – Get all users
- [`/api/users/:username`](https://scrapbook.hackclub.com/api/users/zrl) – Get a specific user’s profile + posts

The other [API routes](https://nextjs.org/docs/api-routes/introduction) power the Slack slash commands & [Mux](https://mux.com) video integration.

---

By [@lachlanjc](https://lachlanjc.com) & [@MatthewStanciu](https://matthewstanciu.me) for Hack Club, 2020. MIT License.
