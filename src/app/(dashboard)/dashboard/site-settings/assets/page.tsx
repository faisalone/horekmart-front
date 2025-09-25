'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { adminApi } from '@/lib/admin-api';
import { Asset } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import {
  ArrowLeft,
  Plus,
  FileImage,
  Download,
  Trash2,
  AlertCircle,
  Search,
  Upload,
  Eye,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple Badge component to avoid import conflicts
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={cn("inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full border", className)}>
    {children}
  </span>
);

export default function AssetsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisk, setSelectedDisk] = useState<'all' | 'local' | 'public' | 's3'>('all');
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Fetch assets using React Query
  const {
    data: assets = [],
    isLoading,
    error,
  } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: () => adminApi.getAssets(),
  });

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => adminApi.deleteAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete asset:', error);
      toast.error('Failed to delete asset. Please try again.');
    },
  });

  const handleDeleteAsset = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      deleteMutation.mutate(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  const copyToClipboard = (text: string, itemId: string, type: 'url' | 'path' = 'path') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItems(prev => new Set([...prev, itemId]));
      
      // Show toast notification
      const message = type === 'url' 
        ? 'Public URL copied to clipboard!' 
        : 'Storage path copied to clipboard!';
      toast.success(message, { duration: 2000 });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter assets based on search and disk selection
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisk = selectedDisk === 'all' || asset.disk === selectedDisk;
    return matchesSearch && matchesDisk;
  });

  const getDiskBadgeColor = (disk: string) => {
    switch (disk) {
      case 'local':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'public':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 's3':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-600/20 text-slate-300 border-slate-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <FileImage className="h-8 w-8" />
                <span>Loading Assets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-700/50 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Assets error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <Card className="border-red-500/50 bg-red-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-red-400 text-2xl">
                <AlertCircle className="h-8 w-8" />
                <span>Error Loading Assets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-200 text-lg">
                Failed to load assets. Please try refreshing the page.
              </p>
              {error instanceof Error && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-red-300 font-mono text-sm">
                    Error: {error.message}
                  </p>
                </div>
              )}
              <div className="flex space-x-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/site-settings')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Back to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Back Button */}
        <div>
          <Link href="/dashboard/site-settings">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Settings</span>
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white">Asset Management</h1>
            <p className="text-slate-300 mt-2 text-lg">
              Manage uploaded files and assets across different storage disks
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/site-settings/assets/upload">
              <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="h-4 w-4" />
                <span>Upload Asset</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search assets by name or path..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Disk Filter */}
              <select
                value={selectedDisk}
                onChange={(e) => setSelectedDisk(e.target.value as any)}
                className="px-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Disks</option>
                <option value="local">Local (Private)</option>
                <option value="public">Public</option>
                <option value="s3">S3</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Assets ({filteredAssets.length} total)
            </h2>
          </div>

          {filteredAssets.length === 0 ? (
            <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <FileImage className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Assets Found</h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm || selectedDisk !== 'all' 
                    ? 'No assets match your current filters.'
                    : 'Upload your first asset to get started.'
                  }
                </p>
                <Link href="/dashboard/site-settings/assets/upload">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Asset
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:bg-slate-900/90 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Asset Preview */}
                      <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                        {asset.url ? (
                          <Image 
                            src={asset.url} 
                            alt={asset.name}
                            fill
                            className="object-cover"
                            onError={() => {
                              // Handle error by showing fallback
                            }}
                          />
                        ) : null}
                        <div className={cn("flex flex-col items-center justify-center text-slate-400", asset.url ? "hidden" : "")}>
                          <FileImage className="h-12 w-12 mb-2" />
                          <span className="text-sm">No Preview</span>
                          <span className="text-xs text-slate-500">Private Storage</span>
                        </div>
                      </div>

                      {/* Asset Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">
                              {asset.name}
                            </h3>
                            <p className="text-sm text-slate-400 truncate">
                              {asset.path}
                            </p>
                          </div>
                          <Badge className={cn("ml-2 shrink-0", getDiskBadgeColor(asset.disk))}>
                            {asset.disk.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{formatFileSize(asset.size)}</span>
                          <span>ID: {asset.id.slice(0, 8)}...</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {asset.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(asset.url!, '_blank')}
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                        
                        {/* Copy URL/Path Button */}
                        {asset.url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(asset.url!, `url-${asset.id}`, 'url')}
                            className={cn(
                              "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200",
                              copiedItems.has(`url-${asset.id}`) && "border-green-500/50 text-green-400 bg-green-600/10"
                            )}
                            title="Copy File URL"
                          >
                            {copiedItems.has(`url-${asset.id}`) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(`${asset.path}`, `path-${asset.id}`, 'path')}
                            className={cn(
                              "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200",
                              copiedItems.has(`path-${asset.id}`) && "border-green-500/50 text-green-400 bg-green-600/10"
                            )}
                            title="Copy Storage Path (Private)"
                          >
                            {copiedItems.has(`path-${asset.id}`) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        
                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAsset(asset)}
                          disabled={deleteMutation.isPending}
                          className="border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white"
                          title="Delete Asset"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Asset"
          description={`Are you sure you want to delete "${assetToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Asset"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />

      </div>
    </div>
  );
}