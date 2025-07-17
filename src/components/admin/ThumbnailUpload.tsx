import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface ThumbnailUploadProps {
  thumbnail?: string | File;
  onThumbnailChange: (thumbnail: File | null) => void;
  onDeleteExistingThumbnail?: (productId: string | number) => Promise<void>;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  uploading?: boolean;
  productId?: string | number;
}

export function ThumbnailUpload({ 
  thumbnail, 
  onThumbnailChange, 
  onDeleteExistingThumbnail,
  maxSize = 2,
  className,
  disabled = false,
  uploading = false,
  productId
}: ThumbnailUploadProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showWarning } = useToast();
  
  // Manage preview URL state for File thumbnails
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof thumbnail === 'string' ? thumbnail : thumbnail instanceof File ? URL.createObjectURL(thumbnail) : null
  );
  // Cleanup old blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  // Update preview when thumbnail prop changes
  useEffect(() => {
    if (thumbnail instanceof File) {
      const url = URL.createObjectURL(thumbnail);
      setPreviewUrl(url);
    } else if (typeof thumbnail === 'string') {
      setPreviewUrl(thumbnail);
    } else {
      setPreviewUrl(null);
    }
  }, [thumbnail]);
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled || uploading) return;

    // Handle rejected files with user feedback
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            showError(`Thumbnail "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
          } else if (error.code === 'file-invalid-type') {
            showError(`Thumbnail "${file.name}" is not a supported image format.`);
          } else {
            showError(`Thumbnail "${file.name}" was rejected: ${error.message}`);
          }
        });
      });
    }
    
    // Only accept image files
    const imageFiles = acceptedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        showWarning(`File ${file.name} is not an image and will be ignored.`);
        return false;
      }
      return true;
    });
    
    const file = imageFiles[0];
    
    if (file) {
      onThumbnailChange(file);
    }
  }, [onThumbnailChange, disabled, uploading, maxSize, showError, showWarning]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    maxFiles: 1,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading,
    noClick: true // We'll handle clicks manually
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

  const removeThumbnail = async () => {
    if (disabled || uploading) return;
    
    // If it's an existing thumbnail (string URL) and we have a delete function
    if (typeof thumbnail === 'string' && thumbnail && onDeleteExistingThumbnail && productId) {
      try {
        setIsDeleting(true);
        await onDeleteExistingThumbnail(productId);
        onThumbnailChange(null);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // For new uploads, just remove from local state
      onThumbnailChange(null);
    }
  };

  const thumbnailUrl = previewUrl;
  const isBlob = thumbnailUrl?.startsWith('blob:') || false;
  const isExisting = typeof thumbnail === 'string' && thumbnail;
  const isNewUpload = thumbnail instanceof File;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Product Thumbnail
        </label>
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>

      {thumbnailUrl ? (
        <div className="relative rounded-lg overflow-hidden group border-2 border-gray-200 transition-all hover:border-blue-400 bg-white dark:bg-white" 
             style={{ 
               width: 'fit-content', 
               maxWidth: '200px', // Reduced max width
               maxHeight: '150px' // Reduced max height to prevent grid overflow
             }}>
          {/* Image Display */}
          <div className="relative bg-white flex items-center justify-center"
            style={{ 
              borderRadius: '6px',
              overflow: 'hidden',
              minWidth: '100px', // Reduced min width
              minHeight: '100px', // Reduced min height
              maxHeight: '150px' // Limit max height to prevent overflow
            }}
          >
            <img
              src={thumbnailUrl}
              alt="Product thumbnail"
              className="block"
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                margin: '4px', // Small margin for better presentation
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
                    <div class="flex flex-col items-center justify-center text-red-500 text-center bg-white" style="height: 100px; width: 100px;">
                      <div class="text-2xl">❌</div>
                      <div class="text-xs mt-1">Failed to Load</div>
                      <div class="text-xs">Thumbnail</div>
                    </div>
                  `;
                }
              }}
              onLoad={(e) => {
                // Adjust container size based on image aspect ratio but keep it contained
                const img = e.target as HTMLImageElement;
                const container = img.parentElement?.parentElement;
                if (container && img.naturalWidth && img.naturalHeight) {
                  const aspectRatio = img.naturalWidth / img.naturalHeight;
                  const maxHeight = 150; // Reduced to prevent grid overflow
                  const maxWidth = 200;  // Reduced to prevent grid overflow
                  
                  let width = img.naturalWidth;
                  let height = img.naturalHeight;
                  
                  // Scale down if too large
                  if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                  }
                  if (width > maxWidth) {
                    width = maxWidth;
                    height = width / aspectRatio;
                  }
                  
                  // Ensure minimum size but smaller than before
                  if (width < 100) {
                    width = 100;
                    height = width / aspectRatio;
                  }
                  if (height < 100) {
                    height = 100;
                    width = height * aspectRatio;
                  }
                  
                  // Final check to ensure we don't exceed container limits
                  if (width > maxWidth) {
                    width = maxWidth;
                    height = width / aspectRatio;
                  }
                  if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                  }
                  
                  container.style.width = `${Math.round(width + 8)}px`; // Reduced padding
                  container.style.height = `${Math.round(height + 8)}px`; // Reduced padding
                }
              }}
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 pointer-events-none" />
          
          {/* Remove Button */}
          {!disabled && !uploading && (
            <Button
              variant="destructive"
              size="sm"
              onClick={removeThumbnail}
              disabled={isDeleting}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-1 h-auto w-auto min-w-[28px] min-h-[28px] disabled:opacity-50 z-20"
              style={{ zIndex: 20 }}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Status Badge */}
          <div className="absolute bottom-2 left-2">
            {isExisting && (
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                Saved
              </div>
            )}
            {isNewUpload && (
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                New
              </div>
            )}
          </div>

          {/* Replace Button */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileInputClick}
              className="bg-blue-600 hover:bg-blue-700 text-white p-1 h-auto"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center',
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ 
            width: '100px', 
            height: '100px',
            backgroundColor: '#ffffff' // Force white background
          }}
          onClick={handleFileInputClick}
        >
          <Upload className="w-6 h-6 mb-1 text-gray-400" />
          <p className="text-xs text-gray-600 text-center">
            {isDragActive ? 'Drop here' : 'Click to upload'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Recommended: Square image, max {maxSize}MB (JPEG, PNG, WebP)
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          Note: Thumbnail is used for SEO meta tags. The first gallery image will be displayed as the main product image.
        </p>
      </div>
    </div>
  );
}
