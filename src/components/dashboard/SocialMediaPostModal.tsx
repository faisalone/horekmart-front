'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Calendar as CalendarIcon,
  X,
  Wand2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { adminApi } from '@/lib/admin-api';
import type { Product, SocialMediaPostResponse, SocialMediaPostResult } from '@/types/admin';

interface SocialMediaPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

type Platform = 'facebook' | 'instagram';
type ScheduleType = 'now' | 'schedule';

interface SocialMediaPost {
  platform: Platform;
  caption: string;
  images: string[];
  scheduled_at?: string;
}

const PLATFORMS = [
  {
    id: 'facebook' as Platform,
    name: 'Facebook',
    icon: FaFacebook,
    color: 'text-blue-500',
  },
  {
    id: 'instagram' as Platform,
    name: 'Instagram',
    icon: FaInstagram,
    color: 'text-pink-500',
  },
];

export function SocialMediaPostModal({ open, onOpenChange, product }: SocialMediaPostModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(undefined);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [postResult, setPostResult] = useState<SocialMediaPostResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedPlatforms([]);
    setCaption('');
    setSelectedImages([]);
    setScheduledTime(undefined);
    setGeneratedCaptions([]);
    setCurrentCaptionIndex(0);
    setPostResult(null);
    setShowResults(false);
  }, []);

  // Clean HTML and format description for social media
  const formatDescriptionForSocialMedia = (htmlDescription: string | null | undefined): string => {
    if (!htmlDescription) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlDescription;
    
    // Extract emoji alt text from img tags
    const emojiImages = tempDiv.querySelectorAll('img[alt]');
    emojiImages.forEach(img => {
      const emoji = img.getAttribute('alt');
      if (emoji) {
        img.replaceWith(document.createTextNode(emoji));
      }
    });
    
    // Get text content and clean it up
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up extra whitespace and newlines
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // Replace multiple spaces with single space
    cleanText = cleanText.replace(/  +/g, ' ');
    
    return cleanText;
  };

  // Clear scheduled time
  const clearScheduledTime = () => {
    setScheduledTime(undefined);
  };

  // Toggle platform selection
  const togglePlatformSelection = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Generate AI caption with Gemini
  const generateCaptionMutation = useMutation({
    mutationFn: async () => {
      if (!product) {
        throw new Error('Product is required');
      }
      
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }

      const data = await response.json();
      return data.caption;
    },
    onSuccess: (caption) => {
      setGeneratedCaptions(prev => [...prev, caption]);
      setCurrentCaptionIndex(generatedCaptions.length);
      setCaption(caption);
      setIsGeneratingCaption(false);
    },
    onError: (error) => {
      console.error('Failed to generate caption:', error);
      setIsGeneratingCaption(false);
    },
  });

  const generateCaption = () => {
    setIsGeneratingCaption(true);
    generateCaptionMutation.mutate();
  };

  const nextCaption = () => {
    if (currentCaptionIndex < generatedCaptions.length - 1) {
      const newIndex = currentCaptionIndex + 1;
      setCurrentCaptionIndex(newIndex);
      setCaption(generatedCaptions[newIndex]);
    }
  };

  const previousCaption = () => {
    if (currentCaptionIndex > 0) {
      const newIndex = currentCaptionIndex - 1;
      setCurrentCaptionIndex(newIndex);
      setCaption(generatedCaptions[newIndex]);
    }
  };

  // Toggle image selection
  const toggleImageSelection = (image: string) => {
    setSelectedImages(prev => 
      prev.includes(image) 
        ? prev.filter(img => img !== image)
        : prev.length < 10 ? [...prev, image] : prev
    );
  };

  // Post to social media
  const postMutation = useMutation({
    mutationFn: () => {
      if (selectedPlatforms.length === 0 || !caption || selectedImages.length === 0) {
        throw new Error('Platform, caption, and images are required');
      }

      const posts = selectedPlatforms.map(platform => ({
        platform,
        caption,
        images: selectedImages, // Send selected images
        ...(scheduledTime && scheduledTime > new Date() && {
          scheduled_at: scheduledTime.toISOString()
        })
      }));

      return adminApi.postToSocialMedia(posts); // Remove product.id
    },
    onSuccess: (data: any) => {
      // Transform the API response to match our expected format
      let transformedData: SocialMediaPostResponse;
      
      if (data.results && typeof data.results === 'object' && !Array.isArray(data.results)) {
        // Handle object format: { instagram: {...}, facebook: {...} }
        const resultsArray = Object.entries(data.results).map(([platform, result]: [string, any]) => ({
          ...result,
          platform: platform
        }));
        
        const successfulPosts = resultsArray.filter((r: SocialMediaPostResult) => r.success).length;
        const failedPosts = resultsArray.filter((r: SocialMediaPostResult) => !r.success).length;
        
        transformedData = {
          success: data.success,
          message: data.message,
          execution_time: data.execution_time,
          results: resultsArray,
          summary: {
            total_platforms: resultsArray.length,
            successful_posts: successfulPosts,
            failed_posts: failedPosts,
            platforms_attempted: resultsArray.map((r: SocialMediaPostResult) => r.platform)
          }
        };
      } else {
        // Handle array format (existing format)
        transformedData = data as SocialMediaPostResponse;
      }
      
      setPostResult(transformedData);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Failed to post to social media:', error);
      // You could show an error notification here
    },
  });

  const handlePost = () => {
    postMutation.mutate();
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate share URL based on platform and result data
  const getShareUrl = (result: SocialMediaPostResult) => {
    // First, try to use post_url if available from backend
    if (result.post_url) {
      return result.post_url;
    }
    
    // Fallback URL generation if post_url is not available
    if (!result.post_id) {
      return '#';
    }

    switch (result.platform.toLowerCase()) {
      case 'facebook':
        // Facebook post IDs are usually in format pageId_postId
        return `https://www.facebook.com/${result.post_id}`;
      case 'instagram':
        // Instagram URLs cannot be reliably constructed from media IDs
        // The media ID format (like 18062219063461560) doesn't map to Instagram URLs
        // Instagram URLs use base36-encoded strings (like DNDqDJ5tBnb)
        // We should rely on the backend to provide the permalink
        console.warn('Instagram URL requested but no permalink available from backend');
        return '#'; // Don't attempt to construct Instagram URLs
      default:
        return '#';
    }
  };

  // Handle starting a new post
  const handleNewPost = () => {
    setShowResults(false);
    setPostResult(null);
  };

  // Handle closing modal
  const handleCloseModal = useCallback(() => {
    onOpenChange(false);
    resetForm();
  }, [onOpenChange, resetForm]);

  const isPosting = postMutation.isPending;

  // Initialize images when product changes
  useEffect(() => {
    if (product && open) {
      const images: string[] = [];
      
      // Add main product image
      if (product.image) {
        images.push(product.image);
      }
      
      // Add gallery images
      if (product.images && product.images.length > 0) {
        product.images.forEach((img: any) => {
          if (typeof img === 'object' && img.url) {
            images.push(img.url);
          } else if (typeof img === 'object' && img.file_url) {
            images.push(img.file_url);
          } else if (typeof img === 'string') {
            images.push(img);
          }
        });
      }
      
      // Remove duplicates and take max 10 images
      const uniqueImages = [...new Set(images)].slice(0, 10);
      setAvailableImages(uniqueImages);
      setSelectedImages(uniqueImages.slice(0, Math.min(4, uniqueImages.length)));
    }
  }, [product, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, handleCloseModal]);

  if (!product || !open) return null;

  // Show results view after successful posting
  if (showResults && postResult) {
    // Ensure results is always an array
    const resultsArray = Array.isArray(postResult.results) ? postResult.results : [];
    const summary = postResult.summary || {
      total_platforms: resultsArray.length,
      successful_posts: resultsArray.filter((r: SocialMediaPostResult) => r.success).length,
      failed_posts: resultsArray.filter((r: SocialMediaPostResult) => !r.success).length,
      platforms_attempted: resultsArray.map((r: SocialMediaPostResult) => r.platform)
    };
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm"
        onClick={handleCloseModal}
      >
        <div 
          className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-white">Post Results</h2>
              <p className="text-gray-400 mt-1">{postResult.message}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-lg p-3 group"
              title="Close Modal"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Summary */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Summary</h3>
                <div className="flex items-center space-x-2">
                  {summary.successful_posts > 0 && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {summary.failed_posts > 0 && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Total Platforms:</span>
                  <span className="text-white ml-2">{summary.total_platforms}</span>
                </div>
                <div>
                  <span className="text-gray-400">Execution Time:</span>
                  <span className="text-white ml-2">{postResult.execution_time}</span>
                </div>
                <div>
                  <span className="text-green-400">Successful:</span>
                  <span className="text-white ml-2">{summary.successful_posts}</span>
                </div>
                <div>
                  <span className="text-red-400">Failed:</span>
                  <span className="text-white ml-2">{summary.failed_posts}</span>
                </div>
              </div>
            </div>

            {/* Platform Results */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Platform Results</h3>
              <div className="space-y-3">
                {resultsArray.map((result: SocialMediaPostResult, index: number) => {
                  const platform = PLATFORMS.find(p => p.name.toLowerCase() === result.platform.toLowerCase());
                  const Icon = platform?.icon || FaFacebook;
                  
                  return (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 ${
                        result.success 
                          ? 'border-green-500/30 bg-green-500/10' 
                          : 'border-red-500/30 bg-red-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-6 h-6 ${platform?.color || 'text-gray-400'}`} />
                          <div>
                            <h4 className="font-medium text-white">{result.platform}</h4>
                            <p className={`text-sm ${
                              result.success ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {result.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      {/* Post Actions for successful posts */}
                      {result.success && (result.post_id || result.post_url) && (
                        <div className="mt-3 pt-3 border-t border-gray-600 flex items-center space-x-2">
                          {getShareUrl(result) !== '#' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(getShareUrl(result), '_blank')}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Post
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(getShareUrl(result))}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </Button>
                            </>
                          )}
                          {getShareUrl(result) === '#' && result.success && (
                            <p className="text-sm text-green-400">
                              ✅ Posted successfully
                            </p>
                          )}
                        </div>
                      )}

                      {/* Error details for failed posts */}
                      {!result.success && result.error && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-sm text-red-400">
                            <strong>Error:</strong> {result.error}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleNewPost}
              className="text-gray-400 hover:text-white border-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Post
            </Button>
            <Button
              onClick={handleCloseModal}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Share Product on Social Media</h2>
            <p className="text-gray-400 mt-1">{product.name}</p>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-lg p-3 group"
            title="Close Modal"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Platform Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-white">Select Platforms</h3>
              <p className="text-gray-400 text-sm mb-3">Choose one or more platforms to share your product</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatformSelection(platform.id)}
                      className={`p-3 rounded-lg border-2 transition-all hover:bg-gray-800 ${
                        isSelected
                          ? 'border-blue-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${platform.color}`} />
                      <p className="text-xs font-medium text-white">{platform.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white">Caption</h3>
                <div className="flex gap-2">
                  {!isGeneratingCaption && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateCaption}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {generatedCaptions.length > 0 ? 'Regenerate' : 'AI Generate'}
                      </Button>
                      {generatedCaptions.length > 1 && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={previousCaption}
                            disabled={currentCaptionIndex === 0}
                            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-gray-400 px-2">
                            {currentCaptionIndex + 1} of {generatedCaptions.length}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={nextCaption}
                            disabled={currentCaptionIndex === generatedCaptions.length - 1}
                            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  placeholder="Write your caption here or generate one with AI..."
                  value={caption}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                  rows={4}
                  className="resize-y w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] max-h-[300px]"
                  disabled={isGeneratingCaption}
                />
                
                {/* Insert Description Button - Only show when textarea is empty */}
                {!caption && !isGeneratingCaption && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCaption(formatDescriptionForSocialMedia(product?.description))}
                    className="absolute bottom-3 right-3 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs"
                  >
                    Insert Description
                  </Button>
                )}
              </div>
              
              {isGeneratingCaption && (
                <div className="flex items-center justify-center py-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg mt-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <Wand2 className="absolute inset-0 m-auto w-4 h-4 text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <span className="text-white font-medium">Generating AI Caption...</span>
                    <p className="text-gray-400 text-sm">Creating engaging content for your product</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Select Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableImages.map((image, index) => (
                  <div key={index} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleImageSelection(image)}
                      className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                        selectedImages.includes(image)
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                    {selectedImages.includes(image) && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {selectedImages.length} of {availableImages.length} images selected
              </p>
            </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-700 p-4 sm:p-6 bg-gray-900">
          {/* Mobile Layout */}
          <div className="block sm:hidden space-y-4">
            {/* Schedule Row */}
            <div className="w-full">
              <DateTimePicker
                date={scheduledTime}
                onDateChange={setScheduledTime}
                placeholder="Schedule post"
                className="w-full"
              />
            </div>
            
            {/* Action Buttons Row */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="w-full text-gray-400 hover:text-white border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={selectedPlatforms.length === 0 || !caption || isPosting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPosting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : scheduledTime && scheduledTime > new Date() ? (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Now
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Left side - DateTimePicker */}
            <div className="flex items-center">
              <DateTimePicker
                date={scheduledTime}
                onDateChange={setScheduledTime}
                placeholder="Schedule post"
                className="min-w-[200px]"
              />
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={selectedPlatforms.length === 0 || !caption || isPosting}
                className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPosting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : scheduledTime && scheduledTime > new Date() ? (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
