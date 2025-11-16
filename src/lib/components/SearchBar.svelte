<script lang="ts">
	import { LINES } from '$lib/constants'

	const { data, onSelect }: { data: StationStop[]; onSelect: (item: string) => void } = $props()

	let query = $state('')
	let suggestions = $state<StationStop[]>([])
	let activeIndex = $state(-1)
	let showSuggestions = $state(false)
	let debounceTimeout: NodeJS.Timeout
	let suggestionsTop = $state(0)
	let suggestionsLeft = $state(0)
	let containerRef: HTMLDivElement | undefined = $state()
	let inputRef: HTMLInputElement | undefined = $state()

	const updateDropdownPosition = () => {
		if (containerRef) {
			const rect = containerRef.getBoundingClientRect()
			suggestionsTop = rect.bottom + window.scrollY + 8
			suggestionsLeft = rect.left + window.scrollX
		}
	}

	const handleInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value
		query = value
		clearTimeout(debounceTimeout)

		debounceTimeout = setTimeout(() => {
			if (value.trim().length === 0) {
				suggestions = []
				showSuggestions = false
				activeIndex = -1
				return
			}
			suggestions = data.filter((item) =>
				item.station_descriptive_name.toLowerCase().includes(value.toLowerCase())
			)
			showSuggestions = suggestions.length > 0
			activeIndex = -1
		}, 200)
	}

	const handleKeydown = (e: KeyboardEvent) => {
		// Keep focus on input and use aria-activedescendant to announce the active option.
		// Open suggestions when ArrowDown pressed.
		if (e.key === 'ArrowDown') {
			if (!showSuggestions && suggestions.length > 0) {
				showSuggestions = true
				activeIndex = 0
				e.preventDefault()
				updateDropdownPosition()
				return
			}
			if (showSuggestions && suggestions.length > 0) {
				activeIndex = (activeIndex + 1 + suggestions.length) % suggestions.length
				e.preventDefault()
			}
		} else if (e.key === 'ArrowUp') {
			if (showSuggestions && suggestions.length > 0) {
				activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length
				e.preventDefault()
			}
		} else if (e.key === 'Home') {
			if (showSuggestions && suggestions.length > 0) {
				activeIndex = 0
				e.preventDefault()
			}
		} else if (e.key === 'End') {
			if (showSuggestions && suggestions.length > 0) {
				activeIndex = suggestions.length - 1
				e.preventDefault()
			}
		} else if (e.key === 'Enter') {
			if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
				e.preventDefault()
				selectSuggestion(suggestions[activeIndex])
			}
		} else if (e.key === 'Escape') {
			if (showSuggestions) {
				showSuggestions = false
				activeIndex = -1
				e.preventDefault()
			}
		}
	}

	const selectSuggestion = (item: StationStop) => {
		query = item.station_descriptive_name
		showSuggestions = false
		suggestions = []
		activeIndex = -1
		// Move focus back to input (helps screen reader context)
		inputRef?.focus()
		onSelect(item.map_id)
	}

	const clearQuery = () => {
		query = ''
		suggestions = []
		showSuggestions = false
		activeIndex = -1
		inputRef?.focus()
	}
</script>

<div class="search-wrapper">
	<div
		class="search-container relative"
		bind:this={containerRef}
		onmouseenter={updateDropdownPosition}
		role="search"
	>
		<label for="search-input" id="search-label" class="sr-only">Search for CTA station</label>

		<svg
			class="search-icon pointer-events-none absolute left-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
			/>
		</svg>

		<input
			id="search-input"
			type="text"
			bind:value={query}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder="Search for a station..."
			class="glass-input pr-12 pl-12"
			autocomplete="off"
			aria-autocomplete="list"
			aria-controls="suggestions-list"
			aria-expanded={showSuggestions}
			aria-labelledby="search-label"
			aria-haspopup="listbox"
			aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex]
				? `suggestion-${suggestions[activeIndex].map_id}`
				: undefined}
			role="combobox"
			bind:this={inputRef}
		/>

		{#if query.length > 0}
			<button
				type="button"
				class="clear-button absolute right-4"
				onclick={clearQuery}
				aria-label="Clear search"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	{#if showSuggestions}
		<ul
			id="suggestions-list"
			class="suggestions-list"
			role="listbox"
			aria-labelledby="search-label"
			style="top: {suggestionsTop}px; left: {suggestionsLeft}px; width: {containerRef?.offsetWidth ||
				'auto'}px"
		>
			{#each suggestions as suggestion, i (suggestion.map_id)}
				<li
					id={'suggestion-' + suggestion.map_id}
					class="suggestion-item {i === activeIndex ? 'active' : ''}"
					onmousedown={() => selectSuggestion(suggestion)}
					onmouseover={() => (activeIndex = i)}
					onfocus={() => (activeIndex = i)}
					role="option"
					aria-selected={i === activeIndex}
				>
					<div class="flex w-full items-center justify-between">
						<span>{suggestion.station_descriptive_name}</span>
						<div class="flex gap-1" aria-hidden="true">
							{#each suggestion.lines as line (line)}
								<div
									class="h-3 w-3 rounded-full"
									style="background-color: {LINES[line as LineKey].hex};"
									title={LINES[line as LineKey].name}
								></div>
							{/each}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	<!-- SR-only live region for announcement of suggestions -->
	<div class="sr-only" role="status" aria-live="polite">
		{#if showSuggestions}
			{suggestions.length} {suggestions.length === 1 ? 'result' : 'results'} available
		{:else if query.length > 0}
			No results
		{/if}
	</div>
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.search-wrapper {
		position: relative;
		width: 100%;
	}

	.search-container {
		width: 100%;
		max-width: 600px;
		position: relative;
		background: var(--search-bg);
		border-radius: 24px;
		box-shadow:
			inset 0 0 8px rgba(255 255 255 / 0.1),
			0 4px 20px rgba(0 0 0 / 0.15);
		backdrop-filter: blur(14px);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		z-index: 1;
	}

	.search-container:focus-within {
		box-shadow:
			inset 0 0 12px rgba(255 255 255 / 0.2),
			0 4px 20px rgba(0 0 0 / 0.15);
	}

	.glass-input {
		width: 100%;
		padding: 0.75rem 3rem;
		border: none;
		border-radius: 9999px;
		background: transparent;
		color: var(--input-text);
		font-size: 1.125rem;
		outline-offset: 2px;
		outline: 2px solid transparent;
		transition:
			color 0.3s ease,
			outline 0.1s linear;
	}

	.glass-input::placeholder {
		color: var(--placeholder);
		transition: color 0.3s ease;
	}

	.glass-input:focus {
		color: var(--input-text);
		outline: 2px solid var(--accent);
	}

	.search-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--placeholder);
		top: 50%;
		transform: translateY(-50%);
		transition: color 0.3s ease;
	}

	.search-container:focus-within .search-icon {
		color: var(--accent);
	}

	.clear-button {
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--placeholder);
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.3s ease;
		top: 50%;
		transform: translateY(-50%);
	}

	.clear-button:hover {
		color: var(--accent);
	}

	.suggestions-list {
		position: fixed;
		z-index: 50;
		top: auto;
		left: 0;
		width: 100%;
		max-height: 20rem;
		overflow-y: auto;
		border-radius: 1rem;
		background: var(--glass-bg);
		backdrop-filter: blur(16px);
		border: 1px solid var(--muted-border);
		box-shadow: 0 8px 32px rgba(0 0 0 / 0.2);
		animation: fadeIn 0.25s ease forwards;
		scrollbar-width: thin;
		scrollbar-color: rgba(255 255 255 / 0.3) transparent;
	}

	.suggestion-item {
		margin: 0.25rem;
		padding: 0.6rem 1.5rem;
		cursor: pointer;
		border-radius: 0.9rem;
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease,
			color 0.3s ease;
		color: var(--text);
		font-weight: 500;
		border: 1px solid rgba(0, 0, 0, 0);
	}

	.suggestion-item:hover,
	.suggestion-item.active {
		background-color: rgba(200, 200, 200, 0.3);
		color: var(--text);
		box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.15);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
