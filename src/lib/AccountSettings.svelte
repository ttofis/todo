<script lang="ts">
    import { LightSwitch, modalStore, type ModalSettings } from "@skeletonlabs/skeleton";
    import { deleteDoc, doc, updateDoc } from "firebase/firestore";
    import { currentUser, db, groups, logout, tasks, userData } from "$lib/firebase";
    import { dev } from "$app/environment";
    import { deleteUser } from "firebase/auth";

    let name = $userData.name; // userData is a derived store, thus readable, so a mutable copy is needed
    let disabled = false;

    async function changeName() {
        if (!$currentUser) return;
        if (name.length < 1 || name.length > 20 || name === $userData.name) return;
        disabled = true;
        await updateDoc(doc(db, "users", $currentUser.uid), {
            name: name
        }).catch((err) => {
            if (dev) console.log(err);
        });
        disabled = false;
    }

    function deleteAccModal1() {
        const prompt: ModalSettings = {
            type: 'prompt',
            title: 'Delete Account',
            body: 'Are you sure you want to delete your account? Write DELETE to confirm',
            value: "",
            valueAttr: { type: 'text', minlength: 1, required: true },
            response: (r: string) => deleteAccModal2(r),
        };
        modalStore.trigger(prompt);
    }

    function deleteAccModal2(r: string) {
        if (r !== "DELETE") return;
        const confirm: ModalSettings = {
            type: 'confirm',
            title: 'Delete Account',
            body: 'Last chance, are you absolutely sure you want to delete your account?',
            response: (r: boolean) => {if (r) deleteAccount()},
            buttonTextCancel: 'Cancel',
            buttonTextConfirm: 'Delete',
        };
        modalStore.trigger(confirm);
    }
    
    async function deleteAccount() {
        if (!$currentUser) return;
        disabled = true;

        $tasks.forEach((_, task) => {
            deleteDoc(doc(db, "tasks", task)).catch((err) => {
                if (dev) console.log(err);
            });
        })
        
        $groups.forEach((_, group) => {
            deleteDoc(doc(db, "users", $currentUser!.uid, "task_groups", group)).catch((err) => {
                if (dev) console.log(err);
            });
        })
        await deleteDoc(doc(db, "users", $currentUser.uid)).catch((err) => {
            if (dev) console.log(err);
        });
        await deleteUser($currentUser).catch((err: Error) => {
            if (dev) console.log(err);
        });
        logout();
    }
</script>

<div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col justify-between gap-3 p-3">
    <label class="label">
        <span>Change view name</span>
        <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
            <input bind:value={name} class="h-8" type="text" placeholder="View Name" required/>
            <button on:click={() => {changeName()}} class="variant-filled-surface" disabled={disabled}>Set</button>
        </form>
    </label>
    <!--<LightSwitch height="h-6" />-->
    <button on:click={() => {deleteAccModal1()}} class="btn btn-lg variant-glass-error mx-auto" disabled={disabled}>Delete Account</button>
</div>