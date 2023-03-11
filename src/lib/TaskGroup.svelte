<script lang="ts">
    import Icon from '@iconify/svelte';
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import xmarkIcon from '@iconify/icons-fa6-solid/xmark';
    import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
    import { currentUser, db, tasks, groups, userData } from './firebase';
    import { dndzone } from 'svelte-dnd-action';
    import { modalStore, RadioGroup, RadioItem, type ModalSettings } from '@skeletonlabs/skeleton';
    import { dev } from '$app/environment';
    import type { ItemTask, Task, TaskGroup } from './types/data';

    export let groupID: string;
    let taskName = "";
    let disabled = false;
    let cpName = "";
    export let switchTask: (to: string) => void;
    export let edit: boolean;
    export let switchGroupList: () => void;

    let group = $groups.get(groupID) ?? {name: "", tasks: [], items: []} as TaskGroup;
    if (group.name === "") {
        switchGroupList();
    }else{
        cpName = group.name;
    }
    let show = "all";

    async function switchChecked(taskID: string, current: boolean | undefined) {
        if (current == undefined) return;
        await updateDoc(doc(db,"tasks",taskID), {
            completed: !current
        }).catch((err) => {
            if (dev) console.log(err);
            return;
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
        } as Task)
        let tempGroupList = group.tasks;
        tempGroupList.unshift(newTask.id);
        await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
            tasks: tempGroupList
        })
        disabled = false;
        taskName = "";
    }

    async function changeName() {
        if (!$currentUser) return;
        if (cpName.length < 1 || cpName.length > 30) return;
        if (cpName === group.name) return;
        disabled = true;
        await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
            name: cpName
        })
        disabled = false;
    }

    function deleteGroup() {
        const confirm: ModalSettings = {
            type: 'confirm',
            title: 'Delete Task Group: ' + group.name,
            body: 'Are you sure you want to delete this Task Group?',
            // TRUE if confirm pressed, FALSE if cancel pressed
            response: (r: boolean) => {if (r) doDeleteGroup()},
            // Optionally override the button text
            buttonTextCancel: 'Cancel',
            buttonTextConfirm: 'Delete',
        };
        modalStore.trigger(confirm);
    }

    async function doDeleteGroup() {
        if (!$currentUser) return;
        let cpGList = $userData.group_list;
        switchGroupList();
        cpGList.splice(cpGList.indexOf(groupID), 1)
        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: cpGList
        })
        for (let task of group.tasks) {
            doDeleteTask(task, false);
        }
        await deleteDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID)).catch((err) => {
            if (dev) console.log(err);
            return;
        });
    }

    function deleteTask(taskID: string) {
        const task = $tasks.get(taskID);
        if (task == undefined) return;
        const confirm: ModalSettings = {
            type: 'confirm',
            title: 'Delete Task: '+task.task,
            body: 'Are you sure you want to delete this Task?',
            response: (r: boolean) => {if (r) doDeleteTask(taskID, true)},
            buttonTextCancel: 'Cancel',
            buttonTextConfirm: 'Delete',
        };
        modalStore.trigger(confirm);
    }

    async function doDeleteTask(taskID: string, handleList: boolean = true) {
        if (!$currentUser) return;
        const task = $tasks.get(taskID);
        if (task == undefined) return;

        if (task.subtasks) {
            for (let t of task.subtasks) {
                doDeleteTask(t, false);
            }
        }
        if (handleList) {
            let cpList = group.tasks;
            cpList.splice(cpList.indexOf(taskID), 1)
            await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
                tasks: cpList
            }).catch((err) => {
                if (dev) console.log(err);
            });
        }
        await deleteDoc(doc(db, "tasks", taskID)).catch((err) => {
            if (dev) console.log(err);
            return;
        });
    }

    // drag and drop

    function arrayify(value: Item) {
        return value.tid;
    }

    function handleConsider(e: CustomEvent<DndEvent>) {
		group.items = e.detail.items as ItemTask[];
	}

    async function handleFinalize(e: CustomEvent<DndEvent>) {
        if (!$currentUser) return;
        try {
            group.items = e.detail.items as ItemTask[];
            await updateDoc(doc(db, "users", $currentUser.uid, "task_groups", groupID), {
                tasks: group.items.flatMap(arrayify)
            })
        } catch {
            group.items = $groups.get(groupID)?.items ?? [];
        }
	}

    $: {
        group = $groups.get(groupID) ?? {name: "", tasks: [], items: []} as TaskGroup;
        if (group.name === "") {
            switchGroupList();
        }
    };
</script>

<div class="p-3 flex flex-col gap-2">
    {#if !edit}
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={taskName} class="h-8" type="text" placeholder="Add new Task" disabled={disabled} required/>
        <button on:click={() => {createTask()}} class="variant-filled-surface" disabled={disabled}>Add</button>
    </form>
    <RadioGroup class="select-none">
        <RadioItem bind:group={show} name="show" value="all">All</RadioItem>
        <RadioItem bind:group={show} name="show" value="pending">Pending</RadioItem>
        <RadioItem bind:group={show} name="show" value="completed">Completed</RadioItem>
    </RadioGroup>
    {:else}
    <label class="label">
        <span>Change Task Group name</span>
        <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
            <input bind:value={cpName} class="h-8" type="text" maxlength="30" placeholder="Task Group name" disabled={disabled} required/>
            <button on:click={() => {changeName()}} class="variant-filled-surface" disabled={disabled}>Set</button>
        </form>
    </label>
    <button class="btn variant-glass-error" on:click={() => deleteGroup()}>Delete Task Group</button>
    {/if}
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div use:dndzone={{items: group.items, dragDisabled: !edit, dropTargetStyle: {}}}
    on:consider={handleConsider} on:finalize={handleFinalize}
    class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each group.items as t (t.id)}
        {@const task = $tasks.get(t.tid)}
        <div class:hidden={((task?.completed && show === "pending") || (!task?.completed && show === "completed"))} class="flex p-1 gap-3 w-full justify-between border-b-2 mb-1 border-surface-600">
            <div class="self-center w-auto">
                {#if edit}
                <Icon class="self-center" icon={barsIcon} />
                {:else}
                <input disabled={edit} on:click={() => {switchChecked(t.tid, task?.completed)}}
                checked={task?.completed} type="checkbox"
                class="rounded-full w-7 h-7 hover:brightness-[1.15] hover:bg-white checked:hover:bg-secondary-500
                checked:bg-secondary-500 checked:focus:bg-secondary-500" />
                {/if}
            </div>
            <div class="flex-grow min-w-0 self-center">
                <p class="unstyled text-lg truncate">{task?.task}</p>
                <p class="unstyled text-sm truncate">{task?.description}</p>
            </div>
            {#if edit}
            <button on:click={() => {deleteTask(t.tid)}} class="text-error-500">
                <Icon class="self-center" height="20" icon={xmarkIcon} />
            </button>
            {:else}
            <button on:click={() => {switchTask(t.tid)}} class="self-center"><Icon height="20" icon={angleRight} /></button>
            {/if}
        </div>
        {:else}
        <p class="text-center">No tasks! Congrats!</p>
        {/each}
    </div>
</div>