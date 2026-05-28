<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Konva from 'konva';
	import { editorStore } from '$lib/stores/editor';
	import type { CanvasLayer, SerializedLayer, HistoryEntry } from '$lib/types/editor';

	let container: HTMLDivElement;
	let stage: Konva.Stage;
	let konvaLayer: Konva.Layer;
	let transformer: Konva.Transformer;

	// History stack
	let history: HistoryEntry[] = [];
	let historyStep = -1;

	// Image src cache: id → data URL
	const imageSrcCache = new Map<string, string>();

	onMount(() => {
		initStage();
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('paste', handlePaste);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		window.removeEventListener('paste', handlePaste);
		stage?.destroy();
	});

	async function handlePaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (!items) return;
		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) addImageFile(file);
				break;
			}
		}
	}

	function initStage() {
		const w = container.clientWidth;
		const h = container.clientHeight;

		stage = new Konva.Stage({ container, width: w, height: h });
		konvaLayer = new Konva.Layer();
		stage.add(konvaLayer);

		transformer = new Konva.Transformer({
			rotateAnchorOffset: 24,
			borderStroke: '#b87333',
			borderStrokeWidth: 1.5,
			anchorStroke: '#b87333',
			anchorFill: '#fff',
			anchorSize: 9,
			anchorCornerRadius: 2,
			keepRatio: false
		});
		konvaLayer.add(transformer);

		// Click on empty stage → deselect
		stage.on('click tap', (e) => {
			if (e.target === stage) {
				deselect();
			}
		});

		// Resize observer
		const ro = new ResizeObserver(() => {
			stage.width(container.clientWidth);
			stage.height(container.clientHeight);
		});
		ro.observe(container);

		saveSnapshot();
	}

	function handleKeydown(e: KeyboardEvent) {
		const meta = e.metaKey || e.ctrlKey;
		if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
		if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
		if (e.key === 'Backspace' || e.key === 'Delete') deleteSelected();
		// Nudge selected node with arrow keys
		if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) nudge(e);
	}

	function nudge(e: KeyboardEvent) {
		const selected = transformer.nodes()[0] as Konva.Shape | undefined;
		if (!selected) return;
		e.preventDefault();
		const dist = e.shiftKey ? 10 : 1;
		if (e.key === 'ArrowLeft') selected.x(selected.x() - dist);
		if (e.key === 'ArrowRight') selected.x(selected.x() + dist);
		if (e.key === 'ArrowUp') selected.y(selected.y() - dist);
		if (e.key === 'ArrowDown') selected.y(selected.y() + dist);
		konvaLayer.batchDraw();
		saveSnapshot();
	}

	// ── Public API ──────────────────────────────────────────────

	export function addImageFile(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const src = e.target?.result as string;
			const img = new Image();
			img.onload = () => addImageNode(img, src, file.name);
			img.src = src;
		};
		reader.readAsDataURL(file);
	}

	export function addImageFromUrl(url: string, name: string) {
		// Route cross-origin localhost URLs through our server-side proxy so
		// the image is same-origin and won't taint the Konva canvas.
		let src = url;
		try {
			const parsed = new URL(url);
			if (
				(parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
				parsed.port !== window.location.port
			) {
				src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
			}
		} catch { /* not a valid URL, use as-is */ }

		const img = new Image();
		img.onload = () => addImageNode(img, src, name);
		img.onerror = () => console.warn('Margo: failed to load image from', src);
		img.src = src;
	}

	function addImageNode(img: HTMLImageElement, src: string, filename: string) {
		const id = crypto.randomUUID();
		const maxDim = Math.min(stage.width(), stage.height()) * 0.6;
		const scale = img.width > maxDim || img.height > maxDim
			? maxDim / Math.max(img.width, img.height)
			: 1;

		const node = new Konva.Image({
			id,
			image: img,
			x: stage.width() / 2 - (img.width * scale) / 2,
			y: stage.height() / 2 - (img.height * scale) / 2,
			width: img.width * scale,
			height: img.height * scale,
			draggable: true
		});

		imageSrcCache.set(id, src);
		attachNodeEvents(node);

		// Insert below transformer
		transformer.zIndex(konvaLayer.children.length - 1);
		konvaLayer.add(node);
		node.zIndex(konvaLayer.children.length - 2);

		konvaLayer.batchDraw();

		const name = filename.replace(/\.[^/.]+$/, '');
		const layer: CanvasLayer = { id, name, type: 'image', visible: true, locked: false };
		editorStore.addLayerTop(layer);

		selectNode(node);
		saveSnapshot();
	}

	function attachNodeEvents(node: Konva.Shape | Konva.Image) {
		node.on('click tap', () => selectNode(node));
		node.on('dragend transformend', () => saveSnapshot());
		node.on('dragmove', () => {
			const storeLayer = getStoreLayer(node.id());
			if (storeLayer?.locked) node.stopDrag();
		});
	}

	function getStoreLayer(id: string): CanvasLayer | undefined {
		let found: CanvasLayer | undefined;
		editorStore.subscribe((s) => {
			found = s.layers.find((l) => l.id === id);
		})();
		return found;
	}

	function selectNode(node: Konva.Node) {
		const storeLayer = getStoreLayer(node.id());
		if (storeLayer?.locked) return;
		transformer.nodes([node]);
		editorStore.selectLayer(node.id());
		konvaLayer.batchDraw();
	}

	function deselect() {
		transformer.nodes([]);
		editorStore.selectLayer(null);
		konvaLayer.batchDraw();
	}

	export function deleteSelected() {
		const nodes = transformer.nodes();
		if (!nodes.length) return;
		nodes.forEach((n) => {
			imageSrcCache.delete(n.id());
			editorStore.removeLayer(n.id());
			n.destroy();
		});
		transformer.nodes([]);
		konvaLayer.batchDraw();
		saveSnapshot();
	}

	// ── Undo / Redo ──────────────────────────────────────────────

	function saveSnapshot() {
		// Trim any forward history when a new action is taken
		history = history.slice(0, historyStep + 1);

		const layers: SerializedLayer[] = [];
		let storeState: ReturnType<typeof editorStore.subscribe> extends (cb: (s: infer S) => void) => void ? S : never;

		let storeLayers: CanvasLayer[] = [];
		editorStore.subscribe((s) => { storeLayers = s.layers; })();

		// konvaLayer.children is bottom-to-top z-order
		konvaLayer.children
			.filter((n) => n !== transformer)
			.forEach((n) => {
				const storeLayer = storeLayers.find((l) => l.id === n.id());
				if (!storeLayer) return;
				const attrs: SerializedLayer['attrs'] = {
					x: n.x(),
					y: n.y(),
					scaleX: n.scaleX(),
					scaleY: n.scaleY(),
					rotation: n.rotation(),
					width: (n as Konva.Image).width(),
					height: (n as Konva.Image).height(),
					src: imageSrcCache.get(n.id())
				};
				layers.push({ ...storeLayer, attrs });
			});

		history.push({ layers });
		historyStep = history.length - 1;
		editorStore.setUndoRedo(historyStep > 0, false);
	}

	export function undo() {
		if (historyStep <= 0) return;
		historyStep--;
		restoreSnapshot(history[historyStep]);
		editorStore.setUndoRedo(historyStep > 0, true);
	}

	export function redo() {
		if (historyStep >= history.length - 1) return;
		historyStep++;
		restoreSnapshot(history[historyStep]);
		editorStore.setUndoRedo(historyStep > 0, historyStep < history.length - 1);
	}

	async function restoreSnapshot(entry: HistoryEntry) {
		// Remove all current nodes except transformer
		konvaLayer.children.filter((n) => n !== transformer).forEach((n) => n.destroy());
		imageSrcCache.clear();
		deselect();

		const newStoreLayers: CanvasLayer[] = [];

		for (const sl of entry.layers) {
			if (sl.type === 'image' && sl.attrs.src) {
				await new Promise<void>((resolve) => {
					const img = new Image();
					img.onload = () => {
						const node = new Konva.Image({
							id: sl.id,
							image: img,
							x: sl.attrs.x,
							y: sl.attrs.y,
							scaleX: sl.attrs.scaleX,
							scaleY: sl.attrs.scaleY,
							rotation: sl.attrs.rotation,
							width: sl.attrs.width,
							height: sl.attrs.height,
							draggable: true,
							visible: sl.visible
						});
						imageSrcCache.set(sl.id, sl.attrs.src!);
						attachNodeEvents(node);
						konvaLayer.add(node);
						resolve();
					};
					img.src = sl.attrs.src!;
				});
			}
			newStoreLayers.push({
				id: sl.id,
				name: sl.name,
				type: sl.type,
				visible: sl.visible,
				locked: sl.locked
			});
		}

		transformer.zIndex(konvaLayer.children.length - 1);
		// Store layers are top-to-bottom, restore accordingly
		editorStore.setLayers([...newStoreLayers].reverse());
		konvaLayer.batchDraw();
	}

	// ── Export ───────────────────────────────────────────────────

	export function exportPNG() {
		transformer.nodes([]);
		konvaLayer.batchDraw();
		const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
		const a = document.createElement('a');
		a.download = 'margo-collage.png';
		a.href = dataURL;
		a.click();
	}

	// ── Layer order sync from panel ───────────────────────────────

	export function bringForward(id: string) {
		const node = konvaLayer.findOne(`#${id}`);
		if (!node) return;
		const idx = node.zIndex();
		const max = konvaLayer.children.length - 2; // -2 because transformer is on top
		if (idx < max) node.zIndex(idx + 1);
		konvaLayer.batchDraw();
		saveSnapshot();
	}

	export function sendBackward(id: string) {
		const node = konvaLayer.findOne(`#${id}`);
		if (!node) return;
		const idx = node.zIndex();
		if (idx > 0) node.zIndex(idx - 1);
		konvaLayer.batchDraw();
		saveSnapshot();
	}

	// ── Visibility sync ───────────────────────────────────────────

	export function syncVisibility(id: string, visible: boolean) {
		const node = konvaLayer.findOne(`#${id}`);
		if (!node) return;
		node.visible(visible);
		konvaLayer.batchDraw();
	}

	// ── Background removal ────────────────────────────────────────

	export async function removeBg(id: string): Promise<void> {
		const node = konvaLayer.findOne(`#${id}`) as Konva.Image | undefined;
		if (!node) return;

		// Draw the current node pixels to an offscreen canvas to get a Blob
		const offscreen = document.createElement('canvas');
		const naturalW = node.width() * node.scaleX();
		const naturalH = node.height() * node.scaleY();
		offscreen.width = naturalW;
		offscreen.height = naturalH;
		const ctx = offscreen.getContext('2d')!;
		ctx.drawImage(node.image() as HTMLImageElement, 0, 0, naturalW, naturalH);

		const sourceBlob = await new Promise<Blob>((res) =>
			offscreen.toBlob((b) => res(b!), 'image/png')
		);

		// Dynamically import so the WASM model only loads when needed
		const { removeBackground } = await import('@imgly/background-removal');
		const resultBlob = await removeBackground(sourceBlob);

		// Swap the image in-place, preserving position/size/rotation
		const resultUrl = URL.createObjectURL(resultBlob);
		const newImg = new Image();
		await new Promise<void>((res) => {
			newImg.onload = () => res();
			newImg.src = resultUrl;
		});

		node.image(newImg);
		// Reset scale since the new image has the same pixel dims as the drawn area
		node.scaleX(1);
		node.scaleY(1);
		node.width(naturalW);
		node.height(naturalH);
		konvaLayer.batchDraw();

		// Update the cache with the new transparent PNG data URL
		const canvas2 = document.createElement('canvas');
		canvas2.width = naturalW;
		canvas2.height = naturalH;
		canvas2.getContext('2d')!.drawImage(newImg, 0, 0);
		imageSrcCache.set(id, canvas2.toDataURL('image/png'));

		URL.revokeObjectURL(resultUrl);
		saveSnapshot();
	}
</script>

<!-- Drop zone for drag-and-drop image upload -->
<div
	bind:this={container}
	class="canvas-container"
	role="application"
	aria-label="Collage canvas"
	ondragover={(e) => e.preventDefault()}
	ondrop={(e) => {
		e.preventDefault();
		const file = e.dataTransfer?.files[0];
		if (file?.type.startsWith('image/')) addImageFile(file);
	}}
></div>

<style>
	.canvas-container {
		flex: 1;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: var(--color-canvas-bg);
		background-image: radial-gradient(circle, #d8cfc0 1px, transparent 1px);
		background-size: 24px 24px;
		cursor: crosshair;
	}
</style>
