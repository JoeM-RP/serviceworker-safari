'use client'

import Image from "next/image";

import { isNotifySupported, isGeoSupported, isStorageSupported } from "./swSupport";
import { useEffect, useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isPwaSupported, setIsPwaSupported] = useState(false);
  const [isPushGranted, setIsPushGranted] = useState(false)

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if all the features we want are available
    // In practice, it is better to check for each feature separately and allow users to opt-in 
    // to each feature on demand.
    const hasRequisite = isNotifySupported() && isGeoSupported() && isStorageSupported();
    setIsPwaSupported(hasRequisite);

    if (window.serwist !== undefined && hasRequisite) {
      try {
        setIsPushGranted(Notification.permission === "granted")
      } catch (err) {
        console.info(err)
      }

      const beforeinstallprompt = (event: any) => {
        console.log("Before install prompt: ", event);
      }

      const appinstalled = (event: any) => {
        console.log("App installed: ", event);
      }

      // Register the service worker
      window.serwist.register()
        .then((result: any) => setRegistration(result))
        .catch((err: any) => alert(err)).catch((err: Error) => console.warn(err))

      window.addEventListener("beforeinstallprompt", beforeinstallprompt);
      window.addEventListener("appinstalled", appinstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", beforeinstallprompt);
        window.removeEventListener("appinstalled", appinstalled);
      }
    } else {
      console.warn("Serwist is not available or the requisite features are not available")
    }
  }, []);

  useEffect(() => {
    console.info("Service worker registration state: ", registration?.active?.state)
    setIsAppInstalled(registration?.active?.state === "activated")
  }, [registration?.active?.state])

  useEffect(() => {
    navigator.setAppBadge && navigator.setAppBadge(count)
  }, [count])

  const requestPermission = () => {
    try {
      if (isPwaSupported)
        Notification.requestPermission().then((result) => {
          if (result === "granted") {
            setIsPushGranted(true);
          } else {
            alert("We weren't allowed to send you notifications. Permission state is: " + result);
          }
        })
      else {
        // Alert the user that they need to install the web page to use notifications 
        alert('You need to install this web page to use notifications');
      }
    } catch (err) {
      console.log(err)
    }
  }

  const randomNotification = async () => {
    if (!registration) return

    try {
      const result = await fetch("https://randomuser.me/api/?nat=us,fr,gb,mx,in")
        .then((response) => response.json())
        .then((data) => data.results[0]);

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
      await registration.showNotification("Message", options);

      // Set the badge count
      setCount(count + 1)
    } catch (err: any) {
      console.log("Encountered a problem: " + err.message)
      console.log(err)
      alert(err)
    }
  }

  const clearNotifications = async () => {
    // clear app badge
    navigator.clearAppBadge();
    setCount(0);

    // close notifcations (where supported)
    await registration?.getNotifications().then((notifications) => { notifications.forEach((notification) => notification.close()) });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {!isPwaSupported && (<button
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Install{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Install this page as an app to get started
          </p>
        </button>)}


        {!isPushGranted && (
          <button
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            onClick={() => requestPermission()}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Push{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Enable Push Notifications
            </p>
          </button>)}

        {isAppInstalled && (<button
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Installed{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              ✔
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Service worker is registered.
          </p>
        </button>)}

        {isPushGranted && (
          <button
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            onClick={() => randomNotification()}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Push{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                ✔
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Test Push Notifications
            </p>
          </button>)}

        {isPushGranted && (
          <button
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            onClick={() => clearNotifications()}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Push{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                ✔
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Clear Badge Counter
            </p>
          </button>)}
      </div>
    </main>
  );
}
