<script lang="ts">
    import { currentUser, db, logout } from "$lib/firebase";
    import { updatePage } from "$lib/page";
    import { ConicGradient, type ConicStop } from "@skeletonlabs/skeleton";
    import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
    import Icon from '@iconify/svelte';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import angleDown from '@iconify/icons-fa6-solid/angle-down';
    import { flip } from "svelte/animate";

    let saveName = "";
    let groups: any[] = [];

    // Greeting
    const hour = new Date().getHours();
    const greetingTypes = ['Good morning', 'Good afternoon', 'Good evening'];
    let greeting: string;

    if (hour < 12) greeting = greetingTypes[0];
    else if (hour < 18) greeting = greetingTypes[1];
    else greeting = greetingTypes[2];

    async function getData() {
        if (!$currentUser) return;
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

<div class="h-full w-full mt-24 mb-5 flex justify-center">
<div class="card variant-glass-surface p-5 h-full w-full max-w-md mx-5 flex flex-col">
    {#await getData()}
        <div class="h-full flex justify-center items-center">
            <ConicGradient stops={loadingSpinner} spin width="w-12">
                <medium>Loading</medium>
            </ConicGradient>
        </div>
    {:then _}
        <div class="flex justify-between h-auto">
            <h3 class="whitespace-nowrap overflow-hidden">{greeting}, {saveName}</h3>
            <button class="btn variant-soft-secondary btn-sm" on:click={logout}>Logout</button>
        </div>
        <div class="w-full border-2 rounded border-surface-300 mx-auto my-2" />
        {#each groups as group}
            <div class="grid grid-cols-3 h-auto">
                <button class="justify-self-start self-center"><Icon width="25" icon={barsIcon} /></button>
                <h2 class="text-center">{group.name}</h2>
                <button class="justify-self-end self-end"><Icon height="30" icon={angleDown} /></button>
            </div>
            <div class="mt-2 card variant-glass-tertiary h-full flex flex-col">
                <div class="p-3">
                    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-400">
                        <input type="search" placeholder="Add new Task" required/>
                        <button on:click={() => {console.log("HELLO")}} class="variant-filled-secondary">Submit</button>
                    </form>
                </div>
                <!--<div class="border border-surface-800 w-full" />-->
                <div class="overflow-hidden relative flex-grow">
                    <div class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
                        {#each group.tasks as task, i (i)}
                        <div animate:flip class="flex p-1 gap-3 w-full justify-between border-b-2 border-surface-900">
                            <div class="self-center w-auto">
                                <input type="checkbox" class="rounded-full w-8 h-8 checked:bg-secondary-500 checked:focus:bg-secondary-500" />
                            </div>
                            <div class="flex-grow min-w-0 self-center">
                                <p class="unstyled text-xl truncate">{task.data.task}</p>
                                <p class="truncate">{task.data.description}Hello World</p>
                            </div>
                            <button class="self-center"><Icon height="20" icon={angleDown} /></button>
                        </div>
                        <!--<h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>
                            <h4 class="truncate">{task.data.task}</h4>-->
                        {:else}
                        <p class="text-center">No tasks! Congrats!</p>
                        {/each}
                    </div>
                </div>
            </div>
        {:else}
            <p>No groups!?</p>
        {/each}
    {/await}
</div>
</div>