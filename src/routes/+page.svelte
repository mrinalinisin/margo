<script lang="ts">
	// Home — will show recent collages (Phase 1)
</script>

<svelte:head>
	<title>Margo</title>
</svelte:head>

<div class="home">
	<header class="home-header">
		<h1 class="wordmark">Margo</h1>
		<div class="header-actions">
			<a href="/about" class="about-link">About</a>
			<a href="/editor" class="new-btn">New collage</a>
		</div>
	</header>

	<div class="empty-state">
		<p class="empty-title">No collages yet</p>
		<p class="empty-sub">Create your first collage to get started.</p>
		<a href="/editor" class="new-btn">New collage</a>
	</div>
</div>

<style>
	.home {
		min-height: 100vh;
		background: var(--color-parchment);
		display: flex;
		flex-direction: column;
	}

	.home-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 32px;
		border-bottom: 1px solid var(--color-parchment-border);
	}

	.wordmark {
		font-family: var(--font-serif);
		font-size: 26px;
		font-weight: 500;
		color: var(--color-ink);
		margin: 0;
		letter-spacing: 0.02em;
	}

	.new-btn {
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
		background: var(--color-terracotta);
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		text-decoration: none;
		transition: background 0.15s;
	}

	.new-btn:hover {
		background: var(--color-terracotta-light);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.about-link {
		font-family: var(--font-sans);
		font-size: 13px;
		color: var(--color-ink-mid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.about-link:hover {
		color: var(--color-ink);
	}

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 48px;
	}

	.empty-title {
		font-family: var(--font-serif);
		font-size: 22px;
		font-weight: 500;
		color: var(--color-ink);
		margin: 0;
	}

	.empty-sub {
		font-size: 14px;
		color: var(--color-ink-muted);
		margin: 0 0 8px;
	}
</style>
