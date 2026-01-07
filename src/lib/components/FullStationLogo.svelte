<script lang="ts">
	import { fly } from 'svelte/transition'
	import { LINES } from '$lib/constants'

	const { staNm, lines }: { staNm: string; lines: LineKey[] } = $props()

	let previousSta = staNm

	// $effect(() => {
	// 	if (staNm !== previousSta && document.startViewTransition) {
	// 		document.startViewTransition(() => {
	// 			previousSta = staNm
	// 		})
	// 	} else {
	// 		previousSta = staNm
	// 	}
	// })
</script>

<div class="container" in:fly={{ y: -15, duration: 200, delay: 120 }}>
	<div class="info">
		<div class="name">{staNm}</div>
	</div>
	<div class="colors">
		{#each lines as line (line)}
			<div class="color-bar" style="background-color: {LINES[line].hex};"></div>
		{/each}
	</div>
</div>

<style>
	.container {
		min-width: 100px;
		width: max-content;
		height: 50px;
		border-radius: 6px;
		display: flex;
		border: 1px solid var(--muted-border);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}
	.info {
		background-color: var(--station-info-bg);
		padding: 10px 20px;
		/* width: calc(100% - 60px); */
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: var(--station-letter-color);
		transition: width 300ms ease;
	}
	.name {
		font-size: 20px;
		font-weight: 500;
		margin: 0;
		line-height: 1;
	}

	.color-bar {
		flex: 1;
		border: 1px solid var(--color-bar-border);
		border-left: 2px solid var(--color-bar-border);
		border-right: 0;
		animation: growbars 400ms ease-out forwards;
	}

	.colors {
		width: 60px;
		display: flex;
		flex-direction: column;
	}

	.color-bar:first-of-type {
		border-top: 0;
	}

	.color-bar:last-of-type {
		border-bottom: 0;
	}

	::view-transition-old(station-logo) {
		animation: fade-scale-out 250ms ease forwards;
	}

	::view-transition-new(station-logo) {
		animation: fade-scale-in 250ms ease forwards;
	}

	@keyframes fade-scale-out {
		from {
			opacity: 1;
			/*transform: scale(1);*/
		}
		to {
			opacity: 0;
			/*transform: scale(0.92);*/
		}
	}

	@keyframes fade-scale-in {
		from {
			opacity: 0;
			/*transform: scale(1.06);*/
		}
		to {
			opacity: 1;
			/*transform: scale(1);*/
		}
	}

	@keyframes growbars {
		from {
			height: 0;
			opacity: 0;
		}
		to {
			height: 100%;
			opacity: 1;
		}
	}
</style>
