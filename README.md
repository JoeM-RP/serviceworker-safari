# Serviceworkers in iOS Safari

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) demonstrating some neat Service Worker features now avauilable in iOS Safari (>=17.0.1), inlcuding:
- Push Notifications (new!)
- Geolocation (not new!)
- Local storage (not new!)

## Getting Started

Install dependencies and start the dev server:

```bash
yarn && yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Script / Set Up

- Create the base nextjs app: `npx create-next-app@latest` (do not include `src` directory)
- Add service worker dependencies: `yarn add @serwist/sw @serwist/next`
- Create a new file `app/sw.ts`
```typescript
import { defaultCache } from "@serwist/next/browser";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope & {
  // Change this attribute's name to your `injectionPoint`.
  // `injectionPoint` is an InjectManifest option.
  // See https://serwist.pages.dev/docs/build/inject-manifest/configuring
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
```
- Add `public/manifest.json`
```json
{
"id": "/",
"theme_color": "#000",
"background_color": "#f8fafc",
"display": "standalone",
"scope": "/",
"start_url": "/",
"name": "Progressive Web App Safari",
"short_name": "PWA Safari",
"description": "An app demonstrating PWA features in Safari",
"icons": [
  ]
}
```
- Configure the service worker in `next.config.mjs:
```javascript
import withSerwistInit from "@serwist/next";
      
const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    register: false,
    cacheOnFrontEndNav: true,
});
         
export default withSerwist({
    // Your Next.js config
    env: {
        // Client env variables go here
    },
});
```
- Restart dev server
-

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Progressive Web Apps](https://web.dev/explore/progressive-web-apps) - intro to PWAs
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - general Service Worker topics.
- [Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) - learn about Web Push for iOS & iPadOS.
- [Safari Push Notifications](https://developer.apple.com/notifications/safari-push-notifications/) - Overview of push notifications for Safari.
- [Serwist](https://github.com/serwist/serwist)
