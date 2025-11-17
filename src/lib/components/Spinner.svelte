<script lang="ts">
	import { onDestroy } from 'svelte'

	const { children, spin } = $props()

	let angle = $state(0)
	let spinning = $state(false)

	let animationFrame: number | null = $state(null)
	let startTime: number | null = $state(null)

	const startSpinning = () => {
		spinning = true
		const tick = () => {
			angle = (angle + 6) % 360
			animationFrame = requestAnimationFrame(tick)
		}
		tick()
	}
	$effect(() => {
		$inspect(angle)
	})

	const stopSpinning = () => {
		spinning = false
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame)
			animationFrame = null
		}

		const start = angle
		const end = 360
		const duration = 500
		startTime = null

		const animateToEnd = (ts: DOMHighResTimeStamp) => {
			if (!startTime) startTime = ts
			const elapsed = ts - startTime
			const progress = Math.min(elapsed / duration, 1)
			const current = (end - start) * progress
			angle = current
			if (elapsed < duration) {
				animationFrame = requestAnimationFrame(animateToEnd)
			} else {
				angle = 0
				animationFrame = null
			}
		}
		animationFrame = requestAnimationFrame(animateToEnd)
	}

	$effect(() => {
		if (spin && !spinning) {
			startSpinning()
		} else if (!spin && spinning) {
			stopSpinning()
		}
	})

	onDestroy(() => {
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame)
		}
	})
</script>

<div style="transform: rotate({angle}deg);">
	{@render children()}
</div>
