'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [deletingImageId, setDeletingImageId] = useState<number | string | null>(null);
  const [isReordering, setIsReordering] = useState(false); // Track active reordering
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { showError, showWarning } = useToast();

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
  }, []); // Only run on mount/unmount, not on every images change

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
    if (!uploading && !isReordering) {
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
  }, [images, uploading, isReordering]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled || uploading) return;

    // Handle rejected files and show validation errors
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error(`File "${file.name}" is too large`, {
                description: `Maximum file size is ${maxSize}MB`
              });
              break;
            case 'file-invalid-type':
              toast.error(`File "${file.name}" is not a valid image`, {
                description: 'Please upload JPEG, PNG, or WebP files only'
              });
              break;
            case 'too-many-files':
              toast.error('Too many files selected', {
                description: `Maximum ${maxFiles} images allowed`
              });
              break;
            case 'file-invalid':
              toast.error(`File "${file.name}" is invalid`, {
                description: error.message || 'File is empty or corrupt'
              });
              break;
            default:
              toast.error(`File "${file.name}" was rejected`, {
                description: error.message || 'Unknown error'
              });
          }
        });
      });
    }

    // Check if we're exceeding the file limit
    if (images.length + acceptedFiles.length > maxFiles) {
      toast.error('Too many images', {
        description: `You can only upload up to ${maxFiles} images. Current: ${images.length}, Trying to add: ${acceptedFiles.length}`
      });
      return;
    }

    // Process accepted files
    if (acceptedFiles.length > 0) {
      const newImages = acceptedFiles.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          id: `temp-${Date.now()}-${index}`, // Temporary ID for new uploads
          file,
          preview: previewUrl,
          alt_text: '',
          sort_order: images.length + index,
          isExisting: false
        };
      });
  
      // Update images with new valid files
      onImagesChange([...images, ...newImages]);
      
      if (acceptedFiles.length === 1) {
        toast.success('Image added successfully');
      } else {
        toast.success(`${acceptedFiles.length} images added successfully`);
      }
    }
  }, [images, onImagesChange, disabled, uploading, maxFiles, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: maxFiles - images.length,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading || images.length >= maxFiles,
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

  const removeImage = async (index: number) => {
    if (disabled || uploading || isReordering) return;
    
    const image = images[index];
    
    // With the new ordering system, we just remove from local state
    // The backend will handle deletion when orderedImages doesn't include the UUID
    
    // For new uploads, revoke the blob URL to prevent memory leaks
    // But only if we're not actively uploading or reordering to avoid premature cleanup
    if (image.preview && image.preview.startsWith('blob:') && !uploading && !isReordering) {
      // Add a small delay to ensure React state updates are complete
      setTimeout(() => {
        try {
          URL.revokeObjectURL(image.preview);
        } catch (error) {
          // Ignore errors for already revoked URLs
          console.debug('Blob URL already revoked or invalid:', image.preview);
        }
      }, 50);
    }
    
    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
    setIsReordering(true);
    console.log('Drag started for image at index:', index, 'Image:', images[index]);
  };

  const handleDragEnd = () => {
    // Clear reordering flag whether drop succeeded or was cancelled
    setIsReordering(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent dropzone from interfering
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent dropzone from interfering
    
    console.log('Drop event triggered. draggedIndex:', draggedIndex, 'dropIndex:', dropIndex);
    
    if (draggedIndex === null || disabled || uploading || !allowReorder) {
      console.log('Drop cancelled due to conditions:', { draggedIndex, disabled, uploading, allowReorder });
      return;
    }
    
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
    console.log(`Reordered image from position ${draggedIndex} to ${dropIndex}`, {
      draggedImage,
      newOrder: newImages.map((img, i) => ({ index: i, id: img.id, isExisting: img.isExisting }))
    });
    
    // Update state with the new order (client-side only)
    onImagesChange(newImages);
    setDraggedIndex(null);
    setIsReordering(false);
    
    // Note: No backend API call here - order will be sent when form is submitted
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
              // Generate a more unique key
              const imageKey = image.id != null 
                ? `img-${image.id}` 
                : image.preview 
                  ? `preview-${image.preview}-${index}` 
                  : `file-${image.file?.name || 'unknown'}-${index}`;
              
              return (
                <div
                  key={imageKey}
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
                  onDragEnd={handleDragEnd}
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
