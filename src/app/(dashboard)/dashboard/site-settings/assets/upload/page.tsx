'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Upload,
  FileImage,
  X,
  CheckCircle,
  AlertCircle,
  Cloud,
  HardDrive,
  Globe,
  FolderOpen,
  UploadCloud,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFormData {
  disk: 'local' | 'public' | 's3';
  path: string;
  files: File[];
}

interface UploadResult {
  file: File;
  result?: any;
  error?: string;
  uploading?: boolean;
  preview?: string;
}

const diskOptions = [
  {
    value: 'local' as const,
    label: 'Local',
    icon: HardDrive,
  },
  {
    value: 'public' as const,
    label: 'Public',
    icon: Globe,
  },
  {
    value: 's3' as const,
    label: 'S3',
    icon: Cloud,
  },
];

export default function AssetUploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UploadFormData>({
    disk: 'public',
    path: 'uploads',
    files: [],
  });

  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadResults.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [uploadResults]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; options: { path?: string; disk?: 'local' | 'public' | 's3' } }) =>
      adminApi.uploadFile(data.file, data.options),
    onSuccess: (result, variables) => {
      setUploadResults(prev => prev.map(item => 
        item.file === variables.file 
          ? { ...item, result, uploading: false }
          : item
      ));
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success(`${variables.file.name} uploaded successfully!`);
    },
    onError: (error: any, variables) => {
      setUploadResults(prev => prev.map(item => 
        item.file === variables.file 
          ? { ...item, error: error.message || 'Upload failed', uploading: false }
          : item
      ));
      toast.error(`Failed to upload ${variables.file.name}: ${error.message || 'Unknown error'}`);
    },
  });

  const handleInputChange = (field: keyof Omit<UploadFormData, 'files'>, value: string) => {
    setFormData(prev => {
      // Show toast when storage type changes
      if (field === 'disk' && prev.disk !== value) {
        const diskLabels = { local: 'Local (Private)', public: 'Public', s3: 'S3 Cloud' };
        toast.info(`Storage changed to ${diskLabels[value as keyof typeof diskLabels] || value}`);
      }
      return { ...prev, [field]: value };
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (newFiles: File[]) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
    
    const allowedFiles = newFiles.filter(file => {
      if (!validTypes.includes(file.type)) {
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const rejectedByTypeCount = newFiles.filter(file => !validTypes.includes(file.type)).length;
    const rejectedBySizeCount = newFiles.filter(file => file.size > maxSize && validTypes.includes(file.type)).length;
    
    if (rejectedByTypeCount > 0) {
      toast.warning(`${rejectedByTypeCount} file(s) rejected. Only images, SVG, and PDF files are allowed.`);
    }
    
    if (rejectedBySizeCount > 0) {
      toast.error(`${rejectedBySizeCount} file(s) rejected due to size limit (max 10MB).`);
    }

    if (allowedFiles.length > 0) {
      toast.success(`${allowedFiles.length} file(s) added for upload`);
    }

    // If all previous uploads are complete, clear them and start fresh
    if (allUploadsComplete) {
      // Clean up previous preview URLs to prevent memory leaks
      uploadResults.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });

      // Start fresh with only new files
      setFormData(prev => ({
        ...prev,
        files: allowedFiles
      }));

      const newResults: UploadResult[] = allowedFiles.map(file => ({ 
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      setUploadResults(newResults);
    } else {
      // Add to existing files if uploads are still in progress
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...allowedFiles]
      }));

      const newResults: UploadResult[] = allowedFiles.map(file => ({ 
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      setUploadResults(prev => [...prev, ...newResults]);
    }
  };

  const removeFile = (fileToRemove: File) => {
    // Clean up preview URL to prevent memory leaks
    const itemToRemove = uploadResults.find(item => item.file === fileToRemove);
    if (itemToRemove?.preview) {
      URL.revokeObjectURL(itemToRemove.preview);
    }
    
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file !== fileToRemove)
    }));
    setUploadResults(prev => prev.filter(item => item.file !== fileToRemove));
    toast.info(`Removed ${fileToRemove.name} from upload queue`);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleUpload = async () => {
    if (formData.files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    toast.info(`Starting upload of ${formData.files.length} file(s)...`);
    setUploadResults(prev => prev.map(item => ({ ...item, uploading: true, error: undefined })));

    let successCount = 0;
    let errorCount = 0;

    for (const file of formData.files) {
      try {
        await uploadMutation.mutateAsync({
          file,
          options: {
            path: formData.path.trim() || undefined,
            disk: formData.disk,
          }
        });
        successCount++;
      } catch (error) {
        console.error('Upload error:', error);
        errorCount++;
      }
    }

    // Final summary toast
    if (successCount > 0 && errorCount === 0) {
      toast.success(`All ${successCount} file(s) uploaded successfully! 🎉`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} file(s) uploaded, ${errorCount} failed`);
    } else if (errorCount > 0) {
      toast.error(`All ${errorCount} file(s) failed to upload`);
    }
  };

  const handleReset = () => {
    // Clean up all preview URLs to prevent memory leaks
    uploadResults.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    
    setFormData({
      disk: 'public',
      path: 'uploads',
      files: [],
    });
    setUploadResults([]);
    toast.info('Upload queue cleared');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrls(prev => new Set([...prev, url]));
      toast.success('File path copied to clipboard!', { duration: 2000 });
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const allUploadsComplete = uploadResults.length > 0 && uploadResults.every(item => item.result || item.error);
  const successfulUploads = uploadResults.filter(item => item.result).length;
  const failedUploads = uploadResults.filter(item => item.error).length;
  const isUploading = uploadResults.some(item => item.uploading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Upload Assets</h1>
          </div>
          {uploadResults.length > 0 && (
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-400">{formData.files.length} files</span>
              {successfulUploads > 0 && <span className="text-green-400">{successfulUploads} uploaded</span>}
              {failedUploads > 0 && <span className="text-red-400">{failedUploads} failed</span>}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Compact Control Bar */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Storage Selection */}
              <div className="flex space-x-1">
                {diskOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.disk === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('disk', option.value)}
                      type="button"
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Path Input */}
              <div className="flex items-center space-x-2 min-w-0 flex-1 max-w-xs">
                <FolderOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <Input
                  value={formData.path}
                  onChange={(e) => handleInputChange('path', e.target.value)}
                  placeholder="uploads/path"
                  className="bg-white/10 border-white/20 text-white text-sm placeholder-slate-400 focus:border-blue-400 h-9"
                />
              </div>
            </div>
          </div>

          {/* Full Width Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative backdrop-blur-xl rounded-xl p-12 text-center transition-all duration-300 border-2 border-dashed min-h-[300px] flex flex-col items-center justify-center",
              isDragging
                ? "border-blue-400 bg-blue-500/20 scale-[1.02]"
                : "border-white/20 bg-white/5 hover:border-white/30"
            )}
          >
            <div className="relative z-10">
              <UploadCloud className={cn(
                "h-16 w-16 mx-auto mb-6 transition-colors duration-300",
                isDragging ? "text-blue-400 animate-bounce" : "text-slate-400"
              )} />
              
              <h3 className="text-2xl font-bold text-white mb-3">
                {isDragging ? 'Drop files here' : 'Drop files or browse'}
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                JPG, PNG, GIF, WebP, SVG, PDF up to 10MB each
              </p>

              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  type="button"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-lg cursor-pointer"
                  asChild
                >
                  <span className="flex items-center space-x-2 cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span>Browse Files</span>
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* File List with Upload Controls */}
          {uploadResults.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileImage className="h-5 w-5 mr-2 text-blue-400" />
                    Files ({uploadResults.length})
                  </h3>
                  {!allUploadsComplete && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 text-sm"
                      >
                        {isUploading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          'Upload All'
                        )}
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="border-white/20 text-slate-300 hover:bg-white/10 px-4 py-2 text-sm"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {uploadResults.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            {item.preview ? (
                              <div className="relative">
                                <img
                                  src={item.preview}
                                  alt={item.file.name}
                                  className="h-12 w-12 object-cover rounded-lg border border-white/20"
                                />
                                {item.uploading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="h-12 w-12 bg-slate-700 rounded-lg border border-white/20 flex items-center justify-center">
                                  {item.file.type === 'application/pdf' ? (
                                    <span className="text-red-400 text-xs font-bold">PDF</span>
                                  ) : item.file.type === 'image/svg+xml' ? (
                                    <span className="text-green-400 text-xs font-bold">SVG</span>
                                  ) : (
                                    <FileImage className="h-6 w-6 text-slate-400" />
                                  )}
                                </div>
                                {item.uploading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate text-sm">
                              {item.file.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-slate-400">
                              <span>{formatFileSize(item.file.size)}</span>
                              {item.result && (
                                <span className="text-green-400 flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Uploaded
                                </span>
                              )}
                              {item.error && (
                                <span className="text-red-400 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {item.error}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {item.uploading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                          )}
                          {item.result && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {item.result?.path && (
                                <Button
                                  onClick={() => copyToClipboard(`/${item.result.path}`)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-green-400 hover:bg-green-500/20"
                                  title="Copy file path"
                                >
                                  {copiedUrls.has(`/${item.result.path}`) ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </>
                          )}
                          {item.error && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {!item.uploading && !item.result && !item.error && (
                            <Button
                              onClick={() => removeFile(item.file)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}