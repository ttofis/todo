<script lang="ts">
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import angleDown from '@iconify/icons-fa6-solid/angle-down';
    import angleUp from '@iconify/icons-fa6-solid/angle-up';
    import Icon from '@iconify/svelte';
    import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
    import { flip } from 'svelte/animate';
    import { currentUser, db } from './firebase';

    export let groups: Map<string, any>;
    export let gList: string[];
    let groupName = "";
    let disabled = false;
    export let switchGroup: any;
    export let edit: boolean;

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
</script>

<div class="p-3">
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={groupName} class="h-8" type="search" placeholder="Add new Group" required/>
        <button on:click={() => {createGroup()}} class="variant-filled-surface" disabled={disabled || edit}>Add</button>
    </form>
</div>
<hr class="!border-t-2" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each gList as group, index (group)}
            <button animate:flip on:click={() => {if (!edit) switchGroup(group)}} class:card-hover={!edit} class="w-full mb-1 card variant-glass-tertiary p-3 flex justify-between">
                <div class="self-center">
                    <h4 class="truncate text-left">{groups.get(group).name}</h4>
                </div>
                <div class="self-center flex gap-3">
                    {#if edit}
                    {#if index < gList.length-1}<button on:click={() => switchBetween(index, index+1)}><Icon icon={angleDown} /></button>{/if}
                    {#if index > 0}<button on:click={() => switchBetween(index, index-1)}><Icon icon={angleUp} /></button>{/if}
                    {:else}
                    <Icon icon={angleRight} />
                    {/if}
                </div>
            </button>
        {:else}
            <p class="text-center">You have no groups! Create a new one</p>
        {/each}
    </div>
</div>