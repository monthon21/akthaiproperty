# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

AK Thai Property: a real estate site for buying, selling and renting property in Thailand, with home-loan services. It runs in three languages: Thai (the default), English and Chinese. It is built on Next.js 16 (App Router), React 19, Tailwind v4, Prisma 6 on MySQL, and NextAuth v5 (beta).

## Commands

```bash
npm install          # .npmrc sets legacy-peer-deps; postinstall runs `prisma generate`
npm run dev          # dev server on :3000
npm run build        # production build (also the main type check)
npm run lint         # eslint (flat config, eslint-config-next)
npx prisma generate  # after editing prisma/schema.prisma
npx prisma db push   # sync schema to DB — there is no prisma/migrations folder
```

There is no test framework. The `scratch/*.js` files are one-off Node scripts that use `PrismaClient` directly against the DB, for example `node scratch/check.js`. Treat them as debugging aids, not tests. The root `rename_*.js`, `replace_*.js` and `refactor.js` files are old codemod scripts.

## Architecture

**Routing and i18n**
- Every public page is under `app/[lang]/`, where `lang` is `th`, `en` or `zh`.
- [proxy.ts](proxy.ts) is the Next 16 replacement for `middleware.ts`. It redirects paths without a locale to `/{NEXT_LOCALE cookie || th}/…`.
- It also gates `/{lang}/myprofile` with a check of the NextAuth JWT.
- UI strings live in `lib/i18n/{th,en,zh}.json` and are loaded with `getDictionary(lang)` from [lib/i18n/dictionaries.ts](lib/i18n/dictionaries.ts). Add each new key to all three files.
- Some features keep their strings inline instead, for example `LOCATION_TEXT` in [lib/locations.ts](lib/locations.ts).
- Database content is multilingual through columns, not dictionaries: `title`/`titleEn`/`titleZh` and `description`/`descriptionEn`/`descriptionZh` on `Asset`.

**Data flow**
- Mutations and most reads go through Server Actions in `lib/actions/*.ts` (`"use server"`). These call the singleton `prisma` from [lib/prisma.ts](lib/prisma.ts) and then `revalidatePath`.
- Pages are mostly server components that call these actions and pass data to `components/*Client.tsx` client components, for example `ManageAssetsClient` and `EditAssetClient`.
- Admin-only actions check `(session?.user as any)?.role === "ADMIN"` using `auth()` from [auth.ts](auth.ts).
- `lib/properties.ts` defines the front-end `Property` view-model, which is mapped from Prisma `Asset` rows.

**Domain model** ([prisma/schema.prisma](prisma/schema.prisma))
- `Asset` is a property listing. It has a `cuid` string id and a unique human `code` (รหัสทรัพย์).
- An `Asset` has `AssetImage[]` (one image has `isFeature`), `AssetPrice[]`, `AssetPlaces[]` (nearby places) and an optional `Landlord`.
- `Landlord` has `LandlordDetails` and `LandlordRole`.
- `ProjectTemplate` and `ProjectTemplatePlace` autofill project info when adding an asset (see `lib/useProjectTemplateAutocomplete.ts`).
- `BlogPost` uses a String cuid id. Don't `parseInt` it, as recent commits fixed exactly that.
- `User` ids are `Int`. `UserRole` is one of `USER`, `ADMIN`, `LANDLORD`, `AGENT` or `MODERATOR`.
- Admin pages are under `app/[lang]/manage/*`, and listing create and edit are at `app/[lang]/addnew` and `app/[lang]/edit/[id]`.

**Auth**
- Auth uses NextAuth v5 with a Credentials provider (username and password) and JWT sessions. `role` and `id` are copied into the token and the session in callbacks.
- [auth.config.ts](auth.config.ts) holds the edge-safe part of the config. [auth.ts](auth.ts) adds Prisma.
- Passwords are currently compared in plaintext, even though `bcryptjs` is installed.

**Uploads and images**
- `POST /api/upload` ([app/api/upload/route.ts](app/api/upload/route.ts)) stores images and documents in Cloudflare R2 through the S3 SDK.
- It needs the `R2_ENDPOINT`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` env vars, which are not in the current `.env`.
- `GET /api/image-proxy?url=` re-serves remote images with CORS headers so that `html-to-image` can render share or cover images.
- `next.config.ts` allows any remote image host.

**Other**
- Email (password reset, contact, newsletter) uses nodemailer in [lib/mail.ts](lib/mail.ts) with the `SMTP_*` env vars.
- Rich text uses `@uiw/react-md-editor` / `react-quill`.
- The UI is styled with Tailwind v4 (`@tailwindcss/postcss`) and the Sarabun font, on a navy `#0A192F` base. Many user-facing messages are written in Thai.
