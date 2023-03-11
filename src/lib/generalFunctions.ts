import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";

export const validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export function triggerToast(msg: string, background: string): void {
    const t: ToastSettings = {
        message: msg,
        background: background,
        autohide: true,
        timeout: 3000,
    };
    toastStore.trigger(t);
}