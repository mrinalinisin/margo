<script lang="ts">
	import { editorStore } from '$lib/stores/editor';
	import type { Tool } from '$lib/types/editor';

	interface Props {
		onUploadImage: (file: File) => void;
	}

	let { onUploadImage }: Props = $props();

	let fileInput: HTMLInputElement;

	function setTool(tool: Tool) {
		editorStore.setTool(tool);
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			onUploadImage(file);
			input.value = '';
		}
	}
</script>

<aside class="tool-panel">
	<button
		class="tool-btn"
		class:active={$editorStore.activeTool === 'select'}
		onclick={() => setTool('select')}
		title="Select (V)"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<path d="M5 3l14 9-7 1-4 7z"/>
		</svg>
	</button>

	<button
		class="tool-btn"
		onclick={() => fileInput.click()}
		title="Upload Image"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
			<path d="M21 15l-5-5L5 21"/>
		</svg>
	</button>

	<button
		class="tool-btn"
		class:active={$editorStore.activeTool === 'text'}
		onclick={() => setTool('text')}
		title="Text (T)"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<path d="M4 7V4h16v3M9 20h6M12 4v16"/>
		</svg>
	</button>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		style="display:none"
		onchange={handleFileChange}
	/>
</aside>

<style>
	.tool-panel {
		width: 56px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 0;
		background: var(--color-parchment);
		border-right: 1px solid var(--color-parchment-border);
		flex-shrink: 0;
	}

	.tool-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: none;
		border-radius: 8px;
		color: var(--color-ink-mid);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.tool-btn:hover {
		background: var(--color-parchment-dark);
		color: var(--color-ink);
	}

	.tool-btn.active {
		background: var(--color-terracotta);
		color: white;
	}
</style>
