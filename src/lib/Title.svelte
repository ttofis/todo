<script lang="ts">
	import "@fontsource/allura";
</script>

<svg stroke="#FFFFFF" stroke-width="1" class="text-line h-20" width="100%"><text x="50%" dominant-baseline="middle" text-anchor="middle" y="70%">Todo</text></svg>

<style>
	.text-line {
		stroke-dasharray: 500;
		stroke-dashoffset: 500;
		animation: dash 3s ease-in forwards, filling 3s ease-in forwards;
		font-size: 80px;
	}

	.text-line text {
		font-family: "Allura", cursive;
        font-weight: normal;
        font-style: normal;
	}

	@keyframes dash {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes filling {
		0%, 90% { fill: rgba(var(--color-tertiary-50)); fill-opacity: 0; }
		100% { fill: rgba(var(--color-tertiary-50)); fill-opacity: 1; }
	}
</style>