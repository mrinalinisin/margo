<script lang="ts">
	interface TheoProduct {
		id: number;
		name: string;
		store: string;
		image_url: string | null;
		images: string[];
		tags: string[];
	}

	interface Props {
		products: TheoProduct[];
		loading: boolean;
		onAddImage: (url: string, name: string) => void;
	}

	let { products, loading, onAddImage }: Props = $props();
</script>

<aside class="theo-tray">
	<div class="tray-header">
		<span class="tray-title">From Theo</span>
		<span class="tray-count">{products.length} item{products.length !== 1 ? 's' : ''}</span>
	</div>

	<div class="tray-body">
		{#if loading}
			<div class="tray-loading">
				<svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12a9 9 0 11-6.219-8.56"/>
				</svg>
			</div>
		{:else if products.length === 0}
			<p class="tray-empty">No images found.</p>
		{:else}
			{#each products as product (product.id)}
				<div class="tray-product">
					<!-- Primary image -->
					{#if product.image_url}
						<button
							class="tray-thumb"
							title="Add {product.name} to canvas"
							onclick={() => onAddImage(product.image_url!, product.name)}
						>
							<img src={product.image_url} alt={product.name} loading="lazy" />
							<span class="tray-thumb-add">+</span>
						</button>
					{/if}

					<!-- Additional images -->
					{#each product.images.slice(product.image_url ? 1 : 0) as imgUrl, i (imgUrl)}
						<button
							class="tray-thumb"
							title="Add {product.name} (photo {i + 2}) to canvas"
							onclick={() => onAddImage(imgUrl, `${product.name} ${i + 2}`)}
						>
							<img src={imgUrl} alt={product.name} loading="lazy" />
							<span class="tray-thumb-add">+</span>
						</button>
					{/each}

					<p class="tray-product-name">{product.name}</p>
					{#if product.store}
						<p class="tray-product-store">{product.store}</p>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</aside>

<style>
	.theo-tray {
		width: 180px;
		flex-shrink: 0;
		background: var(--color-parchment);
		border-right: 1px solid var(--color-parchment-border);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.tray-header {
		padding: 14px 12px 10px;
		border-bottom: 1px solid var(--color-parchment-border);
		display: flex;
		align-items: baseline;
		gap: 8px;
		flex-shrink: 0;
	}

	.tray-title {
		font-family: var(--font-serif);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-ink);
	}

	.tray-count {
		font-size: 11px;
		color: var(--color-ink-muted);
	}

	.tray-body {
		flex: 1;
		overflow-y: auto;
		padding: 10px 10px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.tray-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px 0;
		color: var(--color-ink-muted);
	}

	.tray-empty {
		font-size: 12px;
		color: var(--color-ink-muted);
		text-align: center;
		padding: 24px 0;
	}

	.tray-product {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tray-thumb {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border: none;
		padding: 0;
		background: var(--color-parchment-dark);
		border-radius: 6px;
		overflow: hidden;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.tray-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.tray-thumb-add {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		color: white;
		background: rgba(184, 115, 51, 0.7);
		opacity: 0;
		transition: opacity 0.15s;
	}

	.tray-thumb:hover .tray-thumb-add {
		opacity: 1;
	}

	.tray-product-name {
		font-size: 11px;
		font-weight: 500;
		color: var(--color-ink);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tray-product-store {
		font-size: 10px;
		color: var(--color-ink-muted);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.spin {
		animation: spin 0.8s linear infinite;
	}
</style>
