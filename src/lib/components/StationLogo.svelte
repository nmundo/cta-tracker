<script lang="ts">
	import { fly } from 'svelte/transition'
	import { LINES } from '../constants'

	const {
		staNm,
		lines,
		changeStation
	}: { staNm: string; lines: LineKey[]; changeStation: () => void } = $props()
</script>

<div class="container" in:fly={{ x: 50, duration: 200 }} out:fly={{ y: 70, duration: 200 }}>
	<button type="button" onclick={changeStation}>
		<div class="info">
			<div class="letter">{staNm.charAt(0)}</div>
		</div>
		<div class="colors">
			{#each lines as line (line)}
				<div class="color-bar" style="background-color: {LINES[line].hex};"></div>
			{/each}
		</div>
	</button>
	<div class="label">{staNm}</div>
</div>

<style>
	.container {
		display: inline-block;
		text-align: center;
		width: 100px;
	}

	button {
		width: 100px;
		height: 75px;
		flex-shrink: 0;
		border-radius: 6px;
		display: flex;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		background: var(--card-bg);
		border: 1px solid var(--muted-border);
		backdrop-filter: blur(12px) saturate(150%);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
		position: relative;
		overflow: hidden;
		cursor: pointer;
	}

	button:hover {
		transform: scale(1.1);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
	}

	.info {
		background-color: var(--station-info-bg);
		width: 60%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 20px;
		color: var(--station-letter-color);
	}
	.letter {
		font-size: 40px;
		font-weight: bold;
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
		width: 40%;
		display: flex;
		flex-direction: column;
	}

	.color-bar:first-of-type {
		border-top: 0;
	}

	.color-bar:last-of-type {
		border-bottom: 0;
	}

	.label {
		margin-top: 8px;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}
</style>
