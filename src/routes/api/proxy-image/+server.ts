import type { RequestHandler } from '@sveltejs/kit';

/**
 * Server-side image proxy — fetches an external image and returns it
 * as same-origin, bypassing any cross-origin canvas taint restrictions.
 *
 * GET /api/proxy-image?url=http://localhost:5111/images/foo.jpg
 */
export const GET: RequestHandler = async ({ url }) => {
	const imageUrl = url.searchParams.get('url');

	if (!imageUrl) {
		return new Response('Missing url param', { status: 400 });
	}

	// Only allow localhost origins to prevent this being used as an open proxy
	const parsed = new URL(imageUrl);
	if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
		return new Response('Only localhost URLs are allowed', { status: 403 });
	}

	try {
		const upstream = await fetch(imageUrl);
		if (!upstream.ok) {
			return new Response('Upstream fetch failed', { status: 502 });
		}
		const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
		const buffer = await upstream.arrayBuffer();
		return new Response(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch {
		return new Response('Failed to fetch image', { status: 502 });
	}
};
