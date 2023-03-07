<script lang="ts">
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { doc, updateDoc } from "firebase/firestore";
    import { currentUser, db } from "./firebase";

    export let name:string;
    let disabled = false;

    async function changeName() {
        if (!$currentUser) return;
        if (name.length < 1 || name.length > 20) return;
        disabled = true;
        await updateDoc(doc(db, "users", $currentUser.uid), {
            name: name
        })
        disabled = false;
    }
</script>

<div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col justify-between gap-3 p-3">
    <label class="label">
        <span>Change view name</span>
        <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
            <input bind:value={name} class="h-8" type="search" placeholder="Add new Task" required/>
            <button on:click={() => {changeName()}} class="variant-filled-surface" disabled={disabled}>Set</button>
        </form>
    </label>
    <!--<LightSwitch height="h-6" />-->
    <button on:click={() => {alert("WIP")}} class="btn btn-lg variant-glass-error mx-auto">Delete Account</button>
</div>