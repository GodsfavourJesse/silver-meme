self.addEventListener("push", (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch {
        payload = { body: event.data ? event.data.text() : "" };
    }

    const title = typeof payload.title === "string" && payload.title.trim()
        ? payload.title
        : "KARMASS update";
    const body = typeof payload.body === "string" ? payload.body : "You have a new notification.";
    const tag = typeof payload.tag === "string" ? payload.tag : "karmass-notification";
    const url = typeof payload.url === "string" ? payload.url : "/dashboard/notifications";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag,
            data: { url },
            renotify: true,
        }),
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    let target;
    try {
        target = new URL(event.notification.data?.url || "/dashboard/notifications", self.location.origin);
        if (target.origin !== self.location.origin) {
            target = new URL("/dashboard/notifications", self.location.origin);
        }
    } catch {
        target = new URL("/dashboard/notifications", self.location.origin);
    }

    if (target.pathname === "/notifications") {
        target.pathname = "/dashboard/notifications";
    }

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
            for (const client of windows) {
                if ("focus" in client) {
                    if ("navigate" in client) {
                        await client.navigate(target.href);
                    }
                    return client.focus();
                }
            }
            return self.clients.openWindow(target.href);
        }),
    );
});
