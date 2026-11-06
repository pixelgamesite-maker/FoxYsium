# Art assets

Drop collection art here. The site picks these up by filename:

| File | Used for |
| --- | --- |
| `fox-hero.png` | Hero carousel + Genesis page. Transparent PNG works best (currently a cut-out of the reference art). |
| `foxes/1.png` … `foxes/2626.png` | Individual Fox art, shown on `/fox/:id`, the gallery and the Console. Missing files fall back to a silhouette. |
| `favicon.svg` | Browser tab icon / logo mark. |

Once metadata is on IPFS/Arweave, set `ART_BASE_URL` in `src/lib/foxysium-constants.ts`
to the image base URL instead of hosting 2,626 files here.
