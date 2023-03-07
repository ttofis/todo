<script lang="ts">
    import angleRight from '@iconify/icons-fa6-solid/angle-right';
    import Icon from '@iconify/svelte';

    export let groups: any;
    let groupName = "";
    
    export let switchGroup: any;
</script>

<div class="p-3">
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={groupName} class="h-8" type="search" placeholder="Add new Group" required/>
        <button on:click={() => {console.log("HELLO")}} class="variant-filled-surface">Add</button>
    </form>
</div>
<div class="border w-full border-white/20" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each groups as group, index}
            <button on:click={() => {switchGroup(index)}} class="w-full card variant-glass-surface p-3 flex justify-between">
                <div class="self-center">
                    <h4 class="truncate text-left">{group.name}</h4>
                    <p class="font-normal">Remaining: {group.remaining}</p>
                </div>
                <div class="self-center">
                    <Icon icon={angleRight} />
                </div>
            </button>
        {:else}
            <p class="text-center">You have no groups! Create a new one</p>
        {/each}
    </div>
</div>