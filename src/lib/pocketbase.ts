import PocketBase from 'pocketbase'
import { writable } from 'svelte/store';
import { Collections } from '$lib/types/pocketbase-types';

export const pb = new PocketBase('https://todo-chrisch.fly.dev/');
export const currentUser = writable(pb.authStore.model);

pb.autoCancellation(false);

pb.authStore.onChange(() => {
    currentUser.set(pb.authStore.model);
})

export function logout() {
    pb.collection(Collections.TaskGroups).unsubscribe("*");
    pb.collection(Collections.Tasks).unsubscribe("*");
    pb.authStore.clear();
}