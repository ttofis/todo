<script lang="ts">
    import Icon from '@iconify/svelte';
    import angleDown from '@iconify/icons-fa6-solid/angle-down';

    export let group: any;
    let taskName = "";
</script>

<div class="p-3">
    <form on:submit|preventDefault class="input-group input-group-divider grid-cols-[1fr_auto] focus-within:border-secondary-500">
        <input bind:value={taskName} class="h-8" type="search" placeholder="Add new Task" required/>
        <button on:click={() => {console.log("HELLO")}} class="variant-filled-surface">Add</button>
    </form>
</div>
<div class="border w-full border-white/20" />
<div class="mr-1 mb-3 mt-1 overflow-hidden relative flex-grow">
    <div class="p-3 overflow-y-auto overflow-x-clip absolute inset-0 w-full">
        {#each group.tasks as task, i (i)}
        <div class="flex p-1 gap-3 w-full justify-between border-b border-white/20">
            <div class="self-center w-auto">
                <input type="checkbox" class="rounded-full w-7 h-7 hover:brightness-[1.15] hover:bg-secondary-500 checked:hover:bg-secondary-500 checked:bg-secondary-500 checked:focus:bg-secondary-500" />
            </div>
            <div class="flex-grow min-w-0 self-center">
                <p class="unstyled text-lg truncate">{task.data.task}</p>
                <p class="unstyled text-sm truncate">{task.data.description}</p>
            </div>
            <button class="self-center"><Icon height="20" icon={angleDown} /></button>
        </div>
        {:else}
        <p class="text-center">No tasks! Congrats!</p>
        {/each}
    </div>
</div>