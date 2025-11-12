<script lang="ts">
	import { LINES } from '$lib/constants'

	const { staNm, lines }: { staNm: string; lines: LineKey[] } = $props()
</script>

<div class="container">
	<div class="info">
		<div class="name">{staNm}</div>
	</div>
	<div class="colors">
		{#each lines as line}
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
		width: calc(100% - 60px);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: var(--station-letter-color);
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
</style>
