<script lang="ts">
    import Icon from '@iconify/svelte';
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import xmarkIcon from '@iconify/icons-fa6-solid/xmark';
    import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
    import { currentUser, db } from './firebase';
    import { dndzone } from 'svelte-dnd-action';
    import { modalStore, type ModalSettings } from '@skeletonlabs/skeleton';

    export let groupID: string;
    export let group: any;
    export let tasks: Map<any, any>;
    let taskName = "";
    let disabled = false;
    export let switchTask: any;
    export let edit: boolean;
    export let switchGroupList: any;
    export let gList: string[];

    let cpName = group.name
    let ItemList: Item[];

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

    async function changeName() {
        if (!$currentUser) return;
        if (cpName.length < 1 || cpName.length > 20) return;
        disabled = true;
        await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
            name: cpName
        })
        disabled = false;
    }

    function deleteGroup() {
        const confirm: ModalSettings = {
            type: 'confirm',
            title: 'Delete Task Group',
            body: 'Are you sure you want to delete this Task Group?',
            // TRUE if confirm pressed, FALSE if cancel pressed
            response: (r: boolean) => doDeleteGroup(r),
            // Optionally override the button text
            buttonTextCancel: 'Cancel',
            buttonTextConfirm: 'Delete',
        };
        modalStore.trigger(confirm);
    }

    async function doDeleteGroup(r: boolean) {
        if (!$currentUser) return;
        if (!r) return;
        let cpGList = gList;
        switchGroupList();
        for (let task of group.tasks) {
            deleteTask(task, false);
        }
        cpGList.splice(cpGList.indexOf(groupID), 1)
        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: cpGList
        })
        await deleteDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID));
    }

    async function deleteTask(task: string, handleList: boolean = true) {
        if (!$currentUser) return;
        if (tasks.get(task).subtasks) {
            for (let t of tasks.get(task).subtasks) {
                deleteTask(t, false);
            }
        }
        if (handleList) {
            let cpList = group.tasks;
            cpList.splice(cpList.indexOf(task), 1)
            await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
                tasks: cpList
            })
        }
        await deleteDoc(doc(db, "tasks", task));
    }

    // drag and drop

    function itemify(value: string) {
        return {id: value, tid: value};
    }

    function arrayify(value: Item) {
        return value.tid;
    }

    function handleConsider(e: CustomEvent<DndEvent>) {
		ItemList = e.detail.items;
	}

    async function handleFinalize(e: CustomEvent<DndEvent>) {
        if (!$currentUser) return;
        try {
            ItemList = e.detail.items;
            await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
                tasks: ItemList.flatMap(arrayify)
            })
        } catch {
            ItemList = group.tasks.map(itemify);
        }
	}

    $: {
        ItemList = group.tasks.map(itemify);
    }
</script>

<div class="p-3 flex flex-col gap-2">
    {#if !edit}
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={taskName} class="h-8" type="search" placeholder="Add new Task" disabled={disabled} required/>
        <button on:click={() => {createTask()}} class="variant-filled-surface" disabled={disabled}>Add</button>
    </form>
    {:else}
    <label class="label">
        <span>Change Task Group name</span>
        <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
            <input bind:value={cpName} class="h-8" type="search" placeholder="Task Group name" disabled={disabled} required/>
            <button on:click={() => {changeName()}} class="variant-filled-surface" disabled={disabled}>Set</button>
        </form>
    </label>
    <button class="btn variant-glass-error" on:click={() => deleteGroup()}>Delete Task Group</button>
    {/if}
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div use:dndzone={{items: ItemList, dragDisabled: !edit, dropTargetStyle: {}}}
    on:consider={handleConsider} on:finalize={handleFinalize}
    class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each ItemList as task (task.id)}
        {@const compl = tasks.get(task.tid).completed}
        <div class="flex p-1 gap-3 w-full justify-between border-b-2 mb-1 border-surface-600">
            <div class="self-center w-auto">
                {#if edit}
                <Icon class="self-center" icon={barsIcon} />
                {:else}
                <input disabled={edit} on:click={() => {switchChecked(task.tid)}} checked={compl} type="checkbox" class="rounded-full w-7 h-7 hover:brightness-[1.15] hover:bg-secondary-500 checked:hover:bg-secondary-500 checked:bg-secondary-500 checked:focus:bg-secondary-500" />
                {/if}
            </div>
            <div class="flex-grow min-w-0 self-center">
                <p class="unstyled text-lg truncate">{tasks.get(task.tid).task}</p>
                <p class="unstyled text-sm truncate">{tasks.get(task.tid).description}</p>
            </div>
            {#if edit}
            <button on:click={() => {deleteTask(task.tid)}} class="text-error-500">
                <Icon class="self-center" height="20" icon={xmarkIcon} />
            </button>
            {:else}
            <button on:click={() => {switchTask(task.tid)}} class="self-center"><Icon height="20" icon={angleRight} /></button>
            {/if}
        </div>
        {:else}
        <p class="text-center">No tasks! Congrats!</p>
        {/each}
    </div>
</div>