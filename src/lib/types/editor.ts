export type LayerType = 'image' | 'text';
export type Tool = 'select' | 'text';

export interface CanvasLayer {
	id: string;
	name: string;
	type: LayerType;
	visible: boolean;
	locked: boolean;
}

export interface SerializedLayerAttrs {
	x: number;
	y: number;
	scaleX: number;
	scaleY: number;
	rotation: number;
	width: number;
	height: number;
	src?: string; // data URL for images
	text?: string;
	fontSize?: number;
	fill?: string;
}

export interface SerializedLayer {
	id: string;
	name: string;
	type: LayerType;
	visible: boolean;
	locked: boolean;
	attrs: SerializedLayerAttrs;
}

export interface HistoryEntry {
	// Ordered bottom-to-top (index 0 = bottom layer)
	layers: SerializedLayer[];
}
