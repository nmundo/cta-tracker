<script lang="ts">
	import Spinner from './Spinner.svelte'

	const { isFav, loading, toggleFav, refresh } = $props<{
		isFav: boolean
		loading: boolean
		toggleFav: () => void
		refresh: () => void
	}>()
</script>

<div class="btn-container">
	<button type="button" class="refresh-btn" title="Refresh" onclick={refresh}>
		<Spinner spin={loading}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<!-- refresh icon -->
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
				/>
			</svg>
		</Spinner>
	</button>

	<button
		type="button"
		class="favorite-btn"
		title={isFav ? 'Remove from favorites' : 'Add to favorites'}
		onclick={toggleFav}
	>
		{#if isFav}
			<!-- Crossed out bookmark -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5"
				/>
			</svg>
		{:else}
			<!-- bookmark outline -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
				/>
			</svg>
		{/if}
	</button>
</div>

<style>
	.btn-container {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
	}

	.favorite-btn,
	.refresh-btn {
		align-items: center;
		border-radius: 9999px;
		cursor: pointer;
		display: inline-flex;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		transition: transform 0.15s ease;
		background: var(--card-bg);
		border: 1px solid var(--muted-border);
		backdrop-filter: blur(12px) saturate(150%);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	}

	.favorite-btn:hover,
	.refresh-btn:hover {
		transform: scale(1.05);
	}

	.favorite-btn:focus,
	.refresh-btn:focus {
		outline: none;
		box-shadow:
			0 0 0 2px var(--accent),
			0 0 0 4px var(--accent);
	}

	.favorite-btn:active,
	.refresh-btn:active {
		transform: scale(0.95);
	}

	.size-6 {
		width: 24px;
		height: 24px;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
