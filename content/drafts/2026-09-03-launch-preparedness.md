---
title_en: Launch preparedness and timeline
description_en: Seven launches between 16 September and 8 October, what each still needs, and where the dates are at risk. Compiled from the repositories on 3 September 2026.
date: 2026-09-03
type: internal
slug: launch-preparedness
kicker: Internal
ribbon: 
verify: no
stats: 7|launches|16 Sep - 8 Oct; 13|days to the first|DecentralProp; 2 of 7|brands with a kit|five to build; 2|domains not resolving|.io apex, scan.com
---

## The honest read

Four dates, seven launches, thirty-five days. Compiled by reading the repositories rather than the plans, on 3 September 2026.

Two of the four dates are reachable. One is not reachable as scoped. One depends on a decision nobody has made yet.

**DecentralAmerica and Ancla are ready now** and could ship this week. Everything else has at least one blocker that is a person's decision, a legal review, or a key ceremony rather than an afternoon of code.

**DecentralProp on 16 September is the tightest.** Thirteen days, and the open list includes an unfixed on-chain overpay with a failing regression test, a token that has not been minted, a mainnet checkout never tested with real money, no support channel, and four legal documents drafted but never reviewed by a lawyer. Most of these are days of work. Several are calendar-bound and cannot be compressed by working harder.

**DecentralChain on 26 September has a problem the plans do not name.** The website has nowhere to go: `decentralchain.io` has no address record on its apex. The zone is live at SiteGround and `mainnet-node.decentralchain.io` resolves and serves, so the chain is up and only the front door is missing. That is an hour of DNS work. The harder items sit underneath it, and are described below.

**DecentralScan on 8 October is not currently a project.** The frontend has not been committed to in six months, the indexer is not in version control at all, and `decentralscan.com` is registered but points nowhere. Five weeks is enough time only if the work restarts immediately.

## The dates

| Launch | Date | Days | Readiness |
|---|---|---|---|
| DecentralProp + Trustless Funding | 16 Sep | 13 | At risk — 18 open blockers, several calendar-bound |
| DecentralChain + DecentralCoin | 26 Sep | 23 | At risk — no website DNS, two chain-forking config defects |
| DecentralAmerica.com + Ancla | 26 Sep | 23 | Ready — could ship this week |
| DecentralScan.com | 8 Oct | 35 | Not started — repo dormant six months |
| $DPROP airdrop | TBA | — | Accrual live, distribution not built |
| DecentralCoin airdrop | TBA | — | Scaffold only, gated on the sale |
| Decentral.Exchange + Swap | TBA | — | Live and serving, near-zero usage |

## DecentralProp and Trustless Funding — 16 September

The best-documented project of the seven. `master-docs/MASTER_LAUNCH_GATE.md` dispositions all 86 critical flows and `MASTER_LAUNCH_CHECKLIST.md` carries the punch list, so what follows is a summary of work already tracked, not new findings.

Eighteen launch blockers. The independent smart-contract audit was deferred post-launch by decision on 30 July, so it no longer gates the date. What remains splits three ways.

**Money-path defects, still open.** `draw_universal` does not cap the real transfer at the payout's outstanding balance. The overpay was reproduced twice on devnet, the regression test exists, and it correctly fails today. The fix is not written. Exposure is bounded because the instruction sits behind the trusted settlement authority and is Tier-4 only, but it is an unfixed overpay on an instruction that moves money.

A second item needs a live check rather than a fix: every devnet firm's bonding-curve account failed to deserialize as of 22 July, which would block every evaluation purchase on those firms. Nothing in the registers confirms anyone checked whether a later migration fixed it. Query production for that error before assuming it is resolved.

**A configuration that must be reverted.** The risk-engine relax time-lock is running at five minutes instead of the designed 24 and 48 hours. This is deliberate and was left in place on purpose to watch a glide path converge, but it is live in production and means a firm's rules, split, leverage and payout policy loosen the instant its score dips. It must go back before real money.

**Work that is not code.** The token has not been minted. No real operator firm is live on mainnet. Mainnet checkout has never been tested with a real wallet and real SOL. There is no customer support channel. Four legal documents — risk disclosure, token disclaimer, trader terms, incident response — are drafted and none has been through a lawyer. The emergency pause process has never been drilled.

Two items need a decision rather than an engineer. The anti-hedge defence was reverted in July on instruction, and its own record says not to ship to mainnet without the structural replacement, which is still deferred. A detection stack now catches the obvious version of the attack in production. Whether that is an acceptable substitute is a call somebody has to make and write down.

## DecentralChain and DecentralCoin — 26 September

The chain is live. Mainnet is at block 2.33 million, the node answers, and Ancla has been anchoring to it daily since 27 August. What is not ready is everything around it.

**The website has no address.** `decentralchain.io` resolves to nothing on its apex. Two separate repositories claim the site: `dcc-website-new`, last touched six months ago, and `DecentralAmerica/website`, a static rewrite touched fifteen hours ago. Pick one, point the DNS, ship it. This is the smallest item on this page and it blocks the date outright.

**Two configuration defects fork the chain.** `node/decentralchain-mainnet.conf` pre-activates the feature that sets a 1,000 DCC mining minimum. Mainnet has that feature in voting and enforces 10,000. An operator whose balance sits between those two figures forks. The same file sets an activation cadence that does not match what mainnet runs. The repository config is not the config mainnet runs, and any new validator onboarded from that file inherits the mismatch. Neither defect has an owner.

**Node operators earn nothing, and there is no rail to pay them.** Block rewards have never activated, so producers earn transaction fees on a chain with near-zero transactions. The node pays the block producer directly and pays lessors nothing. No code path moves DCC from a treasury to a validator for work done. A claim contract is the recommended fix and has a design, but it does not exist. Launching a validator programme without a payout rail is launching a promise.

**Supply concentration is a disclosure problem, not a bug.** 98.09% of supply sits in six project-controlled addresses, all traceable to the four genesis wallets. One address produces 100% of blocks across 900 sampled blocks, which means that one key can unilaterally activate any feature, including block rewards, which would break any fixed-supply commitment made publicly. The balances are verified on-chain and anyone can check them. Decide what the launch materials say about this before someone else does the arithmetic.

## DecentralAmerica.com and Ancla — 26 September

The one that is ready. Both are live now.

`decentralamerica.com` serves, has structured data on every route, three published articles and a fourth drafted. `decentralamerica.com/evidencia` serves the evidence layer from a second service in the same Railway project. Ancla holds 190 monthly Costa Rican archives and 37 Panamanian ones, with 420 fingerprints committed to DecentralChain across two canonicaliser versions. The daily job runs on schedule and anchors without a human.

Remaining work is measured in hours. Nav links to `/evidencia` are written and not pushed. The `ancla-bundle-2` line policy is tested and not deployed. The announcement is drafted and not published. The daily job does not republish the evidence site yet, so it needs `ANCLA_PUBLISH=1` set or the published copy goes stale the day the next rewrite lands.

One open question is larger than the launch. Whoever holds the key that signs the fingerprints is the credibility of the system, and today that key is ours. It belongs with an institution that has no stake in procurement outcomes.

## DecentralScan.com — 8 October

`dccscan_new_frontend` has not been committed to in six months. `dcc-indexer` is not a git repository at all, which means there is no history, no branch, and nothing to deploy from. `decentralscan.com` has been registered since 2021 and has no DNS records. `dccscan.io` returns a Cloudflare 530, meaning the origin is down.

Five weeks is enough for a scanner if work restarts now and the indexer is put under version control this week. It is not enough if the first commit lands in October. This is the date most likely to move, and the cheapest one to move.

## The two airdrops

Both are further from ready than the other work, and both are gated on things outside the code.

**$DPROP.** Points accrue now and are recorded against real-money actions. Nothing else exists: no mint, no snapshot, no Merkle tree, no claim contract, no vesting. Zero tokens have been minted. The allocation is proposed rather than fixed. The longest pole is the securities question on distributing a token, not the week of engineering to build the claim contract.

**DecentralCoin.** A scaffold with a written eligibility contract that has not been deployed. It is sequenced deliberately after the sale so recipients receive something with a known price behind it, which means the sale is its blocker. The sale program is not deployed either: its declared program id resolves on neither mainnet nor devnet, and the frontend still defaults to a local validator.

Neither airdrop has a date, which is the right answer for both. Do not attach one until the legal question is answered and the token exists.

## Decentral.Exchange and Swap

Live and serving at `decentral.exchange`. The AMM has seventeen lifetime swaps. There is nothing to launch here in the engineering sense; what is missing is a reason for anyone to use it, which is a liquidity and distribution problem rather than a build. Sequencing it after the chain and the sale is correct.

## What is missing across all seven

**Brand kits exist for two brands out of seven.** DecentralProp and DecentralChain each have one. DecentralAmerica has a single SVG mark and a design system in code, which is most of the way there but is not a kit anybody else can use. Ancla, DecentralScan, Decentral.Exchange and DecentralCoin have nothing. For an enterprise-grade launch each needs, at minimum: the mark in SVG and PNG at three sizes, a colour specification with contrast measurements, a type specification with the actual font files, social card templates, and one page saying what the brand may not be used for.

**Legal review has not happened anywhere.** DecentralProp has four drafted documents and no lawyer has read them. Nothing comparable exists for the chain, the sale, either airdrop, or the exchange. Two of the seven launches distribute a token to the public.

**Support does not exist for any of the seven.** No Discord, no email, no ticketing, nowhere for a user with a stuck transaction to go. This is a launch blocker on DecentralProp's own list and it applies equally to everything else on this page.

**Two domains do not resolve.** `decentralchain.io` on its apex and `decentralscan.com` entirely. Both are registered. Both block their launch.

**Incident response has never been drilled anywhere.** DecentralProp has a written plan and nobody has run it.

## Recommendation

Move DecentralScan from 8 October to a date set after the indexer is in version control and its first deploy is green. Nothing is gained by holding a date the work cannot reach, and the scanner is the only launch here with no external dependency forcing it.

Split DecentralChain's 26 September into two announcements. The website, the brand kit and the public materials can ship on the date. The validator programme cannot ship credibly until there is a payout rail and the two forking config defects have an owner. Announcing a chain is a different act from onboarding operators onto it, and conflating them is how the second one goes wrong in public.

Hold DecentralProp's 16 September only if the money-path defect is fixed, the time-lock is reverted, and the mainnet checkout has been walked end to end with real funds. Those three are non-negotiable and they are also achievable in thirteen days. The legal review and the support channel are the items most likely to slip, and both can be mitigated: a support email costs an hour, and shipping with drafted-but-unreviewed terms is a decision that can be made deliberately rather than by running out of time.

Ship DecentralAmerica and Ancla whenever convenient. It is done.
