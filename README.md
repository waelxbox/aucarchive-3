# AUC Archive Chatbot (Next.js)

Search and explore AUC Digital Collections via the CONTENTdm **dmwebservices** API.

## Quick start (local)
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel
1. Create a new Vercel project and import this repo.
2. Framework preset: **Next.js** (no extra settings needed)
3. Deploy. (All API calls are server-side via Next API routes, so no CORS issues.)

## What it uses
- `dmGetCollectionList` to populate the collection picker
- `dmGetCollectionFieldInfo` (available via `/api/fields?alias=…` if you want to use it)
- `dmQuery` to search across a few common fields (`title`, `subjec`, `descri`)
- `dmGetItemInfo`, `dmGetItemUrl`, and `dmGetCompoundObjectInfo` (details panel)

## Notes
- AUC CONTENTdm is hosted under HTTPS, which the API requires.
- If you need thumbnails: you can derive IIIF or use CONTENTdm Website API endpoints; for v0 we just link to the item's page via `dmGetItemUrl`.

## Customize fields per collection
Update `DEFAULT_FIELDS` in `app/api/search/route.ts` or fetch nicknames dynamically from `/api/fields?alias=...` and construct clauses at runtime.

## License
MIT
