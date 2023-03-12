<script lang="ts">
    import { db, currentUser } from "$lib/firebase";
    import { doc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore"; 
    import { triggerToast } from "$lib/generalFunctions";
  import { dev } from "$app/environment";

    let promise: Promise<void> | null;
    let name = "";
    let disabled = false;

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
        if (!$currentUser) return;
        await setDoc(doc(db, "users", $currentUser.uid), {
            name: name,
            group_list: []
        }).catch((err) => {
            if (dev) console.log(err);
            return;
        });
        const docRef = await addDoc(collection(db, "users", $currentUser.uid, "task_groups"), {
            name: "Tasks",
            tasks: []
        }).catch((err) => {
            if (dev) console.log(err);
        });
        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: [docRef!.id]
        }).catch((err) => {
            if (dev) console.log(err);
        });
    }
</script>

<div class="mx-5 text-center">
<h2>Welcome! Glad you joined</h2>
<h2>How should we call you?</h2>
<form class="mt-2 w-full max-w-md flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="text" placeholder="Name" minlength="1" maxlength="20" bind:value={name} required />
    <button disabled={disabled} class="btn variant-glass-secondary" on:click={handle}>Submit</button>
</form>
</div>