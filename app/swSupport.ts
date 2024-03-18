export const isNotifySupported = () => {
    return "serviceWorker" in navigator && "Notification" in window && "PushManager" in window;
}

export const isGeoSupported = () => {
    return "serviceWorker" in navigator && "geolocation" in navigator;
}

export const isStorageSupported = () => {
    return "serviceWorker" in navigator && "storage" in navigator;
}