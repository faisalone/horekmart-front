'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export interface UploadedImage {
  id?: number;
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
  onDeleteExistingImage?: (imageId: number, productId: string | number) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  uploading?: boolean;
  productId?: string | number;
  allowReorder?: boolean;
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
  allowReorder = true
}: ImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showWarning } = useToast();

  // Cleanup blob URLs when component unmounts or images change
  useEffect(() => {
    // Clean up blob URLs for removed images
    const currentPreviews = images.map(img => img.preview);
    
    return () => {
      // Cleanup all blob URLs when component unmounts
      images.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:') && !image.isExisting) {
          // Clean up blob URL
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  // Additional cleanup effect for when images are removed from state
  useEffect(() => {
    // Keep track of previous blob URLs to clean up removed ones
    const currentBlobUrls = images
      .filter(img => !img.isExisting && img.preview?.startsWith('blob:'))
      .map(img => img.preview);
    
    // This will help identify and clean up orphaned blob URLs
    // Track current blob URLs for cleanup
  }, [images]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled || uploading) return;

    // Handle rejected files with user feedback
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            showError(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
          } else if (error.code === 'file-invalid-type') {
            showError(`File "${file.name}" is not a supported image format.`);
          } else if (error.code === 'too-many-files') {
            showError(`Too many files. Maximum ${maxFiles} images allowed.`);
          } else {
            showError(`File "${file.name}" was rejected: ${error.message}`);
          }
        });
      });
    }

    // Check for file limit first - this is a critical validation
    if (images.length >= maxFiles) {
      showError(`Maximum ${maxFiles} images allowed. Please remove some images before adding more.`);
      return;
    }

    // Check if we would exceed the file limit
    if (images.length + acceptedFiles.length > maxFiles) {
      const allowedCount = maxFiles - images.length;
      showError(`Only ${allowedCount} more image${allowedCount !== 1 ? 's' : ''} can be added. Maximum ${maxFiles} images allowed.`);
      acceptedFiles.splice(allowedCount); // Limit the accepted files
    }

    // Validate and filter image files - ensure valid image type and non-zero size
    const validImageFiles = acceptedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') && file.type !== 'image/';
      const isValidSize = file.size > 0 && file.size <= maxSize * 1024 * 1024;
      const isSupported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'].includes(file.type);
      
      if (!isValidType || !isSupported) {
        showError(`File "${file.name}" rejected: Unsupported file type. Only JPEG, PNG, WebP, GIF, and BMP are supported.`);
        return false;
      }
      if (!isValidSize) {
        if (file.size === 0) {
          showError(`File "${file.name}" rejected: File appears to be empty or corrupt.`);
        } else {
          showError(`File "${file.name}" rejected: Exceeds maximum size of ${maxSize}MB.`);
        }
        return false;
      }
      
      return true;
    });

    // If we have valid files, create and add them to the image array
    if (validImageFiles.length > 0) {
      const newImages = validImageFiles.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          file,
          preview: previewUrl,
          alt_text: '',
          sort_order: images.length + index,
          isExisting: false
        };
      });
  
      // Update images with new valid files
      onImagesChange([...images, ...newImages]);
    }
  }, [images, onImagesChange, disabled, uploading, maxFiles, maxSize, showError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp']
    },
    maxFiles: maxFiles - images.length,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading || images.length >= maxFiles,
    noClick: true, // We'll handle clicks manually
    multiple: true,
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

  const removeImage = async (index: number) => {
    if (disabled || uploading) return;
    
    const image = images[index];
    
    // If it's an existing image with an ID, call the delete API
    if (image.isExisting && image.id && onDeleteExistingImage && productId) {
      try {
        setDeletingImageId(image.id);
        await onDeleteExistingImage(image.id, productId);
        // Only remove from local state after successful API call
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
      } catch (error) {
        // Handle delete error silently or show user notification
        // Don't remove from state if API call failed
      } finally {
        setDeletingImageId(null);
      }
    } else {
      // For new uploads, revoke the blob URL to prevent memory leaks
      if (image.preview && image.preview.startsWith('blob:')) {
        // Clean up blob URL for removed image
        URL.revokeObjectURL(image.preview);
      }
      // Remove from local state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const handleDragStart = (index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || disabled || uploading || !allowReorder) return;
    
    // Clone the images array to avoid mutation
    const newImages = [...images];
    
    // Use array destructuring for a cleaner approach to reorder
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Update sort_order to match visual order
    newImages.forEach((img, index) => {
      img.sort_order = index;
    });
    
    // Debug information
    console.log(`Reordered image from position ${draggedIndex} to ${dropIndex}`);
    
    // Update state with the new order
    onImagesChange(newImages);
    setDraggedIndex(null);

    // Call reorder API for existing images if we have productId
    if (productId) {
      try {
        const { adminApi } = await import('@/lib/admin-api');
        
        // Get IDs of existing images in their new order
        const existingImageIds = newImages
          .filter(img => img.isExisting && img.id)
          .map(img => img.id as number);
        
        // Only call reorder if we have existing images
        if (existingImageIds.length > 0) {
          await adminApi.reorderProductImages(productId, existingImageIds);
        }
      } catch (error) {
        console.error('Error reordering images on backend:', error);
        showError?.('Failed to save image order');
      }
    }
  };

  const getImageSrc = (image: UploadedImage) => {
    // Always use preview as it contains either blob URL or server URL
    return image.preview;
  };

  const canAddMore = images.length < maxFiles && !disabled && !uploading;

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

      {/* Upload Area */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={handleFileInputClick}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isDragActive ? 'Drop images here' : 'Click to upload images'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or drag & drop files here
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
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
          
          {/* Masonry Layout - Flex wrap with original aspect ratios */}
          <div className="flex flex-wrap gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {images.map((image, index) => {
              const imageSrc = getImageSrc(image);
              const isDeleting = deletingImageId === image.id;
              return (
                <div
                  key={image.id != null ? image.id : image.preview}
                  className={cn(
                    'relative rounded-lg overflow-hidden transition-all group border border-gray-200 bg-white dark:bg-white flex-shrink-0',
                    allowReorder && !disabled && !uploading ? 'cursor-move' : '',
                    disabled || uploading || isDeleting ? 'opacity-50' : draggedIndex === index ? 'opacity-50 scale-95' : ''
                  )}
                  style={{ 
                    height: '120px', // Fixed height for consistency
                    maxWidth: '200px', // Max width to prevent too wide images
                    minWidth: '80px', // Min width to prevent too narrow images
                    backgroundColor: 'white !important' // Force white background with importance
                  }}
                  draggable={allowReorder && !disabled && !uploading}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Image Container */}
                  <div 
                    className="w-full h-full bg-white flex items-center justify-center"
                    style={{ 
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={image.alt_text || `Image ${index + 1}`}
                        width={200}
                        height={120}
                        className="block object-contain"
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          backgroundColor: 'white',
                          zIndex: 1,
                          position: 'relative'
                        }}
                        onError={(e) => {
                          // Replace with visible error
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center h-full text-red-500 text-center bg-white">
                                <div class="text-2xl">❌</div>
                                <div class="text-xs mt-1">Failed to Load</div>
                                <div class="text-xs">${image.file?.name || 'Image'}</div>
                              </div>
                            `;
                          }
                        }}
                        onLoad={(e) => {
                          // Calculate and apply dynamic width based on aspect ratio
                          const img = e.target as HTMLImageElement;
                          const container = img.parentElement?.parentElement;
                          if (container && img.naturalWidth && img.naturalHeight) {
                            const aspectRatio = img.naturalWidth / img.naturalHeight;
                            const height = 120; // Fixed height
                            const calculatedWidth = Math.min(Math.max(height * aspectRatio, 80), 200);
                            container.style.width = `${calculatedWidth}px`;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">No Preview</span>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 pointer-events-none" />
                    
                    {/* Remove Button */}
                    {!disabled && !uploading && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        disabled={isDeleting}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-1 h-auto w-auto min-w-[24px] min-h-[24px] disabled:opacity-50 z-20"
                        style={{ zIndex: 20 }}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                    
                    {/* Order Badge */}
                    <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded text-center min-w-[20px] z-10">
                      {index + 1}
                    </div>

                    {/* Remove unnecessary status badges as requested */}
                  </div>
                </div>
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
