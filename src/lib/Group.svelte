<script lang="ts">
    import { Collections, type TaskGroupRecord, type TaskRecord } from "$lib/types/pocketbase-types";
    import { slide } from "svelte/transition";
    import { pb } from "$lib/pocketbase";
    import { triggerToast } from "$lib/triggerToast";
    export let group: [string, {
        group: TaskGroupRecord,
        tasks: TaskRecord[]
    }];

    let data = group[1];
    // @ts-ignore
    let remaining = data.group.currentTasks - data.group.completedTasks;

    let newTask = "";
    let newTaskDisabled = false;

    async function createNewTask() {
        newTaskDisabled = true;
        const data = {
            "task": newTask,
            "group_id": group[0],
            "completed": false,
        };
        try {
            await pb.collection(Collections.Tasks).create(data);
            newTask = "";
            newTaskDisabled = false;
            // I don't need to do anything else because realtime will cover it
            // Maybe when PWA and in general offline support is added
        } catch (err) {
            newTaskDisabled = false;
            triggerToast("Something went wrong", "variant-filled-warning");
        }
    }

    async function deleteGroup() {
        try {
        await pb.collection(Collections.TaskGroups).delete(group[0]);
        } catch {
            triggerToast("Something went wrong", 'variant-filled-error');
        }
    }

    $: {
        data = group[1];
        // @ts-ignore
        remaining = data.group.currentTasks - data.group.completedTasks;
    }
</script>

<!-- Replace with proper button pls -->

<div in:slide={{delay: 500}} out:slide class="card w-full variant-glass-surface p-4 flex flex-col gap-2">
    {#if remaining > 0}<span class="badge variant-filled-primary absolute -top-1 -right-1 z-10">{remaining}</span>{/if}
    <div class="flex justify-between">
        <h2 class="overflow-hidden">{data.group.group_name}</h2>
        <button on:click={() => deleteGroup()}>X</button>
    </div>
    <form on:submit|preventDefault class="flex gap-2">
        <input class="input p-2" placeholder="task group" bind:value={newTask} disabled={newTaskDisabled} required />
        <button on:click={createNewTask} class="btn variant-filled-primary" disabled={newTaskDisabled}>Submit</button>
    </form>
    <div class="h-96 w-full flex flex-col gap-2 overflow-y-scroll overflow-x-hidden p-1">
        {#each data.tasks as task}
        {#if task.completed == false}
        <div in:slide={{delay: 500}} out:slide class="card variant-glass-surface p-3 gap-2 grid grid-cols-6">
            <div class="h-full w-full flex justify-center items-center">
                <input type="checkbox" />
            </div>
            <div class="col-span-5">
                <div class="flex justify-between">
                    <div>
                        <p class="text-ellipsis w-full">{task.task} {#if task.due_date != ""}<span class="text-red-600">due date</span>{/if}</p>
                    </div>
                    <div>
                        <p>{#if task.subTasks && task.subTasks > 0}{task.completedSubTasks}/{task.subTasks}{/if}</p>
                    </div>
                </div>
                <p class="unstyled line-clamp-2 text-sm text-slate-900">{task.description}</p>
            </div>
        </div>
        {/if}
        {/each}
    </div>
    <button>Open</button>
</div>