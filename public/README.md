# Art assets

Drop collection art here. The site picks these up by filename:

| File | Used for |
| --- | --- |
| `1.png` … `6.png` | Source artwork. Web sizes live in `art/` (regenerate if you replace these). |
| `art/fox-N.webp`, `art/fox-N-sm.webp` | Hero slides, Genesis previews, Foundry and 404 panels. |
| `art/og.jpg` | Social share card. |
| `foxes/1.png` … `foxes/2626.png` | Individual Fox art, shown on `/fox/:id`, the gallery and the Console. Missing files fall back to a silhouette. |
| `favicon.svg` | Browser tab icon / logo mark. |

Once metadata is on IPFS/Arweave, set `ART_BASE_URL` in `src/lib/foxbank-constants.ts`
to the image base URL instead of hosting 2,626 files here.
| `tokens/fox.png`, `usdc.png` | Token logos, 512×512 PNG (use these for DEX listings and wallets). `-128` versions are what the site displays. Add `eth.png` + `eth-128.png` to replace the ETH text badge. |
