<script lang="ts">
    import Icon from '@iconify/svelte';
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
    import { currentUser, db } from './firebase';
    import { flip } from 'svelte/animate';

    export let groupID: string;
    export let group: any;
    export let tasks: Map<any, any>;
    let taskName = "";
    let disabled = false;
    export let switchTask: any;
    export let edit: boolean;

    async function switchChecked(task: string) {
        await updateDoc(doc(db,"tasks",task), {
            completed: !tasks.get(task).completed
        })
    }

    async function createTask() {
        if (taskName === "") return;
        if (!$currentUser) return;
        disabled = true;
        const newTask = await addDoc(collection(db, "tasks"), {
            author: $currentUser.uid,
            completed: false,
            description: "",
            due_date: null,
            priority: 0,
            subtasks: [],
            task: taskName,
            task_group: groupID
        })
        let tempGroupList: string[] = group.tasks;
        tempGroupList.unshift(newTask.id);
        await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
            tasks: tempGroupList
        })
        disabled = false;
        taskName = "";
    }
</script>

<div class="p-3">
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={taskName} class="h-8" type="search" placeholder="Add new Task" required/>
        <button on:click={() => {createTask()}} class="variant-filled-surface" disabled={disabled}>Add</button>
    </form>
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each group.tasks as task (task)}
        {@const compl = tasks.get(task).completed}
        <div animate:flip class="flex p-1 gap-3 w-full justify-between border-b-2 mb-1 border-surface-600">
            <div class="self-center w-auto">
                <input disabled={edit} on:click={() => {switchChecked(task)}} checked={compl} type="checkbox" class="rounded-full w-7 h-7 hover:brightness-[1.15] hover:bg-secondary-500 checked:hover:bg-secondary-500 checked:bg-secondary-500 checked:focus:bg-secondary-500" />
            </div>
            <div class="flex-grow min-w-0 self-center">
                <p class="unstyled text-lg truncate">{tasks.get(task).task}</p>
                <p class="unstyled text-sm truncate">{tasks.get(task).description}</p>
            </div>
            <button on:click={() => {switchTask(task)}} class="self-center"><Icon height="20" icon={angleRight} /></button>
        </div>
        {:else}
        <p class="text-center">No tasks! Congrats!</p>
        {/each}
    </div>
</div>