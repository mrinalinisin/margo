<script lang="ts">
	import { editorStore } from '$lib/stores/editor';
	import type { CanvasLayer } from '$lib/types/editor';

	interface Props {
		onBringForward: (id: string) => void;
		onSendBackward: (id: string) => void;
		onVisibilityChange: (id: string, visible: boolean) => void;
		onDelete: (id: string) => void;
		onRemoveBg: (id: string) => void;
	}

	let { onBringForward, onSendBackward, onVisibilityChange, onDelete, onRemoveBg }: Props = $props();

	let renamingId = $state<string | null>(null);
	let renameValue = $state('');

	function startRename(layer: CanvasLayer) {
		renamingId = layer.id;
		renameValue = layer.name;
	}

	function commitRename(id: string) {
		const trimmed = renameValue.trim();
		if (trimmed) editorStore.renameLayer(id, trimmed);
		renamingId = null;
	}

	function onRenameKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter') commitRename(id);
		if (e.key === 'Escape') renamingId = null;
	}

	function handleVisibility(layer: CanvasLayer) {
		editorStore.toggleVisible(layer.id);
		onVisibilityChange(layer.id, !layer.visible);
	}
</script>

<aside class="layers-panel">
	<div class="panel-header">
		<span class="panel-title">Layers</span>
	</div>

	{#if $editorStore.layers.length === 0}
		<div class="empty-state">
			<p>No layers yet.</p>
			<p>Upload an image to begin.</p>
		</div>
	{:else}
		<ul class="layer-list" role="listbox" aria-label="Layers">
			{#each $editorStore.layers as layer (layer.id)}
				<li
					role="option"
					aria-selected={$editorStore.selectedLayerId === layer.id}
					class="layer-item"
					class:selected={$editorStore.selectedLayerId === layer.id}
					onclick={() => editorStore.selectLayer(layer.id)}
					onkeydown={(e) => e.key === 'Enter' && editorStore.selectLayer(layer.id)}
				>
					<!-- Visibility toggle -->
					<button
						class="icon-btn"
						title={layer.visible ? 'Hide layer' : 'Show layer'}
						onclick={(e) => { e.stopPropagation(); handleVisibility(layer); }}
					>
						{#if layer.visible}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
							</svg>
						{:else}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
								<line x1="1" y1="1" x2="23" y2="23"/>
							</svg>
						{/if}
					</button>

					<!-- Layer name -->
					<div class="layer-name-wrap">
						{#if renamingId === layer.id}
							<input
								class="rename-input"
								type="text"
								bind:value={renameValue}
								onblur={() => commitRename(layer.id)}
								onkeydown={(e) => onRenameKeydown(e, layer.id)}
								onclick={(e) => e.stopPropagation()}
								autofocus
							/>
						{:else}
							<span
								class="layer-name"
								role="button"
								tabindex="0"
								ondblclick={(e) => { e.stopPropagation(); startRename(layer); }}
								onkeydown={(e) => e.key === 'Enter' && startRename(layer)}
								title="Double-click to rename"
							>{layer.name}</span>
						{/if}
					</div>

					<!-- Remove background (images only) -->
					{#if layer.type === 'image'}
						<button
							class="icon-btn remove-bg-btn"
							class:spinning={$editorStore.processingLayerId === layer.id}
							title="Remove background"
							disabled={$editorStore.processingLayerId === layer.id}
							onclick={(e) => { e.stopPropagation(); onRemoveBg(layer.id); }}
						>
							{#if $editorStore.processingLayerId === layer.id}
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
									<path d="M21 12a9 9 0 11-6.219-8.56"/>
								</svg>
							{:else}
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="3" y="3" width="7" height="7" rx="1" stroke-dasharray="2 2"/>
									<rect x="14" y="3" width="7" height="7" rx="1" stroke-dasharray="2 2"/>
									<rect x="3" y="14" width="7" height="7" rx="1" stroke-dasharray="2 2"/>
									<path d="M14 14h7v7h-7z" fill="currentColor" opacity="0.2"/>
								</svg>
							{/if}
						</button>
					{/if}

					<!-- Z-order buttons -->
					<div class="layer-actions">
						<button class="icon-btn" title="Bring forward" onclick={(e) => { e.stopPropagation(); onBringForward(layer.id); }}>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M18 15l-6-6-6 6"/>
							</svg>
						</button>
						<button class="icon-btn" title="Send backward" onclick={(e) => { e.stopPropagation(); onSendBackward(layer.id); }}>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M6 9l6 6 6-6"/>
							</svg>
						</button>
						<button class="icon-btn danger" title="Delete layer" onclick={(e) => { e.stopPropagation(); onDelete(layer.id); }}>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
							</svg>
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</aside>

<style>
	.layers-panel {
		width: 220px;
		flex-shrink: 0;
		background: var(--color-parchment);
		border-left: 1px solid var(--color-parchment-border);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.panel-header {
		padding: 14px 14px 10px;
		border-bottom: 1px solid var(--color-parchment-border);
		flex-shrink: 0;
	}

	.panel-title {
		font-family: var(--font-serif);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-ink);
		letter-spacing: 0.02em;
	}

	.empty-state {
		padding: 24px 14px;
		color: var(--color-ink-muted);
		font-size: 12px;
		line-height: 1.6;
		text-align: center;
	}

	.layer-list {
		list-style: none;
		margin: 0;
		padding: 6px 0;
		overflow-y: auto;
		flex: 1;
	}

	.layer-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		cursor: pointer;
		border-radius: 0;
		transition: background 0.1s;
		border-left: 2px solid transparent;
	}

	.layer-item:hover {
		background: var(--color-parchment-dark);
	}

	.layer-item.selected {
		background: #f0e8dc;
		border-left-color: var(--color-terracotta);
	}

	.layer-name-wrap {
		flex: 1;
		min-width: 0;
	}

	.layer-name {
		display: block;
		font-size: 12px;
		color: var(--color-ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rename-input {
		width: 100%;
		font-size: 12px;
		font-family: var(--font-sans);
		background: var(--color-parchment-dark);
		border: 1px solid var(--color-terracotta);
		border-radius: 3px;
		padding: 1px 4px;
		outline: none;
		color: var(--color-ink);
	}

	.layer-actions {
		display: flex;
		gap: 2px;
		opacity: 0;
		transition: opacity 0.1s;
	}

	.layer-item:hover .layer-actions,
	.layer-item.selected .layer-actions {
		opacity: 1;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border: none;
		background: none;
		border-radius: 4px;
		color: var(--color-ink-mid);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.1s, color 0.1s;
	}

	.icon-btn:hover {
		background: var(--color-parchment-border);
		color: var(--color-ink);
	}

	.icon-btn.danger:hover {
		background: #fde8e8;
		color: #b91c1c;
	}

	.remove-bg-btn {
		opacity: 0;
		transition: opacity 0.1s, background 0.1s, color 0.1s;
	}

	.layer-item:hover .remove-bg-btn,
	.layer-item.selected .remove-bg-btn {
		opacity: 1;
	}

	.remove-bg-btn:disabled {
		opacity: 1;
		cursor: default;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.spin {
		animation: spin 0.8s linear infinite;
	}
</style>
