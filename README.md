# Serviceworkers in iOS Safari

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) demonstrating some neat Service Worker features now avauilable in iOS Safari (>=16.4), inlcuding:
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
- Add serwist types to `tscongif.json`
```json
    "types": [
      // Other types...
      // This allows Serwist to type `window.serwist`.
      "@serwist/next/typings"
    ],
```
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
- Add `public/manifest.json`. See [Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) for more on required properties.
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
      {
        "src": "/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
  ]
}
```
- Add metadata to `layout.tsx`
```typescript
const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = "Safari PWA App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "PWA app featuring APIs newly added in Safari";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  [...]
}
```
- Restart dev server
- Open browser tools and observe the 'Application" panel. Under "Service workers", ensure "Bypass for network" is checked to ensure latest is always served from local dev server.
- In `page,tsx`, add `use client` header and add service worker registraion in a `useEffect`
```typescript
      window.serwist.register()
        .then((result: any) => setRegistration(result))
        .catch((err: any) => alert(err)).catch((err: Error) => console.warn(err))
```
- Add service worker feature check/helpers
```typescript
export const isNotifySupported = () => {
    return "serviceWorker" in navigator && "Notification" in window && "PushManager" in window;
}

export const isGeoSupported = () => {
    return "serviceWorker" in navigator && "geolocation" in navigator;
}

export const isStorageSupported = () => {
    return "serviceWorker" in navigator && "storage" in navigator;
}
```
- Add push notification function
```typescript
      const options = {
        body: `New message from ${result.name.first} ${result.name.last}`,
        title: `PWA Safari - ${count + 1}`,
        icon: result.picture.thumbnail,
        actions: [
          {
            action: "open",
            title: "Open the app",
          }
        ]
      };

      // You must use the service worker notification to show the notification
      // e.g - new Notification(notifTitle, options) does not work on iOS
      // despite working on other platforms
      await registration.showNotification("PWa Safari", options);

      // Set the badge count
      setCount(count + 1)
```
- Add "clear badge count" function
```typescript
    // clear app badge
    navigator.clearAppBadge();

    // close notifcations (where supported)
    await registration?.getNotifications().then((notifications) => { notifications.forEach((notification) => notification.close()) });
```
- Add a function to subscribe to remote notifications
```typescript
            const pm = await registration?.pushManager?.permissionState()
            if (pm === "granted")
              // https://developer.mozilla.org/en-US/docs/Web/API/PushManager
              // Requires HTTPS and a valid service worker to receive push notifications
              registration?.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "HELLOWORLD",
              }).then((subscription) => {
                console.log(subscription.endpoint);
                // The push subscription details needed by the application
                // server are now available, and can be sent to it using,
                // for example, the fetch() API.
              }, (err) => console.warn(err))
```
- Add geolocation function (TODO)
- Add storage function (TODO)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Progressive Web Apps](https://web.dev/explore/progressive-web-apps) - intro to PWAs
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - general Service Worker topics.
- [Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) - learn about Web Push for iOS & iPadOS.
- [Safari Push Notifications](https://developer.apple.com/notifications/safari-push-notifications/) - Overview of push notifications for Safari.
- [Serwist](https://github.com/serwist/serwist) - a Service Worker javascript library
