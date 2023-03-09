<script lang="ts">
    import Icon from '@iconify/svelte';
    import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
    import { currentUser, db } from './firebase';
    import { flip } from 'svelte/animate';

    export let taskID: string;
    export let tasks: Map<any, any>;
    let taskName = "";
    let disabled = false;
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
            task_group: tasks.get(taskID).task_group
        })
        let tempTasksList: string[] = tasks.get(taskID).subtasks;
        tempTasksList.unshift(newTask.id);
        await updateDoc(doc(db, "tasks", taskID), {
            subtasks: tempTasksList
        })
        disabled = false;
        taskName = "";
    }
</script>

<div class="p-3">
    <div class="mb-2">
        <h4><u>Task:</u> {tasks.get(taskID).task}</h4>
        <h4><u>Description:</u> {tasks.get(taskID).description}</h4>
    </div>
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={taskName} class="h-8" type="search" placeholder="Add new Subtask" required/>
        <button on:click={() => {createTask()}} class="variant-filled-surface" disabled={disabled}>Add</button>
    </form>
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each tasks.get(taskID).subtasks as task (task)}
        {@const compl = tasks.get(task).completed}
        <div animate:flip class="flex p-1 gap-3 w-full justify-between border-b-2 mb-1 border-surface-600">
            <div class="self-center w-auto">
                <input on:click={() => {switchChecked(task)}} checked={compl} type="checkbox" class="rounded-full w-7 h-7 hover:brightness-[1.15] hover:bg-secondary-500 checked:hover:bg-secondary-500 checked:bg-secondary-500 checked:focus:bg-secondary-500" />
            </div>
            <div class="flex-grow min-w-0 self-center">
                <p class="unstyled text-lg leading-5">{tasks.get(task).task}</p>
            </div>
        </div>
        {:else}
        <p class="text-center">No subtasks</p>
        {/each}
    </div>
</div>