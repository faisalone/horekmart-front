'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { DraggableItem } from '@/components/ui/DraggableItem';
import { applyWatermark, batchApplyWatermark } from '@/utils/watermark';

export interface UploadedImage {
  id?: number | string; // Allow both number and string for UUIDs
  file?: File;
  url?: string; // For existing images from server
  preview: string; // For blob URLs or existing URLs
  alt_text?: string;
  sort_order?: number;
  isExisting?: boolean; // Flag to identify server images vs new uploads
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  onDeleteExistingImage?: (imageId: number | string, productId: string | number) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  uploading?: boolean;
  productId?: string | number;
  allowReorder?: boolean;
  enableWatermark?: boolean;
  onWatermarkChange?: (enabled: boolean) => void;
  logoWatermark?: string | null;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  onDeleteExistingImage,
  maxFiles = 10, 
  maxSize = 5,
  className,
  disabled = false,
  uploading = false,
  productId,
  allowReorder = true,
  enableWatermark = false,
  onWatermarkChange,
  logoWatermark = null
}: ImageUploadProps) {
  const [deletingImageId, setDeletingImageId] = useState<number | string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingWatermark, setIsProcessingWatermark] = useState(false);
  const [watermarkProgress, setWatermarkProgress] = useState(0);
  const [watermarkPreviews, setWatermarkPreviews] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const processedImagesRef = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modern drag-and-drop hook
  const dragAndDrop = useDragAndDrop({
    items: images,
    onReorder: onImagesChange,
    disabled: disabled || uploading
  });

  // Apply watermark and update the actual file in images array
  const applyWatermarkToImage = useCallback(async (imageIndex: number) => {
    const image = images[imageIndex];
    if (!image) {
      return;
    }
    
    const imageKey = image.id?.toString() || image.preview;
    
    // Prevent duplicate processing
    if (previewLoading[imageKey] || processedImagesRef.current.has(imageKey)) {
      return;
    }
    
    setPreviewLoading(prev => ({ ...prev, [imageKey]: true }));
    processedImagesRef.current.add(imageKey);
    
    try {
      let imageFile: File;
      
      if (image.file) {
        // New upload - use the file directly
        imageFile = image.file;
      } else if (image.preview || image.url) {
        // Existing image - convert from URL to File
        let imageUrl = image.preview || image.url!;
        
        // Use proxy for backend URLs to avoid CORS issues
        if (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
          imageUrl = `/api/watermark-proxy?url=${encodeURIComponent(imageUrl)}`;
        }
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const blob = await response.blob();
        const fileName = `watermarked-${Date.now()}.jpg`;
        imageFile = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      } else {
        return; // No valid image source
      }
      
      const watermarkedFile = await applyWatermark(
        imageFile,
        logoWatermark,
        { opacity: 0.1, position: 'center', size: 35 }
      );
      
      const watermarkedPreview = URL.createObjectURL(watermarkedFile);

      onImagesChange((prevImages) => {
        const updatedImages = [...prevImages];
        const targetIndex = prevImages.findIndex((img) => {
          const key = img.id?.toString() || img.preview;
          return key === imageKey;
        });

        if (targetIndex === -1) {
          return prevImages;
        }

        const previousImage = updatedImages[targetIndex];

        // Clean up old preview if it's a blob URL
        if (previousImage.preview.startsWith('blob:')) {
          URL.revokeObjectURL(previousImage.preview);
        }

        updatedImages[targetIndex] = {
          ...previousImage,
          file: watermarkedFile,
          preview: watermarkedPreview,
          isExisting: false, // Mark as new file since it's now watermarked
        };

        return updatedImages;
      });
      
      // Store watermark preview for display
      setWatermarkPreviews(prev => ({
        ...prev,
        [imageKey]: watermarkedPreview
      }));
      
    } catch (error) {
      processedImagesRef.current.delete(imageKey);
    } finally {
      setPreviewLoading(prev => ({ ...prev, [imageKey]: false }));
    }
  }, [images, logoWatermark, onImagesChange, previewLoading]);
  
  // Generate watermark preview for display purposes only (legacy - now handled by effect)
  const generateWatermarkPreview = useCallback(async (image: UploadedImage) => {
    // This is now handled by the main effect below
    return;
  }, []);

  // Clean up watermark previews when component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup on component unmount
      setWatermarkPreviews(prevPreviews => {
        Object.values(prevPreviews).forEach(url => {
          if (url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(url);
            } catch (error) {
              // Ignore errors for already revoked URLs
            }
          }
        });
        return {};
      });
    };
  }, []); // Empty dependency array - only run on unmount

  // Apply watermark to all existing images when watermark is enabled
  useEffect(() => {
    if (!enableWatermark || !logoWatermark) return;
    
    const processAllImages = async () => {
      // Create a snapshot of current images to avoid stale closure issues
      const currentImages = [...images];
      
      // Process each image sequentially to avoid conflicts
      for (let i = 0; i < currentImages.length; i++) {
        const image = currentImages[i];
        const imageKey = image.id?.toString() || image.preview;
        
        // Skip if already processed, processing, or is a watermarked file
        if (processedImagesRef.current.has(imageKey) || 
            previewLoading[imageKey] ||
            image.file?.name.includes('watermarked-')) {
          continue;
        }
        
        // Process this individual image
        await applyWatermarkToImage(i);
        
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    };
    
    processAllImages();
  }, [enableWatermark, logoWatermark, applyWatermarkToImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply watermark to newly added images immediately
  useEffect(() => {
  if (!enableWatermark || !logoWatermark || images.length === 0) return;
    
    // Process any new unprocessed images
    images.forEach(async (image, index) => {
      const imageKey = image.id?.toString() || image.preview;
      
      if (!processedImagesRef.current.has(imageKey) && 
          !previewLoading[imageKey] && 
          !image.file?.name.includes('watermarked-') &&
          image.file) {
        await applyWatermarkToImage(index);
      }
    });
  }, [images, enableWatermark, logoWatermark, applyWatermarkToImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear watermark previews when watermark is disabled
  useEffect(() => {
    if (!enableWatermark) {
      // Clean up all existing previews safely
      setWatermarkPreviews(prev => {
        Object.values(prev).forEach(url => {
          if (url && url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(url);
            } catch (error) {
              // Ignore errors for already revoked URLs
            }
          }
        });
        return {};
      });
      
      // Clear loading states
      setPreviewLoading({});
      
      // Clear processed images tracker
      processedImagesRef.current.clear();
    }
  }, [enableWatermark]);



  // Cleanup blob URLs when component unmounts, but preserve during operations
  useEffect(() => {
    // Track all blob URLs that should be preserved
    const preservedBlobUrls = new Set(
      images
        .filter(img => !img.isExisting && img.preview?.startsWith('blob:'))
        .map(img => img.preview)
    );

    return () => {
      // Only cleanup blob URLs when component truly unmounts
      // Don't cleanup during re-renders or state updates
      if (!uploading) {
        images.forEach(image => {
          if (image.preview && image.preview.startsWith('blob:') && !image.isExisting) {
            // Add a small delay to ensure all React rendering is complete
            setTimeout(() => {
              try {
                URL.revokeObjectURL(image.preview);
              } catch (error) {
                // Ignore errors for already revoked URLs
              }
            }, 100);
          }
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate effect to track blob URLs for removed images only
  const previousImagesRef = useRef<UploadedImage[]>([]);
  useEffect(() => {
    const previousImages = previousImagesRef.current;
    const currentImages = images;
    
    // Find removed images and clean up their blob URLs
    const removedImages = previousImages.filter(prevImg => 
      !currentImages.some(currImg => currImg.id === prevImg.id || currImg.preview === prevImg.preview)
    );
    
    // Only revoke blob URLs for actually removed images (not during uploads or reordering)
    if (!uploading && !dragAndDrop.isDragging) {
      removedImages.forEach(removedImg => {
        if (removedImg.preview && removedImg.preview.startsWith('blob:') && !removedImg.isExisting) {
          try {
            URL.revokeObjectURL(removedImg.preview);
          } catch (error) {
            // Ignore errors for already revoked URLs
          }
        }
      });
    }
    
    // Update the reference
    previousImagesRef.current = currentImages;
  }, [images, uploading, dragAndDrop.isDragging]);

  // Optimized image removal handler
  const handleRemoveImage = useCallback((index: number) => {
    if (disabled || uploading) return;
    
    const image = images[index];
    const imageKey = image.id?.toString() || image.preview;
    
    // Batch state updates for better performance
    const cleanup = () => {
      // Clean up watermark preview
      if (watermarkPreviews[imageKey]) {
        try { URL.revokeObjectURL(watermarkPreviews[imageKey]); } catch {}
      }
      
      // Clean up blob URL for new uploads
      if (image.preview?.startsWith('blob:') && !image.isExisting) {
        setTimeout(() => {
          try { URL.revokeObjectURL(image.preview); } catch {}
        }, 100);
      }
    };
    
    // Update all states in batch
    setWatermarkPreviews(prev => {
      const { [imageKey]: removed, ...rest } = prev;
      return rest;
    });
    
    setPreviewLoading(prev => {
      const { [imageKey]: removed, ...rest } = prev;
      return rest;
    });
    
    processedImagesRef.current.delete(imageKey);
    cleanup();
    
    // Update images array
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange, disabled, uploading, watermarkPreviews]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled || uploading) return;

    // Handle rejected files with simplified error messages
    rejectedFiles.forEach(({ file, errors }) => {
      const error = errors[0];
      const errorMessages: Record<string, string> = {
        'file-too-large': `"${file.name}" is too large (max ${maxSize}MB)`,
        'file-invalid-type': `"${file.name}" is not a valid image`,
        'too-many-files': `Maximum ${maxFiles} images allowed`,
        'file-invalid': `"${file.name}" is invalid or empty`
      };
      toast.error(errorMessages[error.code] || `"${file.name}" was rejected`);
    });

    // Check file limit
    if (images.length + acceptedFiles.length > maxFiles) {
      toast.error(`Cannot add ${acceptedFiles.length} images. Limit: ${maxFiles}`);
      return;
    }

    // Process new images
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      
      if (enableWatermark) {
        setIsProcessingWatermark(true);
        setWatermarkProgress(0);
        
        // Apply watermark to images
        (async () => {
          try {
            const watermarkedFiles = await batchApplyWatermark(
              acceptedFiles,
              logoWatermark,
              { opacity: 0.1, position: 'center', size: 35 },
              setWatermarkProgress
            );
              
            const newImages = watermarkedFiles.map((file, index) => {
              const newImage = {
                id: `temp-${Date.now()}-${index}`,
                file,
                preview: URL.createObjectURL(file),
                alt_text: '',
                sort_order: images.length + index,
                isExisting: false
              };
              
              // Mark as processed to prevent re-processing
              const imageKey = newImage.id?.toString() || newImage.preview;
              processedImagesRef.current.add(imageKey);
              
              return newImage;
            });

            onImagesChange([...images, ...newImages]);
            toast.success(
              acceptedFiles.length === 1 
                ? 'Image added with watermark' 
                : `${acceptedFiles.length} images added with watermark`
            );
          } catch (error) {
            toast.error('Failed to apply watermark, images added without watermark');
            
            // Fallback: add images without watermark
            const newImages = acceptedFiles.map((file, index) => ({
              id: `temp-${Date.now()}-${index}`,
              file,
              preview: URL.createObjectURL(file),
              alt_text: '',
              sort_order: images.length + index,
              isExisting: false
            }));
            onImagesChange([...images, ...newImages]);
          } finally {
            setIsProcessingWatermark(false);
            setWatermarkProgress(0);
            setIsUploading(false);
          }
        })();
      } else {
        // Add images without watermark
        const newImages = acceptedFiles.map((file, index) => ({
          id: `temp-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file),
          alt_text: '',
          sort_order: images.length + index,
          isExisting: false
        }));

        onImagesChange([...images, ...newImages]);
        toast.success(acceptedFiles.length === 1 ? 'Image added' : `${acceptedFiles.length} images added`);
        setIsUploading(false);
      }
    }
  }, [images, onImagesChange, disabled, uploading, maxFiles, maxSize, enableWatermark, logoWatermark]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: maxFiles - images.length,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading || isProcessingWatermark || images.length >= maxFiles,
    noClick: true, // We'll handle clicks manually
    multiple: true,
    noDrag: false, // Allow drag for upload
    preventDropOnDocument: false, // Prevent interference with other drag zones
    validator: (file) => {
      // Additional validation to ensure file integrity
      if (file.size === 0) {
        return {
          code: 'file-invalid',
          message: 'File is empty or corrupt'
        };
      }
      if (!file.type.startsWith('image/')) {
        return {
          code: 'file-invalid-type',
          message: 'File is not a valid image'
        };
      }
      return null;
    }
  });

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onDrop(files, []);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };



  // Old drag handlers removed - now using modern drag hook

  const getImageSrc = (image: UploadedImage) => {
    // Always use preview as it contains either blob URL or server URL
    return image.preview;
  };

  const canAddMore = images.length < maxFiles && !disabled && !uploading && !isProcessingWatermark;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Watermark Toggle - Disabled when no images */}
      {logoWatermark && onWatermarkChange && (
        <div 
          onClick={!disabled && !uploading && !isProcessingWatermark && images.length > 0 ? () => onWatermarkChange(!enableWatermark) : undefined}
          className={cn(
            "flex items-center gap-3 p-4 border rounded-lg transition-all",
            enableWatermark 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800" 
              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
            // Cursor and hover states
            !disabled && !uploading && !isProcessingWatermark && images.length > 0
              ? "cursor-pointer hover:border-blue-300 hover:bg-blue-25"
              : "cursor-not-allowed",
            // Disabled state when no images or other conditions
            (disabled || uploading || isProcessingWatermark || images.length === 0) && "opacity-50"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all relative",
            enableWatermark 
              ? "border-blue-500 bg-white shadow-md" 
              : "border-gray-300 dark:border-gray-600 bg-white hover:border-blue-400"
          )}>
            <Image 
              src={logoWatermark} 
              alt="Watermark logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <div className={cn(
              "text-sm font-medium",
              enableWatermark 
                ? "text-blue-900 dark:text-blue-100" 
                : "text-gray-700 dark:text-gray-300"
            )}>
              Apply Watermark
            </div>
            <div className={cn(
              "text-xs",
              enableWatermark 
                ? "text-blue-700 dark:text-blue-200" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              {images.length === 0
                ? 'Upload images first to apply watermark'
                : enableWatermark 
                  ? `Watermark applied to ${images.length} image${images.length !== 1 ? 's' : ''}` 
                  : `Apply watermark to ${images.length} image${images.length !== 1 ? 's' : ''}`
              }
            </div>
          </div>
          <div className={cn(
            "w-4 h-4 rounded-full border-2 transition-all",
            enableWatermark 
              ? "border-blue-500 bg-blue-500" 
              : "border-gray-300 dark:border-gray-600"
          )}>
            {enableWatermark && (
              <div className="w-full h-full rounded-full bg-white transform scale-50" />
            )}
          </div>
        </div>
      )}



      {/* Processing Progress - Only show when actually processing uploaded files */}
      {isProcessingWatermark && images.length > 0 && (
        <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Applying watermarks...
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {Math.round(watermarkProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${watermarkProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            (disabled || isProcessingWatermark) && 'opacity-50 cursor-not-allowed'
          )}
          onClick={handleFileInputClick}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isDragActive ? 'Drop images here' : 'Click to upload images'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or drag & drop files here
            {enableWatermark && ' (watermark will be applied)'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max {maxFiles} images, up to {maxSize}MB each (JPEG, PNG, WebP)
          </p>
        </div>
      )}

      {/* Image Preview Grid - Masonry Style */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Images ({images.length}/{maxFiles})
            </h4>
            {(uploading || isProcessingWatermark) && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isProcessingWatermark ? 'Processing watermarks...' : 'Uploading...'}
              </div>
            )}
          </div>
          
          {/* Modern Image Grid with Drag-and-Drop */}
          <div className="flex flex-wrap gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {images.map((image, index) => {
              const imageSrc = getImageSrc(image);
              const isDeleting = deletingImageId === image.id;
              const dragStyles = dragAndDrop.getDragStyles(index);
              
              // Generate unique key for React
              const reactKey = image.id != null 
                ? `img-${image.id}` 
                : image.preview 
                  ? `preview-${image.preview}-${index}` 
                  : `file-${image.file?.name || 'unknown'}-${index}`;
              
              // Determine which image to show - watermark preview or original
              const imageKey = image.id?.toString() || image.preview;
              const showWatermarkPreview = enableWatermark && watermarkPreviews[imageKey];
              const isGeneratingPreview = previewLoading[imageKey];
              const displaySrc = showWatermarkPreview ? watermarkPreviews[imageKey] : imageSrc;
              
              return (
                <DraggableItem
                  key={reactKey}
                  index={index}
                  isDraggedItem={dragStyles.isDraggedItem}
                  isDropTarget={dragStyles.isDropTarget}
                  isDragging={dragStyles.isDragging}
                  onDragStart={dragAndDrop.handleDragStart}
                  onDragMove={dragAndDrop.handleDragMove}
                  onDragEnd={dragAndDrop.handleDragEnd}
                  onDragCancel={dragAndDrop.handleDragCancel}
                  onDelete={() => handleRemoveImage(index)}
                  disabled={disabled || uploading || isDeleting}
                  dragStyles={{
                    ...dragStyles,
                    height: '120px',
                    maxWidth: '200px',
                    minWidth: '80px'
                  }}
                  className="flex-shrink-0"
                >
                  <div className="w-full h-full bg-white flex items-center justify-center relative">
                    {displaySrc ? (
                      <>
                        <Image
                          src={displaySrc}
                          alt={image.alt_text || `Image ${index + 1}`}
                          width={200}
                          height={120}
                          className="block object-contain"
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-full text-red-500 text-center">
                                  <div class="text-2xl">❌</div>
                                  <div class="text-xs mt-1">Failed to Load</div>
                                </div>
                              `;
                            }
                          }}
                        />
                        

                        
                        {/* Loading overlay for watermark preview generation */}
                        {isGeneratingPreview && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                            <div className="bg-white/90 px-2 py-1 rounded-md flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-xs text-gray-700">Generating Preview...</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">No Preview</span>
                      </div>
                    )}
                  </div>
                </DraggableItem>
              );
            })}
          </div>
          
          {allowReorder && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Drag images to reorder them. The first image will be the main product image.
            </p>
          )}
        </div>
      )}


    </div>
  );
}
