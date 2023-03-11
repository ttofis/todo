<script lang="ts">
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import Icon from '@iconify/svelte';
    import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
    import { currentUser, db, groupItems, userData, groups } from './firebase';
    import { dndzone } from 'svelte-dnd-action';
    import barsIcon from '@iconify/icons-fa6-solid/bars';
    import type { ItemTaskGroup } from './types/data';

    let groupName = "";
    let disabled = false;
    export let switchGroup: any;
    export let edit: boolean;

    let play = $groupItems;

    async function createGroup() {
        if (groupName.length < 1 || groupName.length > 30) return;
        if (!$currentUser) return;
        disabled = true;
        const newGroup = await addDoc(collection(db, "users", $currentUser.uid, "task_groups"), {
            name: groupName,
            tasks: []
        })
        let tempGroupList = $userData.group_list;
        tempGroupList.push(newGroup.id);
        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: tempGroupList
        })
        disabled = false;
        groupName = "";
    }

    // drag and drop

    function itemify(value: string) {
        return {id: value, gid: value};
    }

    function arrayify(value: Item) {
        return value.gid;
    }

    function handleConsider(e: CustomEvent<DndEvent>) {
		play = e.detail.items as ItemTaskGroup[];
	}

    async function handleFinalize(e: CustomEvent<DndEvent>) {
        if (!$currentUser) return;
        try {
            play = e.detail.items as ItemTaskGroup[];
            await updateDoc(doc(db, "users", $currentUser.uid), {
                group_list: play.flatMap(arrayify)
            })
        } catch {
            play = $groupItems;
        }
	}

    $: {
        play = $groupItems;
    }
</script>

<div class="p-3">
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500 mb-2">
        <input bind:value={groupName} class="h-8" type="text" placeholder="Add new Group" maxlength="30" disabled={disabled || edit} required/>
        <button on:click={() => {createGroup()}} class="variant-filled-surface" disabled={disabled || edit}>Add</button>
    </form>
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div use:dndzone={{items: play, dragDisabled: !edit, dropTargetStyle: {}}}
    on:consider={handleConsider} on:finalize={handleFinalize}
    class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each play as group (group.id)}
        {@const g = $groups.get(group.gid)}
            <button
            on:click={() => {if (!edit) switchGroup(group.id)}}
            class:card-hover={!edit} class="w-full mb-1 card variant-soft-tertiary p-3 flex justify-between">
                <div class="self-center">
                    <h4 class="truncate text-left">{g?.name}</h4>
                </div>
                <div class="self-center flex gap-3">
                    {#if !edit}
                    <Icon icon={angleRight} />
                    {:else}
                    <Icon icon={barsIcon} />
                    {/if}
                </div>
            </button>
        {:else}
            <p class="text-center">You have no groups! Create a new one</p>
        {/each}
    </div>
</div>