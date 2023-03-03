import PocketBase from 'pocketbase'
import { writable } from 'svelte/store';

export const pb = new PocketBase('https://todo-chrisch.fly.dev/');
export const currentUser = writable(pb.authStore.model);

pb.autoCancellation(false);

pb.authStore.onChange(() => {
    currentUser.set(pb.authStore.model);
})

export function logout() {
    pb.authStore.clear();
}