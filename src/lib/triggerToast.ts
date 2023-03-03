import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";

export function triggerToast(msg: string, background: string): void {
    const t: ToastSettings = {
        message: msg,
        background: background,
        autohide: true,
        timeout: 3000,
    };
    toastStore.trigger(t);
}