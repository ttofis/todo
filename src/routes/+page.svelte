<script lang="ts">
  	import Title from "$lib/Title.svelte";
  	import Login from "$lib/Login.svelte";
  	import { fade } from "svelte/transition";
  	import Home from "$lib/Home.svelte";
	import GetName from "$lib/GetName.svelte";
	import "@fontsource/allura";
  	import { page, pageHome } from "$lib/page";
  	import { onMount } from "svelte";
  	import ForgotPassword from "$lib/ForgotPassword.svelte";

	let logo = true;

	onMount(() => {
		setTimeout(() => {logo = false}, 1000);
	});
</script>

{#if logo}
<div out:fade={{duration: 600}} class="container h-screen mx-auto flex flex-col items-center justify-center">
	<Title />
</div>
{:else}
<div in:fade={{delay:600, duration: 600}} class="container mx-auto flex flex-col items-center justify-center h-screen">
	{#if $page === "getName"}
		<div in:fade={{delay:600, duration: 600}} out:fade={{duration: 500}} class="absolute mx-10">
			<GetName />
		</div>
	{:else if $page === "home"}
		<div in:fade={{delay:600, duration: 600}} out:fade={{duration: 500}} class="absolute top-0 bottom-0 h-screen flex flex-col">
			<button class="unstyled w-full" on:click={pageHome}><h1 class="unstyled text-7xl h-auto mt-2 todo text-center">Todo</h1></button>
			<Home />
		</div>
	{:else if $page === "forgotPassword"}
		<div in:fade={{delay:600, duration: 600}} out:fade={{duration: 500}} class="absolute mx-10">
			<button class="unstyled w-full" on:click={pageHome}><h1 class="unstyled text-7xl h-auto mt-2 todo text-center">Todo</h1></button>
			<ForgotPassword />
		</div>
	{:else}
		<div in:fade={{delay:600, duration: 600}} out:fade={{duration: 500}} class="absolute mx-10">
			<button class="unstyled w-full" on:click={pageHome}><h1 class="unstyled text-7xl h-auto mt-2 todo text-center">Todo</h1></button>
			<Login />
		</div>
	{/if}
</div>
{/if}

<style>
	.todo {
		font-family: "Allura", cursive;
        font-weight: normal;
        font-style: normal;
	}
</style>
