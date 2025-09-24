"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import heic2any from "heic2any";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { DraggableItem } from "@/components/ui/DraggableItem";
import { applyWatermark, batchApplyWatermark } from "@/utils/watermark";

export interface UploadedImage {
  id?: number | string;
  file?: File;
  url?: string;
  preview: string;
  alt_text?: string;
  sort_order?: number;
  isExisting?: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  onDeleteExistingImage?: (imageId: number | string, productId: string | number) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // MB
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
  logoWatermark = null,
}: ImageUploadProps) {
  const [deletingImageId, setDeletingImageId] = useState<number | string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingWatermark, setIsProcessingWatermark] = useState(false);
  const [watermarkProgress, setWatermarkProgress] = useState(0);
  const [watermarkPreviews, setWatermarkPreviews] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});

  const processedImagesRef = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stableBlobUrlsRef = useRef<Map<string, string>>(new Map());
  const lastWatermarkStateRef = useRef<boolean>(false);

  const dragAndDrop = useDragAndDrop({ items: images, onReorder: onImagesChange, disabled: disabled || uploading });

  const convertHeicToJpeg = useCallback(async (file: File): Promise<File> => {
    if (!file.type.includes("heic") && !/\.(heic|heif)$/i.test(file.name)) return file;
    const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg", lastModified: file.lastModified });
  }, []);

  const imageKeys = useMemo(
    () => images.map((img) => img.id?.toString() || img.preview || img.file?.name || "unknown"),
    [images]
  );

  const applyWatermarkToImage = useCallback(
    async (imageIndex: number) => {
      const image = images[imageIndex];
      if (!image) return;
      const imageKey = imageKeys[imageIndex];

      if (previewLoading[imageKey] || processedImagesRef.current.has(imageKey)) return;
      if (stableBlobUrlsRef.current.has(imageKey) && enableWatermark) return;

      setPreviewLoading((p) => ({ ...p, [imageKey]: true }));
      processedImagesRef.current.add(imageKey);

      try {
        let imageFile: File | undefined;
        if (image.file) {
          imageFile = image.file;
        } else if (image.preview || image.url) {
          let imageUrl = image.preview || image.url!;
          if (!imageUrl.startsWith("blob:") && !imageUrl.startsWith("data:")) {
            imageUrl = `/api/watermark-proxy?url=${encodeURIComponent(imageUrl)}`;
          }
          const response = await fetch(imageUrl, { cache: "no-store" });
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
          const blob = await response.blob();
          const fileName = `watermarked-${Date.now()}.jpg`;
          imageFile = new File([blob], fileName, { type: blob.type || "image/jpeg" });
        }
        if (!imageFile) return;

        const watermarkedFile = await applyWatermark(imageFile, logoWatermark, {
          opacity: 0.1,
          position: "center",
          size: 35,
        });

        let watermarkedPreview = stableBlobUrlsRef.current.get(imageKey);
        if (!watermarkedPreview) {
          watermarkedPreview = URL.createObjectURL(watermarkedFile);
          stableBlobUrlsRef.current.set(imageKey, watermarkedPreview);
        }

        onImagesChange((prev) => {
          const next = [...prev];
          const idx = prev.findIndex((img) => (img.id?.toString() || img.preview) === imageKey);
          if (idx === -1) return prev;
          const prevImg = next[idx];
          if (
            prevImg.preview !== watermarkedPreview &&
            prevImg.preview.startsWith("blob:") &&
            !stableBlobUrlsRef.current.has(imageKey)
          ) {
            try { URL.revokeObjectURL(prevImg.preview); } catch {}
          }
          next[idx] = { ...prevImg, file: watermarkedFile, preview: watermarkedPreview!, isExisting: false };
          return next;
        });

        setWatermarkPreviews((p) => ({ ...p, [imageKey]: watermarkedPreview! }));
      } catch (e) {
        processedImagesRef.current.delete(imageKey);
        console.error("Watermark apply failed", e);
      } finally {
        setPreviewLoading((p) => ({ ...p, [imageKey]: false }));
      }
    },
    [images, imageKeys, enableWatermark, logoWatermark, onImagesChange, previewLoading]
  );

  useEffect(() => {
    return () => {
      stableBlobUrlsRef.current.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
      stableBlobUrlsRef.current.clear();
      setWatermarkPreviews((prev) => {
        Object.values(prev).forEach((u) => { if (u.startsWith("blob:")) { try { URL.revokeObjectURL(u); } catch {} } });
        return {};
      });
    };
  }, []);

  useEffect(() => {
    if (!enableWatermark || !logoWatermark) { lastWatermarkStateRef.current = false; return; }
    if (lastWatermarkStateRef.current === enableWatermark) return;
    lastWatermarkStateRef.current = true;
    (async () => {
      for (let i = 0; i < images.length; i++) {
        const key = imageKeys[i];
        const img = images[i];
        if (processedImagesRef.current.has(key) || previewLoading[key] || img.file?.name.includes("watermarked-") || stableBlobUrlsRef.current.has(key)) continue;
        await applyWatermarkToImage(i);
        await new Promise((r) => setTimeout(r, 60));
      }
    })();
  }, [enableWatermark, logoWatermark, images.length, imageKeys, applyWatermarkToImage, previewLoading]);

  useEffect(() => {
    if (!enableWatermark) {
      lastWatermarkStateRef.current = false;
      stableBlobUrlsRef.current.forEach((url) => { try { URL.revokeObjectURL(url); } catch {} });
      stableBlobUrlsRef.current.clear();
      setWatermarkPreviews({});
      setPreviewLoading({});
      processedImagesRef.current.clear();
      onImagesChange((prev) => prev.map((img) => ({ ...img, preview: img.url || img.preview })));
    }
  }, [enableWatermark, onImagesChange]);

  const previousImagesRef = useRef<UploadedImage[]>([]);
  useEffect(() => {
    const prev = previousImagesRef.current;
    const curr = images;
    const removed = prev.filter((p) => !curr.some((c) => c.id === p.id || c.preview === p.preview));
    removed.forEach((ri) => {
      if (ri.preview?.startsWith("blob:") && !ri.isExisting) {
        try { URL.revokeObjectURL(ri.preview); } catch {}
      }
    });
    previousImagesRef.current = curr;
  }, [images]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      if (disabled || uploading) return;
      const image = images[index];
      const key = imageKeys[index];
      const stable = stableBlobUrlsRef.current.get(key);
      if (stable) { try { URL.revokeObjectURL(stable); } catch {}; stableBlobUrlsRef.current.delete(key); }
      if (watermarkPreviews[key]) { try { URL.revokeObjectURL(watermarkPreviews[key]); } catch {} }
      if (image.preview?.startsWith("blob:") && !image.isExisting && !stable) { try { URL.revokeObjectURL(image.preview); } catch {} }
      setWatermarkPreviews((p) => { const { [key]: _, ...rest } = p; return rest; });
      setPreviewLoading((p) => { const { [key]: __, ...rest } = p; return rest; });
      processedImagesRef.current.delete(key);
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, imageKeys, disabled, uploading, watermarkPreviews, onImagesChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (disabled || uploading) return;
      rejectedFiles.forEach(({ file, errors }) => {
        const error = errors[0];
        const msgs: Record<string, string> = {
          "file-too-large": `"${file.name}" is too large (max ${maxSize}MB)`,
          "file-invalid-type": `"${file.name}" is not a valid image`,
          "too-many-files": `Maximum ${maxFiles} images allowed`,
          "file-invalid": `"${file.name}" is invalid or empty`,
        };
        toast.error(msgs[error.code] || `"${file.name}" was rejected`);
      });
      if (images.length + acceptedFiles.length > maxFiles) { toast.error(`Cannot add ${acceptedFiles.length} images. Limit: ${maxFiles}`); return; }
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      (async () => {
        try {
          const converted: File[] = [];
          const fails: string[] = [];
          for (const f of acceptedFiles) {
            try { converted.push(await convertHeicToJpeg(f)); } catch (e) { console.error("HEIC conversion error:", e); fails.push(f.name); }
          }
          if (fails.length) toast.error(`Failed to convert HEIC files: ${fails.join(", ")}`);
          if (converted.length === 0) { setIsUploading(false); return; }
          if (enableWatermark) {
            setIsProcessingWatermark(true); setWatermarkProgress(0);
            try {
              const watermarked = await batchApplyWatermark(converted, logoWatermark, { opacity: 0.1, position: "center", size: 35 }, setWatermarkProgress);
              const newImages = watermarked.map((file, idx) => ({ id: `temp-${Date.now()}-${idx}`, file, preview: URL.createObjectURL(file), alt_text: "", sort_order: images.length + idx, isExisting: false } as UploadedImage));
              newImages.forEach((ni) => processedImagesRef.current.add(ni.id!.toString()));
              onImagesChange([...images, ...newImages]);
              toast.success(converted.length === 1 ? "Image added with watermark" : `${converted.length} images added with watermark`);
            } catch (e) {
              toast.error("Failed to apply watermark, images added without watermark");
              const newImages = converted.map((file, idx) => ({ id: `temp-${Date.now()}-${idx}`, file, preview: URL.createObjectURL(file), alt_text: "", sort_order: images.length + idx, isExisting: false }));
              onImagesChange([...images, ...newImages]);
            } finally {
              setIsProcessingWatermark(false); setWatermarkProgress(0); setIsUploading(false);
            }
          } else {
            const newImages = converted.map((file, idx) => ({ id: `temp-${Date.now()}-${idx}`, file, preview: URL.createObjectURL(file), alt_text: "", sort_order: images.length + idx, isExisting: false }));
            onImagesChange([...images, ...newImages]);
            toast.success(converted.length === 1 ? "Image added" : `${converted.length} images added`);
            setIsUploading(false);
          }
        } catch (e) {
          console.error("Image processing error:", e);
          toast.error("Failed to process images");
          setIsUploading(false); setIsProcessingWatermark(false); setWatermarkProgress(0);
        }
      })();
    },
    [images, onImagesChange, disabled, uploading, maxFiles, maxSize, enableWatermark, logoWatermark, convertHeicToJpeg]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"], "image/heic": [".heic", ".heif"] },
    maxFiles: maxFiles - images.length,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading || isProcessingWatermark || images.length >= maxFiles,
    noClick: true,
    multiple: true,
    noDrag: false,
    preventDropOnDocument: false,
    validator: (file) => {
      if (file.size === 0) return { code: "file-invalid", message: "File is empty or corrupt" };
      if (!file.type.startsWith("image/") && !file.type.includes("heic") && !/\.(heic|heif)$/i.test(file.name)) return { code: "file-invalid-type", message: "File is not a valid image" };
      return null;
    },
  });

  const handleFileInputClick = () => fileInputRef.current?.click();
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) onDrop(files, []);
    event.target.value = "";
  };

  const getImageSrc = useCallback(
    (image: UploadedImage, imageKey: string) => {
      const stable = stableBlobUrlsRef.current.get(imageKey);
      if (stable && enableWatermark) return stable;
      const wm = watermarkPreviews[imageKey];
      if (wm && enableWatermark) return wm;
      return image.preview;
    },
    [enableWatermark, watermarkPreviews]
  );

  const canAddMore = images.length < maxFiles && !disabled && !uploading && !isProcessingWatermark;

  return (
    <div className={cn("space-y-4", className)}>
      <input ref={fileInputRef} type="file" multiple accept="image/*,.heic,.heif" onChange={handleFileInputChange} style={{ display: "none" }} />

      {logoWatermark && onWatermarkChange && (
        <div
          onClick={!disabled && !uploading && !isProcessingWatermark && images.length > 0 ? () => onWatermarkChange(!enableWatermark) : undefined}
          className={cn(
            "flex items-center gap-3 p-4 border rounded-lg transition-all",
            enableWatermark ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
            !disabled && !uploading && !isProcessingWatermark && images.length > 0 ? "cursor-pointer hover:border-blue-300 hover:bg-blue-25" : "cursor-not-allowed",
            (disabled || uploading || isProcessingWatermark || images.length === 0) && "opacity-50"
          )}
        >
          <div className={cn("w-12 h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all relative", enableWatermark ? "border-blue-500 bg-white shadow-md" : "border-gray-300 dark:border-gray-600 bg-white hover:border-blue-400")}
          >
            <Image src={logoWatermark} alt="Watermark logo" width={48} height={48} className="w-full h-full object-contain" unoptimized />
          </div>
          <div className="flex-1">
            <div className={cn("text-sm font-medium", enableWatermark ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300")}>Apply Watermark</div>
            <div className={cn("text-xs", enableWatermark ? "text-blue-700 dark:text-blue-200" : "text-gray-500 dark:text-gray-400")}>
              {images.length === 0 ? "Upload images first to apply watermark" : enableWatermark ? `Watermark applied to ${images.length} image${images.length !== 1 ? "s" : ""}` : `Apply watermark to ${images.length} image${images.length !== 1 ? "s" : ""}`}
            </div>
          </div>
          <div className={cn("w-4 h-4 rounded-full border-2 transition-all", enableWatermark ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600")}>{enableWatermark && <div className="w-full h-full rounded-full bg-white transform scale-50" />}</div>
        </div>
      )}

      {isProcessingWatermark && images.length > 0 && (
        <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Applying watermarks...</span>
            <span className="text-sm text-blue-700 dark:text-blue-300">{Math.round(watermarkProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${watermarkProgress}%` }} />
          </div>
        </div>
      )}

      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
            (disabled || isProcessingWatermark) && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleFileInputClick}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{isDragActive ? "Drop images here" : "Click to upload images"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or drag & drop files here{enableWatermark && " (watermark will be applied)"}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Max {maxFiles} images, up to {maxSize}MB each (JPEG, PNG, WebP, HEIC)</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Images ({images.length}/{maxFiles})</h4>
            {(uploading || isProcessingWatermark) && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isProcessingWatermark ? "Processing watermarks..." : "Uploading..."}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {images.map((image, index) => {
              const imageKey = imageKeys[index];
              const displaySrc = getImageSrc(image, imageKey);
              const isDeleting = deletingImageId === image.id;
              const dragStyles = dragAndDrop.getDragStyles(index);
              const reactKey = image.id != null ? `img-${image.id}` : image.preview ? `preview-${image.preview}-${index}` : `file-${image.file?.name || "unknown"}-${index}`;
              const isGeneratingPreview = previewLoading[imageKey];
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
                  dragStyles={{ ...dragStyles, height: "120px", maxWidth: "200px", minWidth: "80px" }}
                  className="flex-shrink-0"
                >
                  <div className="w-full h-full bg-white flex items-center justify-center relative">
                    {displaySrc ? (
                      <>
                        <img
                          src={displaySrc}
                          alt={image.alt_text || `Image ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="block object-contain"
                          style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" }}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = "/placeholder-product.svg"; }}
                        />
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
          {allowReorder && <p className="text-xs text-gray-500 dark:text-gray-400">💡 Tip: Drag images to reorder them. The first image will be the main product image.</p>}
        </div>
      )}
    </div>
  );
}
