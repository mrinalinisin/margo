import { writable, derived, get } from 'svelte/store';
import type { CanvasLayer, Tool } from '$lib/types/editor';

interface EditorState {
	layers: CanvasLayer[]; // ordered top-to-bottom (index 0 = topmost in UI)
	selectedLayerId: string | null;
	activeTool: Tool;
	collageTitle: string;
	canUndo: boolean;
	canRedo: boolean;
	processingLayerId: string | null; // layer currently having bg removed
}

const initial: EditorState = {
	layers: [],
	selectedLayerId: null,
	activeTool: 'select',
	collageTitle: 'Untitled Collage',
	canUndo: false,
	canRedo: false,
	processingLayerId: null
};

function createEditorStore() {
	const { subscribe, set, update } = writable<EditorState>(initial);

	return {
		subscribe,

		setTitle: (title: string) => update((s) => ({ ...s, collageTitle: title })),

		setTool: (tool: Tool) => update((s) => ({ ...s, activeTool: tool })),

		setUndoRedo: (canUndo: boolean, canRedo: boolean) =>
			update((s) => ({ ...s, canUndo, canRedo })),

		// Layers ordered top-to-bottom in the UI panel
		setLayers: (layers: CanvasLayer[]) => update((s) => ({ ...s, layers })),

		addLayerTop: (layer: CanvasLayer) =>
			update((s) => ({ ...s, layers: [layer, ...s.layers] })),

		removeLayer: (id: string) =>
			update((s) => ({
				...s,
				layers: s.layers.filter((l) => l.id !== id),
				selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId
			})),

		selectLayer: (id: string | null) => update((s) => ({ ...s, selectedLayerId: id })),

		toggleVisible: (id: string) =>
			update((s) => ({
				...s,
				layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
			})),

		toggleLocked: (id: string) =>
			update((s) => ({
				...s,
				layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
			})),

		renameLayer: (id: string, name: string) =>
			update((s) => ({
				...s,
				layers: s.layers.map((l) => (l.id === id ? { ...l, name } : l))
			})),

		setProcessing: (id: string | null) =>
			update((s) => ({ ...s, processingLayerId: id })),

		reset: () => set(initial)
	};
}

export const editorStore = createEditorStore();
