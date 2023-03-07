<script lang="ts">
    import { currentUser, db, logout } from "$lib/firebase";
    import { updatePage } from "$lib/page";
    import { ConicGradient, type ConicStop } from "@skeletonlabs/skeleton";
    import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
    import Icon from '@iconify/svelte';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import angleDown from '@iconify/icons-fa6-solid/angle-down';
    import TaskGroup from "$lib/TaskGroup.svelte";
    import { fade } from "svelte/transition";
    import ListGroups from "$lib/ListGroups.svelte";
    import { browser } from "$app/environment";
    import type { Unsubscribe } from "firebase/auth";
    import { onDestroy } from "svelte";

    let saveName = "";
    let view = "group";
    let gID = "";

    // Greeting
    const hour = new Date().getHours();
    const greetingTypes = ['Good morning', 'Good afternoon', 'Good evening'];
    let greeting: string;

    if (hour < 12) greeting = greetingTypes[0];
    else if (hour < 18) greeting = greetingTypes[1];
    else greeting = greetingTypes[2];

    let gList: string[] = [];
    let mapGroups = new Map();
    let mapTasks = new Map();

    async function getData() {
        if (!$currentUser) return;
        if (!browser) return;
        const usersRef = doc(db, "users", $currentUser.uid);
        const usersSnap = await getDoc(usersRef);
        saveName = usersSnap.get("name");
        
        const taskGroupsRef = collection(db, "users", $currentUser.uid, "task_groups");
        const taskGroupsQuery = query(taskGroupsRef);
        const taskGroupsSnap = await getDocs(taskGroupsQuery);
        
        taskGroupsSnap.forEach((data) => {
            mapGroups.set(data.id, data.data()); 
        })
        gList = usersSnap.get("group_list");
        
        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(tasksRef, where("author", "==", $currentUser.uid));
        const tasksSnap = await getDocs(tasksQuery);
        tasksSnap.forEach((data) => {
            mapTasks.set(data.id, data.data()); 
        })

        if (gList.length == 0) {
            view = "listGroups";
        } else {
            gID = gList[0];
        }
        initiateRealtime();
    }

    let usersUnsubscribe: Unsubscribe;
    let taskGroupsUnsubscribe: Unsubscribe;
    let tasksUnsubscribe: Unsubscribe;

    function initiateRealtime() {
        if (!browser) return;
        if (!$currentUser) return;
        const usersRef = doc(db, "users", $currentUser.uid);
        usersUnsubscribe = onSnapshot(usersRef, (doc) => {
            saveName = doc.get("name");
            gList = doc.get("group_list");
        });
        const taskGroupsRef = collection(db, "users", $currentUser.uid, "task_groups");
        const taskGroupsQuery = query(taskGroupsRef);
        taskGroupsUnsubscribe = onSnapshot(taskGroupsQuery, (doc) => {
            doc.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    mapGroups.set(change.doc.id, change.doc.data());
                }
                if (change.type === "removed") {
                    mapGroups.delete(change.doc.id);
                }
            })
            mapGroups = mapGroups;
        });
        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(tasksRef, where("author", "==", $currentUser.uid));
        tasksUnsubscribe = onSnapshot(tasksQuery, (doc) => {
            doc.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    mapTasks.set(change.doc.id, change.doc.data());
                }
                if (change.type === "removed") {
                    mapTasks.delete(change.doc.id);
                }
            })
            mapTasks = mapTasks;
        })
    }

    function switchGroup(to: string) {
        if (gList.indexOf(to) != -1) {
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

    onDestroy(() => {
        usersUnsubscribe();
        taskGroupsUnsubscribe();
        tasksUnsubscribe();
    })
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
        <hr class="!border-t-2 my-2" />
        {#if view === "group"}
            <div class="grid grid-cols-3 h-auto">
                <button on:click={() => {view = "listGroups"}} class="justify-self-start self-center"><Icon width="20" icon={barsIcon} /></button>
                <h3 class="text-center whitespace-nowrap">{mapGroups.get(gID).name}</h3>
                <button class="justify-self-end self-end"><Icon height="25" icon={angleDown} /></button>
            </div>
            <div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <TaskGroup groupID={gID} tasks={mapTasks} group={mapGroups.get(gID)} />
            </div>
        {:else if view === "listGroups"}
            <div class="grid grid-cols-3 h-auto">
                <h3 class="text-center col-start-2 whitespace-nowrap">Task Groups</h3>
                <button class="justify-self-end self-end"><Icon height="25" icon={angleDown} /></button>
            </div>
            <div class="mt-2 card rounded-lg variant-glass-surface h-full flex flex-col">
                <ListGroups groups={mapGroups} gList={gList} switchGroup={switchGroup} />
            </div>
        {/if}
    {/await}
</div>
</div>