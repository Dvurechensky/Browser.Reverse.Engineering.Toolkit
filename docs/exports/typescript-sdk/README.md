# sitereconstructor-vk-com-sdk

Generated TypeScript SDK draft from SiteReconstructor passive capture evidence.

## Install

```bash
npm install
npm run typecheck
```

## Usage

```ts
import { createSiteClient } from './src';

const client = createSiteClient({
  baseUrl: 'https://vk.com',
  apiBaseUrl: 'https://api.vk.com',
  accessToken: process.env.ACCESS_TOKEN,
  sessionCookie: process.env.SESSION_COOKIE,
});

// Example:
// const result = await client.postMethodVideoGetstatstoken({});
```

## Notes

- Schemas and endpoint names are inferred drafts.
- Sensitive values are represented as options/placeholders and are not embedded.
- Review auth, cookies, CSRF, and request bodies before production use.
