<script lang="ts">
    import { currentUser, pb } from "$lib/pocketbase";
    import type { Record } from "pocketbase";
    import type { ToastSettings } from "@skeletonlabs/skeleton";
    import { toastStore } from '@skeletonlabs/skeleton';
    import { Collections } from "$lib/types/pocketbase-types";

    let promise: Promise<void> | null;
    let name: string;
    let disabled = false;

    function triggerToast(msg: string, background: string): void {
        const t: ToastSettings = {
            message: msg,
            background: background,
            autohide: true,
            timeout: 3000,
        };
        toastStore.trigger(t);
    }

    function handle() {
        if (name.length >= 1) {
            disabled = true;
            promise = setName();
            promise?.catch(() => {
                triggerToast("Something went wrong, please try again", 'warning');
                disabled = false;
            })
        }else{
            triggerToast("Something went wrong, please try again", 'warning');
        }
    }

    async function setName() {
        const data = {
            "name": name,
        };
        if ($currentUser) {
            const data2 = {
                "group_name": "Tasks",
                "author": $currentUser.id
            };
            await pb.collection(Collections.TaskGroups).create(data2);
            await pb.collection(Collections.Users).update($currentUser.id, data);
        }
    }
</script>

<h2>Welcome! Glad you joined</h2>
<h2>How should we call you?</h2>
<form class="mt-2 w-full flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="text" placeholder="name" minlength="1" bind:value={name} required />
    <button disabled={disabled} class="btn variant-glass-secondary" on:click={handle}>Submit</button>
</form>
