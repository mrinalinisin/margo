<script lang="ts">
	import { editorStore } from '$lib/stores/editor';

	interface Props {
		onUndo: () => void;
		onRedo: () => void;
		onExport: () => void;
	}

	let { onUndo, onRedo, onExport }: Props = $props();

	let editingTitle = $state(false);
	let titleInput = $state('');

	function startEditTitle() {
		titleInput = $editorStore.collageTitle;
		editingTitle = true;
	}

	function commitTitle() {
		const trimmed = titleInput.trim();
		if (trimmed) editorStore.setTitle(trimmed);
		editingTitle = false;
	}

	function onTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitTitle();
		if (e.key === 'Escape') editingTitle = false;
	}
</script>

<header class="topbar">
	<div class="topbar-left">
		<a href="/" class="back-btn" title="Back to library">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M19 12H5M12 5l-7 7 7 7"/>
			</svg>
		</a>
	</div>

	<div class="topbar-center">
		{#if editingTitle}
			<input
				class="title-input"
				type="text"
				bind:value={titleInput}
				onblur={commitTitle}
				onkeydown={onTitleKeydown}
				autofocus
			/>
		{:else}
			<button class="title-btn" onclick={startEditTitle}>
				{$editorStore.collageTitle}
			</button>
		{/if}
	</div>

	<div class="topbar-right">
		<button
			class="action-btn"
			onclick={onUndo}
			disabled={!$editorStore.canUndo}
			title="Undo (⌘Z)"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
			</svg>
		</button>
		<button
			class="action-btn"
			onclick={onRedo}
			disabled={!$editorStore.canRedo}
			title="Redo (⌘⇧Z)"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/>
			</svg>
		</button>
		<div class="divider"></div>
		<button class="export-btn" onclick={onExport}>
			Export PNG
		</button>
	</div>
</header>

<style>
	.topbar {
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		background: var(--color-parchment);
		border-bottom: 1px solid var(--color-parchment-border);
		flex-shrink: 0;
	}

	.topbar-left,
	.topbar-right {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 180px;
	}

	.topbar-right {
		justify-content: flex-end;
	}

	.topbar-center {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.back-btn {
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

	.title-btn {
		font-family: var(--font-serif);
		font-size: 18px;
		font-weight: 500;
		color: var(--color-ink);
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 10px;
		border-radius: 6px;
		letter-spacing: 0.01em;
		transition: background 0.15s;
	}

	.title-btn:hover {
		background: var(--color-parchment-dark);
	}

	.title-input {
		font-family: var(--font-serif);
		font-size: 18px;
		font-weight: 500;
		color: var(--color-ink);
		background: var(--color-parchment-dark);
		border: 1px solid var(--color-terracotta);
		border-radius: 6px;
		padding: 3px 10px;
		outline: none;
		min-width: 200px;
		text-align: center;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		border-radius: 6px;
		color: var(--color-ink-mid);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--color-parchment-dark);
		color: var(--color-ink);
	}

	.action-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.divider {
		width: 1px;
		height: 20px;
		background: var(--color-parchment-border);
		margin: 0 4px;
	}

	.export-btn {
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
		background: var(--color-terracotta);
		color: white;
		border: none;
		border-radius: 6px;
		padding: 7px 14px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.export-btn:hover {
		background: var(--color-terracotta-light);
	}
</style>
