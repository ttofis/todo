<script>
    import Title from "$lib/Title.svelte";
	import { currentUser } from "$lib/firebase";
	import { updatePage } from "$lib/page";
</script>
<div class="self-start w-full flex justify-center">
	<button on:click={() => {updatePage($currentUser)}}>
		<Title />
	</button>
</div>