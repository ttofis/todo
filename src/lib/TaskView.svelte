<script lang="ts">
    import Icon from '@iconify/svelte';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import xmarkIcon from '@iconify/icons-fa6-solid/xmark';
    import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
    import { currentUser, db, tasks } from './firebase';
    import { dev } from '$app/environment';
    import type { ItemTask, Task, TaskRecord } from './types/data';
    import { dndzone } from 'svelte-dnd-action';
    import { modalStore, RadioGroup, RadioItem, type ModalSettings } from '@skeletonlabs/skeleton';

    export let taskID: string;
    let taskName = "";
    let disabled = false;
    let show = "all";
    export let edit: boolean;
    export let goBackGroup: () => void;

    let task: Task;
    let pre = $tasks.get(taskID);
    if (pre != undefined) {
        task = pre;
    } else {
        goBackGroup();
    }

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
            task_group: task.task_group
        } as TaskRecord)
        let tempTasksList = task.subtasks;
        tempTasksList.unshift(newTask.id);
        await updateDoc(doc(db, "tasks", taskID), {
            subtasks: tempTasksList
        })
        disabled = false;
        taskName = "";
    }

    function deleteTask(tID: string) {
        const t = $tasks.get(tID);
        if (t == undefined) return;
        const confirm: ModalSettings = {
            type: 'confirm',
            title: 'Delete Subtask: '+t.task,
            body: 'Are you sure you want to delete this Subtask?',
            response: (r: boolean) => {if (r) doDeleteTask(tID, true)},
            buttonTextCancel: 'Cancel',
            buttonTextConfirm: 'Delete',
        };
        modalStore.trigger(confirm);
    }

    async function doDeleteTask(tID: string, handleList: boolean = true) {
        if (!$currentUser) return;
        const t = $tasks.get(tID);
        if (t == undefined) return;

        if (handleList) {
            let cpList = t.subtasks;
            cpList.splice(cpList.indexOf(taskID), 1)
            await updateDoc(doc(db, "tasks", taskID), {
                subtasks: cpList
            }).catch((err) => {
                if (dev) console.log(err);
            });
        }
        await deleteDoc(doc(db, "tasks", tID)).catch((err) => {
            if (dev) console.log(err);
            return;
        });
    }
    
    // drag and drop

    function arrayify(value: Item) {
        return value.tid;
    }

    function handleConsider(e: CustomEvent<DndEvent>) {
		task.items = e.detail.items as ItemTask[];
	}

    async function handleFinalize(e: CustomEvent<DndEvent>) {
        if (!$currentUser) return;
        try {
            task.items = e.detail.items as ItemTask[];
            await updateDoc(doc(db, "tasks", taskID), {
                tasks: task.items.flatMap(arrayify)
            })
        } catch {
            task.items = $tasks.get(taskID)?.items ?? [];
        }
	}

    $: {
        pre = $tasks.get(taskID);
        if (pre != undefined) {
            task = pre;
        } else {
            goBackGroup();
        }
        console.log("DONE!")
    }
</script>

<div class="p-3  flex flex-col gap-2">
    <div>
        <h4><u>Task:</u> {task.task}</h4>
        <h4><u>Description:</u> {task.description}</h4>
    </div>
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={taskName} class="h-8" type="text" placeholder="Add new Subtask" required/>
        <button on:click={() => {createTask()}} class="variant-filled-surface" disabled={disabled}>Add</button>
    </form>
    <RadioGroup class="select-none">
        <RadioItem bind:group={show} name="show" value="all">All</RadioItem>
        <RadioItem bind:group={show} name="show" value="pending">Pending</RadioItem>
        <RadioItem bind:group={show} name="show" value="completed">Completed</RadioItem>
    </RadioGroup>
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div use:dndzone={{items: task.items, dragDisabled: !edit, dropTargetStyle: {}}}
    on:consider={handleConsider} on:finalize={handleFinalize}
    class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each task.items as subtask (subtask.id)}
        {@const t = $tasks.get(subtask.tid)}
        <div class:hidden={((t?.completed && show === "pending") || (!t?.completed && show === "completed"))} class="flex p-1 gap-3 w-full justify-between border-b-2 mb-1 border-surface-600">
            <div class="self-center w-auto">
                {#if edit}
                <Icon class="self-center" icon={barsIcon} />
                {:else}
                <input disabled={edit} on:click={() => {switchChecked(subtask.tid, t?.completed)}}
                checked={t?.completed} type="checkbox"
                class="rounded-full w-7 h-7 hover:brightness-[1.15] hover:bg-white checked:hover:bg-secondary-500
                checked:bg-secondary-500 checked:focus:bg-secondary-500" />
                {/if}
            </div>
            <div class="flex-grow min-w-0 self-center">
                <p class="unstyled text-lg truncate">{t?.task}</p>
            </div>
            {#if edit}
            <button on:click={() => {deleteTask(subtask.tid)}} class="text-error-500">
                <Icon class="self-center" height="20" icon={xmarkIcon} />
            </button>
            {/if}
        </div>
        {:else}
        <p class="text-center">No subtasks</p>
        {/each}
    </div>
</div>