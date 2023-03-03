<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-modern.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
  	import { Toast } from '@skeletonlabs/skeleton';
	import "@fontsource/allura";
</script>

<svelte:head>
	<title>Todo</title>
</svelte:head>

<slot />

<Toast />