<script lang="ts">
  	import Login from "$lib/Login.svelte";
  	import { fade } from "svelte/transition";
  	import Home from "$lib/Home.svelte";
	import GetName from "$lib/GetName.svelte";
	import "@fontsource/allura";
  	import { page, updatePage } from "$lib/page";
  	import { currentUser } from "$lib/firebase";
  	import { onMount } from "svelte";
	
	let show = false;

	// intro: true workaround + waiting for firebase to find out the real user.
	onMount(() => {
		setTimeout(() => {
			show = true;
		}, 200);
	})
</script>

{#if show}
{#key $page}
<div in:fade={{delay:600, duration: 600}} out:fade={{duration: 600}} class="absolute top-0 left-0 h-screen w-screen">
	<div class="container h-screen mx-auto flex flex-col items-center justify-center">
		{#if $page === "getName"}
			<GetName />
		{:else if $page === "home"}
			<Home />
		{:else if $page === "login"}
			<Login />
		{/if}
	</div>
</div>
{/key}
{/if}