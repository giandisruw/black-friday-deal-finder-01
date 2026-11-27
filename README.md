# FridayFind — Real Black Friday Deals, Checked Today

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/giandisruw/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/giandisruw/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

FridayFind is a static Black Friday and Cyber Monday deal finder: 42 real deals,
each checked at its store on Black Friday, 27 Nov 2026, with the sale price, the
usual price, the discount, a link to the product at that store, when the price
was checked, and an honest signal for whether the deal is really a deal
(all-time low, strong price, solid cut, modest cut, or read the fine print).

Search, filter by category, store and discount, sort by discount, saving or
price, or show genuine lows only. Filter state lives in the URL, so any view
can be linked to. The site is plain static files under `app/` — no build step,
no network request, no key — and works on desktop and on a phone.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 (or `node serve.ts --port=9000` for another port).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`,
unchanged from the kit).

## How the deals were checked

Every deal was found and verified in the build session on 27 Nov 2026
(13:16–13:45 WIB) by reading the price at the named store or in a deals source
that names the store and the price. Each deal card names its source. Deals that
could not be verified were left out — no PS5 or Xbox console is discounted for
Black Friday 2026, and KitchenAid, Roomba and Meta Quest prices could not be
pinned to a store, so they are not listed.

---

Built for the make.fun Black Friday deal finder bounty. Referral code: 0txwmf1m
