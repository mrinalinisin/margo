<script lang="ts">
	import { page } from '$app/stores';
	import TopBar from '$lib/components/editor/TopBar.svelte';
	import ToolPanel from '$lib/components/editor/ToolPanel.svelte';
	import Canvas from '$lib/components/editor/Canvas.svelte';
	import LayersPanel from '$lib/components/editor/LayersPanel.svelte';
	import TheoTray from '$lib/components/editor/TheoTray.svelte';
	import { editorStore } from '$lib/stores/editor';
	import { onMount } from 'svelte';

	let canvas: Canvas;

	// ── Theo import tray ──────────────────────────────────────────
	interface TheoProduct {
		id: number;
		name: string;
		store: string;
		image_url: string | null;
		images: string[];
		tags: string[];
	}

	let theoProducts = $state<TheoProduct[]>([]);
	let theoLoading = $state(false);
	let showTheoTray = $state(false);

	onMount(async () => {
		const fromParam = $page.url.searchParams.get('from');
		const idsParam = $page.url.searchParams.get('ids');
		if (fromParam === 'theo' && idsParam) {
			showTheoTray = true;
			theoLoading = true;
			try {
				const res = await fetch(
					`http://localhost:5111/api/margo/products?ids=${idsParam}`
				);
				if (res.ok) theoProducts = await res.json();
			} catch (e) {
				console.warn('Could not reach Theo:', e);
			} finally {
				theoLoading = false;
			}
		}
	});

	// ── Canvas handlers ───────────────────────────────────────────

	function handleUploadImage(file: File) {
		canvas.addImageFile(file);
	}

	function handleDelete(id: string) {
		editorStore.selectLayer(id);
		canvas.deleteSelected();
	}

	function handleVisibilityChange(id: string, visible: boolean) {
		canvas.syncVisibility(id, visible);
	}

	async function handleRemoveBg(id: string) {
		editorStore.setProcessing(id);
		try {
			await canvas.removeBg(id);
		} finally {
			editorStore.setProcessing(null);
		}
	}
</script>

<svelte:head>
	<title>{$editorStore.collageTitle} — Margo</title>
</svelte:head>

<div class="editor-shell">
	<TopBar
		onUndo={() => canvas.undo()}
		onRedo={() => canvas.redo()}
		onExport={() => canvas.exportPNG()}
	/>

	<div class="editor-body">
		<ToolPanel onUploadImage={handleUploadImage} />

		{#if showTheoTray}
			<TheoTray
				products={theoProducts}
				loading={theoLoading}
				onAddImage={(url, name) => canvas.addImageFromUrl(url, name)}
			/>
		{/if}

		<Canvas bind:this={canvas} />

		<LayersPanel
			onBringForward={(id) => canvas.bringForward(id)}
			onSendBackward={(id) => canvas.sendBackward(id)}
			onVisibilityChange={handleVisibilityChange}
			onDelete={handleDelete}
			onRemoveBg={handleRemoveBg}
		/>
	</div>
</div>

<style>
	.editor-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.editor-body {
		display: flex;
		flex: 1;
		min-height: 0;
	}
</style>
