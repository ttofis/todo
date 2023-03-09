<script lang="ts">
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import Icon from '@iconify/svelte';
    import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
    import { flip } from 'svelte/animate';
    import { currentUser, db } from './firebase';
    import { dndzone } from 'svelte-dnd-action';
    import barsIcon from '@iconify/icons-fa6-solid/bars';

    export let groups: Map<string, any>;
    export let gList: string[];
    let groupName = "";
    let disabled = false;
    export let switchGroup: any;
    export let edit: boolean;

    let ItemList: Item[];

    async function createGroup() {
        if (groupName === "") return;
        if (!$currentUser) return;
        disabled = true;
        const newGroup = await addDoc(collection(db, "users", $currentUser.uid, "task_groups"), {
            name: groupName,
            tasks: []
        })
        let tempGroupList = gList;
        tempGroupList.push(newGroup.id);
        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: tempGroupList
        })
        disabled = false;
        groupName = "";
    }

    async function switchBetween(a: number, b: number) {
        if (!$currentUser) return;
        let tempGroupList = gList;
        
        let tmp = tempGroupList[a];
        tempGroupList[a] = tempGroupList[b];
        tempGroupList[b] = tmp;

        await updateDoc(doc(db, "users", $currentUser.uid), {
            group_list: tempGroupList
        })
    }

    const flipDurationMs = 200

    // drag and drop

    function itemify(value: string) {
        return {id: value, gid: value};
    }

    function handleConsider(e: CustomEvent<DndEvent>) {
		ItemList = e.detail.items;
	}

    function handleFinalize(e: CustomEvent<DndEvent>) {
		ItemList = e.detail.items;
	}

    $: {
        ItemList = gList.map(itemify);
    }
</script>

<div class="p-3">
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={groupName} class="h-8" type="search" placeholder="Add new Group" required/>
        <button on:click={() => {createGroup()}} class="variant-filled-surface" disabled={disabled || edit}>Add</button>
    </form>
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div use:dndzone={{items: ItemList, dragDisabled: !edit, flipDurationMs, dropTargetStyle: {}}}
    on:consider={handleConsider} on:finalize={handleFinalize}
    class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each ItemList as group (group.id)}
            <button animate:flip={{duration: flipDurationMs}}
            on:click={() => {if (!edit) switchGroup(group.gid)}}
            class:card-hover={!edit} class="w-full mb-1 card variant-soft-tertiary p-3 flex justify-between">
                <div class="self-center">
                    <h4 class="truncate text-left">{groups.get(group.gid).name}</h4>
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