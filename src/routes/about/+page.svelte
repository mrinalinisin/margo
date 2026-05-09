<svelte:head>
	<title>About — Margo</title>
</svelte:head>

<div class="about">
	<a href="/" class="back-btn">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M19 12H5M12 5l-7 7 7 7"/>
		</svg>
	</a>
	<p class="tagline">Made with lots of tokens by Mrinalini S and Claude</p>
</div>

<style>
	.about {
		min-height: 100vh;
		background: var(--color-parchment);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.back-btn {
		position: fixed;
		top: 20px;
		left: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		color: var(--color-ink-mid);
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
	}

	.back-btn:hover {
		background: var(--color-parchment-dark);
		color: var(--color-ink);
	}

	.tagline {
		font-family: var(--font-serif);
		font-size: 22px;
		font-weight: 400;
		font-style: italic;
		color: var(--color-ink);
		margin: 0;
		letter-spacing: 0.01em;
	}
</style>
