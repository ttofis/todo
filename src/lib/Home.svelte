<script lang="ts">
    import { currentUser, db, groups, loadData, logout, tasks, userData } from "$lib/firebase";
    import { ConicGradient, type ConicStop } from "@skeletonlabs/skeleton";
    import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
    import Icon from '@iconify/svelte';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import arrowTurnUp from '@iconify/icons-fa6-solid/arrow-turn-up';
    import TaskGroup from "$lib/TaskGroup.svelte";
    import ListGroups from "$lib/ListGroups.svelte";
    import { browser } from "$app/environment";
    import type { Unsubscribe } from "firebase/auth";
    import { onDestroy } from "svelte";
    import TaskView from "$lib/TaskView.svelte";
    import penToSquare from '@iconify/icons-fa6-solid/pen-to-square';
    import AccountSettings from "$lib/AccountSettings.svelte";

    let saveName = $userData.name;
    userData.subscribe((data) => {
        if (data.name !== "") saveName = data.name;
    })
    let view = "group";
    let preview = "group";
    let gID = "";
    let tID = "";
    let edit = false;

    // Greeting
    const hour = new Date().getHours();
    const greetingTypes = ['Good morning', 'Good afternoon', 'Good evening'];
    let greeting: string;

    if (hour < 12) greeting = greetingTypes[0];
    else if (hour < 18) greeting = greetingTypes[1];
    else greeting = greetingTypes[2];

    if ($userData.group_list.length == 1) {
        gID = $userData.group_list[0];
    } else {
        view = "listGroups";
    }

    export function switchGroupList() {
        view = "listGroups";
        edit = false;
    }

    function switchGroup(to: string) {
        if ($userData.group_list.indexOf(to) != -1) {
            gID = to;
            view = "group";
        }
        edit = false;
    }

    function switchTask(to: string) {
        if ($tasks.has(to)) {
            tID = to;
            view = "task";
        }
        edit = false;
    }

    function goBackGroup() {
        if ($userData.group_list.indexOf(gID) != -1) {
            view = "group";
        }else{
            view = "listGroups";
        }
        edit = false;
    }

    function viewAccount() {
        if (view === "account") return;
        edit = false;
        preview = view;
        view = "account";
    }

    function switchEdit() {
        edit = !edit;
    }

    // Loading spinner
    const loadingSpinner: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-secondary-500))', start: 75, end: 100 }
	];
</script>

<div class="h-full max-h-[800px] w-full mt-24 mb-5 flex justify-center overflow-hidden">
<div class="card variant-glass-surface p-4 h-full w-full max-w-md mx-5 flex flex-col">
    {#if $currentUser}
    {#await loadData($currentUser)}
        <div class="h-full flex justify-center items-center">
            <ConicGradient stops={loadingSpinner} spin width="w-12">
                <medium>Loading</medium>
            </ConicGradient>
        </div>
    {:then _}
        <div class="flex justify-between h-auto">
            <h4 class="whitespace-nowrap truncate overflow-hidden">{greeting}, <button on:click={() => {viewAccount()}} class="text-primary-500">{saveName}</button></h4>
            <button class="btn variant-soft-secondary btn-sm" on:click={logout}>Logout</button>
        </div>
        <hr class="!border-t-2 my-2" />
        {#if view === "group"}
            <div class="grid grid-cols-3 grid-cols-[auto_1fr_auto] h-auto">
                <button on:click={() => {edit = false; view = "listGroups"}} class="justify-self-start self-center"><Icon width="20" icon={barsIcon} /></button>
                <h3 class="text-center whitespace-nowrap truncate">{$groups.get(gID)?.name}</h3>
                <button class="justify-self-end self-center" class:text-primary-500={edit} on:click={() => {switchEdit()}}><Icon height="20" icon={penToSquare} /></button>
            </div>
            <div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <TaskGroup edit={edit} groupID={gID} switchGroupList={switchGroupList} switchTask={switchTask} />
            </div>
        {:else if view === "listGroups"}
            <div class="grid grid-cols-3 grid-cols-[auto_1fr_auto] h-auto">
                <h3 class="text-center col-start-2 whitespace-nowrap truncate">Task Groups</h3>
                <button class="justify-self-end self-center" class:text-primary-500={edit} on:click={() => {switchEdit()}}><Icon height="20" icon={penToSquare} /></button>
            </div>
            <div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <ListGroups edit={edit} switchGroup={switchGroup} />
            </div>
        {:else if view === "task"}
            <div class="grid grid-cols-3 grid-cols-[auto_1fr_auto] h-auto">
                <button on:click={() => {goBackGroup()}} class="justify-self-start self-center"><Icon height="18" icon={arrowTurnUp} rotate={3} /></button>
                <h3 class="text-center whitespace-nowrap truncate">Viewing Task</h3>
                <button class="justify-self-end self-center" class:text-primary-500={edit} on:click={() => {switchEdit()}}><Icon height="20" icon={penToSquare} /></button>
            </div>
            <div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <TaskView edit={edit} taskID={tID} goBackGroup={goBackGroup} />
            </div>
        {:else if view === "account"}
            <div class="grid grid-cols-3 grid-cols-[auto_1fr_auto] h-auto">
                <button on:click={() => {view = preview}} class="justify-self-start self-center"><Icon height="18" icon={arrowTurnUp} rotate={3} /></button>
                <h3 class="text-center whitespace-nowrap truncate">Account Settings</h3>
            </div>
            <AccountSettings />
        {/if}
    {/await}
    {/if}
</div>
</div>