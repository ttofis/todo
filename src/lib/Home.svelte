<script lang="ts">
    import { currentUser, logout, pb } from "$lib/pocketbase";
    import { Collections } from "$lib/types/pocketbase-types";
    import type { TaskGroupResponse, TaskResponse } from "$lib/types/pocketbase-types";
    import { onDestroy, onMount } from "svelte";
    import Group from "$lib/Group.svelte";
    import { flip } from "svelte/animate";
    import { triggerToast } from "./triggerToast";

    const hour = new Date().getHours();
    const greetingTypes = ['Good morning', 'Good afternoon', 'Good evening'];

    let greeting: string;
    let data = new Map();
    let saveName = $currentUser?.name;

    let plusButtonStatus = false;
    let newGroupName = "";
    let newGroupDisabled = false;
    let newGroupFocus = false;

    if (hour < 12) greeting = greetingTypes[0];
    else if (hour < 18) greeting = greetingTypes[1];
    else greeting = greetingTypes[2];

    async function getData() {
        const groups = await pb.collection(Collections.TaskGroup).getFullList<TaskGroupResponse>();
        const records = await pb.collection(Collections.Task).getFullList<TaskResponse>();
        for (let group of groups) {
            data.set(group.id, {
                "group": group,
                "tasks": []
            })
        }
        for (let record of records) {
            data.get(record.group_id).tasks.push(record);
        }
        data = data;
        initalizeRealtime();
        return;
    }

    function initalizeRealtime() {
        pb.collection(Collections.TaskGroups).subscribe("*", async function ({ action, record }) {
            if (action === 'create') {
                let group = await pb.collection(Collections.TaskGroup).getOne(record.id);
                data.set(record.id, {
                    "group": group,
                    "tasks": []
                })
            }
            if (action === 'delete') {
                data.delete(record.id);
            }
            if (action === 'update') {
                let group = await pb.collection(Collections.TaskGroup).getOne(record.id);
                data.get(record.id).group = group;
            }
            data = data;
        });
        pb.collection(Collections.Tasks).subscribe("*", async function ({ action, record }) {
            // Temporary solution, will optimize later.
            let group = await pb.collection(Collections.TaskGroup).getOne(record.group_id);
            let tasks = await pb.collection(Collections.Task).getFullList({
                filter: 'group_id = "'+record.group_id+'"',
            });
            data.set(record.group_id, {
                "group": group,
                "tasks": tasks
            })
            data = data;
        });
    }

    async function createNewGroup() {
        newGroupDisabled = true;
        const data = {
            "group_name": newGroupName,
            "author": $currentUser?.id
        };
        try {
            await pb.collection(Collections.TaskGroups).create(data);
            newGroupName = "";
            newGroupDisabled = false;
            // I don't need to do anything else because realtime will cover it
            // Maybe when PWA and in general offline support is added
        } catch (err) {
            newGroupDisabled = false;
            triggerToast("Something went wrong", "variant-filled-warning");
        }
    }

    function hovered() {
        plusButtonStatus = true;
    }

    function left() {
        if (newGroupName === "" || !newGroupFocus) {
            plusButtonStatus = false;
        }
    }

    function setGroupFocus(bool: boolean) {
        newGroupFocus = bool;
    }

    onDestroy(() => {
        pb.collection(Collections.TaskGroups).unsubscribe("*");
        pb.collection(Collections.Tasks).unsubscribe("*");
    })
    onMount(() => {
        if ($currentUser) getData();
    })
</script>

<div class="text-center h-auto">
    <h2>{greeting}, <button class="unstyled text-primary-500" on:click={logout}>{saveName}</button></h2>
</div>
<div class="mt-5 py-5 mx-3 h-full w-screen flex flex-wrap justify-center gap-3 overflow-y-scroll overflow-x-hidden hide-scrollbar">
    {#if data.size > 0}
    {#each [...data] as group (group[0])}
    <div animate:flip class="w-full max-w-sm">
        <Group group={group} />
    </div>
    {/each}
    {/if}
    <div on:mouseenter={hovered} on:mouseleave={left} class="card h-20 max-w-sm w-full variant-glass-surface p-4 flex justify-center items-center">
        {#if plusButtonStatus}
        <form on:submit|preventDefault class="flex gap-2">
            <input class="input p-2" placeholder="task group" bind:value={newGroupName} disabled={newGroupDisabled} required />
            <button on:click={createNewGroup} class="btn variant-filled-primary" disabled={newGroupDisabled}>Submit</button>
        </form>
        {:else}
        <h3>+ Create new Group</h3>
        {/if}
    </div>
</div>
