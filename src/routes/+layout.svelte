<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-modern.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
  	import { Modal, Toast } from '@skeletonlabs/skeleton';
	import "@fontsource/allura";
	import Header from '$lib/Header.svelte';
</script>

<svelte:head>
	<title>Todo</title>
	<script src="https://accounts.google.com/gsi/client"></script>
</svelte:head>

<div class="h-screen w-screen">
	<Header />
	<slot />
</div>

<Toast />
<Modal buttonPositive="variant-glass-error"/>