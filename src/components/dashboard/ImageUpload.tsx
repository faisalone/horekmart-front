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
import { Switch } from '@/components/ui/Switch';
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
  onImagesChange: (images: UploadedImage[]) => void;
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

  // Generate watermark preview for an image
  const generateWatermarkPreview = useCallback(async (image: UploadedImage) => {
    if (!image.file) return;
    
    const imageKey = image.id?.toString() || image.preview;
    
    // Prevent duplicate processing
    setPreviewLoading(prev => {
      if (prev[imageKey]) return prev;
      return { ...prev, [imageKey]: true };
    });
    
    try {
      const watermarkedFile = await applyWatermark(
        image.file,
        logoWatermark,
        { opacity: 0.1, position: 'center', size: 35 }
      );
      
      const previewUrl = URL.createObjectURL(watermarkedFile);
      
      // Ensure we don't overwrite existing previews
      setWatermarkPreviews(prev => {
        if (prev[imageKey]) {
          // Clean up the new URL since we already have one
          URL.revokeObjectURL(previewUrl);
          return prev;
        }
        return { ...prev, [imageKey]: previewUrl };
      });
    } catch (error) {
      console.error('Failed to generate watermark preview:', error);
    } finally {
      setPreviewLoading(prev => ({ ...prev, [imageKey]: false }));
    }
  }, [logoWatermark]);

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

  // Generate watermark previews when watermark is enabled and images change
  useEffect(() => {
    if (!enableWatermark) return;
    
    images.forEach(image => {
      if (image.file && !image.isExisting) {
        const imageKey = image.id?.toString() || image.preview;
        
        // Only process if we haven't already processed this image and don't have a preview
        if (!processedImagesRef.current.has(imageKey) && !watermarkPreviews[imageKey] && !previewLoading[imageKey]) {
          processedImagesRef.current.add(imageKey);
          generateWatermarkPreview(image);
        }
      }
    });
  }, [enableWatermark, images, generateWatermarkPreview, watermarkPreviews, previewLoading]);

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
              
            const newImages = watermarkedFiles.map((file, index) => ({
              id: `temp-${Date.now()}-${index}`,
              file,
              preview: URL.createObjectURL(file),
              alt_text: '',
              sort_order: images.length + index,
              isExisting: false
            }));

            onImagesChange([...images, ...newImages]);
            toast.success(
              acceptedFiles.length === 1 
                ? 'Image added with watermark' 
                : `${acceptedFiles.length} images added with watermark`
            );
          } catch (error) {
            console.error('Watermark error:', error);
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

      {/* Watermark Control */}
      {onWatermarkChange && (
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Add Watermark
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Apply company logo to all uploaded images (preview available)
            </div>
          </div>
          <Switch
            checked={enableWatermark}
            onCheckedChange={onWatermarkChange}
            disabled={disabled || uploading || isProcessingWatermark}
            size="md"
          />
        </div>
      )}

      {/* Processing Progress */}
      {isProcessingWatermark && (
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
              const showWatermarkPreview = enableWatermark && !image.isExisting && watermarkPreviews[imageKey];
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
