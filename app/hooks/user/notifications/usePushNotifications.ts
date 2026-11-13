"use client";

import { useCallback, useEffect, useState } from "react";

import {
    registerPushSubscription,
    unregisterPushSubscription,
} from "@/app/services/user/notifications/notification.service";

function decodeVapidKey(value: string): Uint8Array {
    const padding = "=".repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const raw = window.atob(base64);
    const bytes = new Uint8Array(raw.length);

    for (let index = 0; index < raw.length; index += 1) {
        bytes[index] = raw.charCodeAt(index);
    }

    return bytes;
}

function isIOSDevice(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isInstalledWebApp(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

function getDeviceName(): string {
    const agent = navigator.userAgent;
    if (/iPad/i.test(agent)) return "iPad";
    if (/iPhone|iPod/i.test(agent)) return "iPhone";
    if (/Android/i.test(agent)) return "Android device";
    if (/Windows/i.test(agent)) return "Windows browser";
    if (/Macintosh|Mac OS/i.test(agent)) return "Mac browser";
    return "Web browser";
}

export function usePushNotifications() {
    const [supported, setSupported] = useState<boolean | null>(null);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [requiresHomeScreenInstall, setRequiresHomeScreenInstall] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (
            typeof window === "undefined" ||
            !("Notification" in window) ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
        ) {
            setSupported(false);
            return;
        }

        setSupported(true);
        setPermission(Notification.permission);
        setRequiresHomeScreenInstall(isIOSDevice() && !isInstalledWebApp());

        try {
            const registration = await navigator.serviceWorker.getRegistration("/");
            const current = await registration?.pushManager.getSubscription();
            setSubscription(current ?? null);
        } catch {
            setSubscription(null);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const enable = useCallback(async () => {
        setError("");
        setIsBusy(true);

        try {
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                throw new Error("Push notifications are not configured for this website yet.");
            }
            if (
                typeof window === "undefined" ||
                !("Notification" in window) ||
                !("serviceWorker" in navigator) ||
                !("PushManager" in window)
            ) {
                throw new Error("This browser does not support push notifications.");
            }
            if (isIOSDevice() && !isInstalledWebApp()) {
                throw new Error("On iPhone or iPad, add KARMASS to your Home Screen, open it there, then enable push notifications.");
            }

            const nextPermission = await Notification.requestPermission();
            setPermission(nextPermission);
            if (nextPermission !== "granted") {
                throw new Error(
                    nextPermission === "denied"
                        ? "Notifications are blocked in your browser settings. Allow them for KARMASS, then try again."
                        : "Allow notifications to receive KARMASS updates on this device.",
                );
            }

            const registration = await navigator.serviceWorker.register(
                "/service-worker.js",
                { scope: "/" },
            );
            await navigator.serviceWorker.ready;

            let current = await registration.pushManager.getSubscription();
            if (!current) {
                current = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: decodeVapidKey(vapidKey) as BufferSource,
                });
            }

            const serialized = current.toJSON();
            if (
                !serialized.endpoint ||
                !serialized.keys?.p256dh ||
                !serialized.keys.auth
            ) {
                throw new Error("Your browser returned an incomplete push subscription. Please try again.");
            }

            await registerPushSubscription({
                endpoint: serialized.endpoint,
                keys: {
                    p256dh: serialized.keys.p256dh,
                    auth: serialized.keys.auth,
                },
                userAgent: navigator.userAgent.slice(0, 500),
                deviceName: getDeviceName(),
            });

            setSubscription(current);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Unable to enable push notifications on this device.",
            );
            await refresh();
        } finally {
            setIsBusy(false);
        }
    }, [refresh]);

    const disable = useCallback(async () => {
        if (!subscription) return;
        setError("");
        setIsBusy(true);

        try {
            await unregisterPushSubscription(subscription.endpoint);
            await subscription.unsubscribe();
            setSubscription(null);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Unable to turn off push notifications on this device.",
            );
        } finally {
            setIsBusy(false);
        }
    }, [subscription]);

    return {
        supported,
        subscribed: Boolean(subscription),
        permission,
        requiresHomeScreenInstall,
        isBusy,
        error,
        enable,
        disable,
        refresh,
    };
}
