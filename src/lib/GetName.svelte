<script lang="ts">
    import type { ToastSettings } from "@skeletonlabs/skeleton";
    import { toastStore } from '@skeletonlabs/skeleton';
    import { currentUser, db } from "$lib/firebase";
    import { doc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore"; 
    import { updatePage } from "$lib/page";

    let promise: Promise<void> | null;
    let name = "";
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
        if (name.length >= 1 && name.length <= 20) {
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
        if (!$currentUser) {
            return;
        }
        await setDoc(doc(db, "users", $currentUser.uid), {
            name: name,
            group_list: []
        })
        const docRef = await addDoc(collection(db, "users", $currentUser.uid, "task_groups"), {
            name: "Tasks",
            tasks: []
        })
        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: [docRef.id]
        })

        updatePage($currentUser);
    }
</script>

<div class="mx-5 text-center">
<h2>Welcome! Glad you joined</h2>
<h2>How should we call you?</h2>
<form class="mt-2 w-full max-w-md flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="text" placeholder="name" minlength="1" maxlength="20" bind:value={name} required />
    <button disabled={disabled} class="btn variant-glass-secondary" on:click={handle}>Submit</button>
</form>
</div>