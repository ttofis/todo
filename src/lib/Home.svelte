<script lang="ts">
    import { currentUser, db, logout } from "$lib/firebase";
    import { updatePage } from "$lib/page";
    import { ConicGradient, type ConicStop } from "@skeletonlabs/skeleton";
    import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
    import Icon from '@iconify/svelte';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import angleDown from '@iconify/icons-fa6-solid/angle-down';
    import { flip } from "svelte/animate";
    import TaskGroup from "$lib/TaskGroup.svelte";
    import { fade } from "svelte/transition";
    import ListGroups from "$lib/ListGroups.svelte";
    import { browser } from "$app/environment";

    let saveName = "";
    let groups: any[] = [];
    let view = "group";
    let gID = 0;

    let groupName = "";

    // Greeting
    const hour = new Date().getHours();
    const greetingTypes = ['Good morning', 'Good afternoon', 'Good evening'];
    let greeting: string;

    if (hour < 12) greeting = greetingTypes[0];
    else if (hour < 18) greeting = greetingTypes[1];
    else greeting = greetingTypes[2];

    async function getData() {
        if (!$currentUser) return;
        if (!browser) return;
        const usersRef = doc(db, "users", $currentUser.uid);
        const usersSnap = await getDoc(usersRef);
        saveName = usersSnap.get("name");
        
        const taskGroupsRef = collection(db, "users", $currentUser.uid, "task_groups");
        const taskGroupsQuery = query(taskGroupsRef);
        const taskGroupsSnap = await getDocs(taskGroupsQuery);
        let tempGroups = new Map();
        taskGroupsSnap.forEach((data) => {
            tempGroups.set(data.id, data.data()); 
        })
        const gList = usersSnap.get("group_list");

        for (const group of gList) {
            if (tempGroups.has(group)) {
                const d = tempGroups.get(group);
                const tasksRef = collection(db, "tasks");
                const tasksQuery = query(tasksRef, where("task_group", "==", group));
                const tasksSnap = await getDocs(tasksQuery);
                let tasks: { id: any; data: any; }[] = [];
                let tempTasks = new Map();
                let notCompleted = 0;
                tasksSnap.forEach((data) => {
                    tempTasks.set(data.id, data.data()); 
                })
                d.tasks.forEach((task: any) => {
                    const t = tempTasks.get(task);
                    tasks.push({
                        id: task,
                        data: t
                    })
                    if (t.completed == false) notCompleted++;
                });
                groups.push({
                    id: group,
                    name: d.name,
                    tasks: tasks,
                    remaining: notCompleted
                });
            }
        }

        groups = groups;
        if (groups.length == 0) view = "listGroups";
        // initiateRealtime();
    }

    function initiateRealtime() {
        if (!browser) return;
        if (!$currentUser) return;
        const taskGroupsRef = collection(db, "users", $currentUser.uid, "task_groups");
        const taskGroupsUnsubscribe = onSnapshot(taskGroupsRef, (doc) => {

        })
    }

    function switchGroup(to: number) {
        if (to < groups.length && to >= 0) {
            gID = to;
            view = "group";
        }
    }

    if (!$currentUser) {
        updatePage($currentUser);
    }

    // Loading spinner
    const loadingSpinner: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-secondary-500))', start: 75, end: 100 }
	];
</script>

<div class="h-full max-h-[800px] w-full mt-24 mb-5 flex justify-center">
<div class="card variant-glass-surface p-4 h-full w-full max-w-md mx-5 flex flex-col">
    {#await getData()}
        <div class="h-full flex justify-center items-center">
            <ConicGradient stops={loadingSpinner} spin width="w-12">
                <medium>Loading</medium>
            </ConicGradient>
        </div>
    {:then _}
        <div class="flex justify-between h-auto">
            <h4 class="whitespace-nowrap overflow-hidden">{greeting}, {saveName}</h4>
            <button class="btn variant-soft-secondary btn-sm" on:click={logout}>Logout</button>
        </div>
        <div class="w-full border rounded border-surface-300 mx-auto my-2" />
        {#if view === "group"}
            <div in:fade={{delay:200, duration: 200}} out:fade={{duration: 200}} class="grid grid-cols-3 h-auto">
                <button on:click={() => {view = "listGroups"}} class="justify-self-start self-center"><Icon width="20" icon={barsIcon} /></button>
                <h3 class="text-center whitespace-nowrap">{groups[gID].name}</h3>
                <button class="justify-self-end self-end"><Icon height="25" icon={angleDown} /></button>
            </div>
            <div in:fade={{delay:200, duration: 200}} out:fade={{duration: 200}} class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <TaskGroup group={groups[gID]} />
            </div>
        {:else if view === "listGroups"}
            <div in:fade={{delay:200, duration: 200}} out:fade={{duration: 200}} class="grid grid-cols-3 h-auto">
                <h3 class="text-center col-start-2 whitespace-nowrap">Task Groups</h3>
                <button class="justify-self-end self-end"><Icon height="25" icon={angleDown} /></button>
            </div>
            <div in:fade={{delay:200, duration: 200}} out:fade={{duration: 200}} class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <ListGroups groups={groups} switchGroup={switchGroup} />
            </div>
        {/if}
    {/await}
</div>
</div>