/**
 * Image Watermark Utility
 * Adds watermark to images using the company logo
 */

export interface WatermarkOptions {
	opacity?: number;
	position?:
		| 'bottom-right'
		| 'bottom-left'
		| 'top-right'
		| 'top-left'
		| 'center';
	size?: number; // Percentage of image width (default: 15)
	margin?: number; // Margin from edges in pixels
}

const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
	opacity: 0.7,
	position: 'bottom-right',
	size: 15,
	margin: 20,
};

/**
 * Apply watermark to an image file
 */
export async function applyWatermark(
	imageFile: File,
	logoWatermark: string | null,
	options: WatermarkOptions = {}
): Promise<File> {
	const opts = { ...DEFAULT_WATERMARK_OPTIONS, ...options };

	try {
		// Load the watermark image
		const watermarkImg = await loadWatermarkImage(logoWatermark);

		// Create canvas elements
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Canvas context not available');
		}

		// Load and process the original image
		const originalImg = await loadOriginalImage(imageFile);

		// Set canvas size to match image
		canvas.width = originalImg.width;
		canvas.height = originalImg.height;

		// Draw original image
		ctx.drawImage(originalImg, 0, 0);

		// Calculate watermark size
		const watermarkWidth = (canvas.width * opts.size!) / 100;
		const watermarkHeight =
			(watermarkImg.height / watermarkImg.width) * watermarkWidth;

		// Calculate position
		let x, y;
		switch (opts.position) {
			case 'top-left':
				x = opts.margin!;
				y = opts.margin!;
				break;
			case 'top-right':
				x = canvas.width - watermarkWidth - opts.margin!;
				y = opts.margin!;
				break;
			case 'bottom-left':
				x = opts.margin!;
				y = canvas.height - watermarkHeight - opts.margin!;
				break;
			case 'center':
				x = (canvas.width - watermarkWidth) / 2;
				y = (canvas.height - watermarkHeight) / 2;
				break;
			default: // bottom-right
				x = canvas.width - watermarkWidth - opts.margin!;
				y = canvas.height - watermarkHeight - opts.margin!;
				break;
		}

		// Set opacity and draw watermark
		ctx.globalAlpha = opts.opacity!;
		ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);

		// Convert canvas to file
		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) {
						const watermarkedFile = new File(
							[blob],
							`watermarked_${imageFile.name}`,
							{ type: imageFile.type }
						);
						resolve(watermarkedFile);
					} else {
						reject(new Error('Failed to create watermarked image'));
					}
				},
				imageFile.type,
				0.9
			);
		});
	} catch (error) {
		throw error;
	}
}

/**
 * Load original image file as HTMLImageElement
 */
function loadOriginalImage(imageFile: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const imageUrl = URL.createObjectURL(imageFile);

		img.onload = () => {
			URL.revokeObjectURL(imageUrl);
			resolve(img);
		};

		img.onerror = () => {
			URL.revokeObjectURL(imageUrl);
			reject(new Error('Failed to load original image'));
		};

		img.src = imageUrl;
	});
}

/**
 * Load watermark image directly - no SVG conversion needed
 */
export async function loadWatermarkImage(
	customWatermark?: string | null
): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		let blobUrl: string | null = null;

		img.onload = () => {
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
			}
			resolve(img);
		};

		img.onerror = () => {
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
			}
			// Create fallback canvas image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;
			canvas.width = 140;
			canvas.height = 40;

			// Simple branded watermark
			ctx.fillStyle = '#0074bf';
			ctx.fillRect(0, 0, 140, 40);
			ctx.fillStyle = 'white';
			ctx.font = 'bold 14px Arial';
			ctx.textAlign = 'center';
			ctx.fillText('WATERMARK', 70, 26);

			// Convert canvas to image
			const fallbackImg = new Image();
			fallbackImg.onload = () => resolve(fallbackImg);
			fallbackImg.src = canvas.toDataURL();
		};

		if (customWatermark) {
			const trimmed = customWatermark.trim();
			if (trimmed.startsWith('<svg')) {
				blobUrl = URL.createObjectURL(
					new Blob([trimmed], { type: 'image/svg+xml' })
				);
				img.src = blobUrl;
			} else if (trimmed.startsWith('data:')) {
				img.src = trimmed;
			} else {
				const proxiedUrl = `/api/watermark-proxy?url=${encodeURIComponent(
					trimmed
				)}`;
				img.src = proxiedUrl;
			}
		} else {
			// Try static logo fallback
			img.src = '/logo-dark.svg';
		}
	});
}

/**
 * Batch process multiple images with watermark
 */
export async function batchApplyWatermark(
	images: File[],
	logoWatermark: string | null,
	options: WatermarkOptions = {},
	onProgress?: (progress: number) => void
): Promise<File[]> {
	const results: File[] = [];

	for (let i = 0; i < images.length; i++) {
		try {
			const watermarkedImage = await applyWatermark(
				images[i],
				logoWatermark,
				options
			);
			results.push(watermarkedImage);

			if (onProgress) {
				onProgress(((i + 1) / images.length) * 100);
			}
		} catch (error) {
			// Keep original image if watermarking fails
			results.push(images[i]);
		}
	}

	return results;
}
