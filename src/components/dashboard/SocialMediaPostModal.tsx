'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Sparkles,
  Send,
  Calendar as CalendarIcon,
  X,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Edit,
  Check,
  ArrowUp,
} from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { HiPencilAlt, HiDocumentText } from 'react-icons/hi';
import { adminApi } from '@/lib/admin-api';
import type { Product, SocialMediaPostResponse, SocialMediaPostResult } from '@/types/admin';

interface SocialMediaPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

type Platform = 'facebook' | 'instagram';

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

type CaptionMode = 'none' | 'manual' | 'ai-generated' | 'editing';

export function SocialMediaPostModal({ open, onOpenChange, product }: SocialMediaPostModalProps) {
  // Enhanced HTML to social media text converter with proper line breaks
  const htmlToText = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<h[1-6][^>]*>/gi, '')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [caption, setCaption] = useState('');
  const [aiGeneratedCaption, setAiGeneratedCaption] = useState('');
  const [promptText, setPromptText] = useState('');
  const [captionMode, setCaptionMode] = useState<CaptionMode>('none');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(undefined);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [postResult, setPostResult] = useState<SocialMediaPostResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedPlatforms([]);
    setCaption('');
    setAiGeneratedCaption('');
    setPromptText('');
    setCaptionMode('none');
    setSelectedImages([]);
    setScheduledTime(undefined);
    setPostResult(null);
    setShowResults(false);
  }, []);

  // Toggle platform selection
  const togglePlatformSelection = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Generate AI caption
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
        body: JSON.stringify({ 
          product,
          customPrompt: promptText.trim() || 'Write an engaging social media caption',
          previousCaptions: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }

      const data = await response.json();
      return data.caption;
    },
    onSuccess: (caption) => {
      setAiGeneratedCaption(caption);
      setCaptionMode('ai-generated');
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

  // Handle editing AI generated caption
  const handleEditAiCaption = () => {
    setCaption(aiGeneratedCaption);
    setCaptionMode('editing');
  };

  // Handle saving edited caption
  const handleSaveEdit = () => {
    setAiGeneratedCaption(caption);
    setCaptionMode('ai-generated');
  };

  // Handle manual input mode
  const handleInsertDescription = () => {
    setCaptionMode('manual');
    setCaption('');
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
      const currentCaption = captionMode === 'ai-generated'
        ? aiGeneratedCaption
        : caption;
      
      if (selectedPlatforms.length === 0 || !currentCaption || selectedImages.length === 0) {
        throw new Error('Platform, caption, and images are required');
      }

      const posts = selectedPlatforms.map(platform => ({
        platform,
        caption: currentCaption,
        images: selectedImages,
        ...(scheduledTime && scheduledTime > new Date() && {
          scheduled_at: scheduledTime.toISOString()
        })
      }));

      return adminApi.postToSocialMedia(posts);
    },
    onSuccess: (data: any) => {
      let transformedData: SocialMediaPostResponse;
      
      if (data.results && typeof data.results === 'object' && !Array.isArray(data.results)) {
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
        transformedData = data as SocialMediaPostResponse;
      }
      
      setPostResult(transformedData);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Failed to post to social media:', error);
    },
  });

  const handlePost = () => {
    postMutation.mutate();
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate share URL
  const getShareUrl = (result: SocialMediaPostResult) => {
    if (result.post_url) {
      return result.post_url;
    }
    
    if (!result.post_id) {
      return '#';
    }

    switch (result.platform.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/${result.post_id}`;
      case 'instagram':
        return '#';
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
      
      if (product.image) {
        images.push(product.image);
      }
      
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

  // Handle ESC key
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
    const resultsArray = Array.isArray(postResult.results) ? postResult.results : [];
    const summary = postResult.summary || {
      total_platforms: resultsArray.length,
      successful_posts: resultsArray.filter((r: SocialMediaPostResult) => r.success).length,
      failed_posts: resultsArray.filter((r: SocialMediaPostResult) => !r.success).length,
      platforms_attempted: resultsArray.map((r: SocialMediaPostResult) => r.platform)
    };

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={handleCloseModal}
      >
        <div 
          className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/10 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">Post Results</h2>
              <p className="text-gray-400 mt-1.5 text-sm font-medium">Social media sharing completed</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-xl p-2.5 group"
              title="Close Modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{summary.total_platforms}</div>
                  <div className="text-sm text-gray-400 mt-1">Total</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{summary.successful_posts}</div>
                  <div className="text-sm text-gray-400 mt-1">Success</div>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                  <div className="text-2xl font-bold text-red-400">{summary.failed_posts}</div>
                  <div className="text-sm text-gray-400 mt-1">Failed</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Platform Results</h3>
              <div className="space-y-4">
                {resultsArray.map((result: SocialMediaPostResult, index: number) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-2xl border ${
                      result.success 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-medium text-white capitalize">{result.platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.success && result.post_id && (
                          <button
                            onClick={() => copyToClipboard(result.post_id || '')}
                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                            title="Copy Post ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        {result.success && getShareUrl(result) !== '#' && (
                          <a
                            href={getShareUrl(result)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                            title="View Post"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      {result.success ? result.message : result.error || 'Failed to post'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-8 border-t border-white/10 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleNewPost}
              className="text-gray-400 hover:text-white border-white/10 hover:bg-white/10 rounded-xl px-6 h-11 font-medium transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Post
            </Button>
            <Button
              onClick={handleCloseModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 h-11 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200"
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 backdrop-blur-2xl"
      onClick={handleCloseModal}
    >
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div 
        className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-white/20 rounded-[2rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_40px_80px_-12px_rgba(0,0,0,0.9)] backdrop-blur-3xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-10 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
              <Send className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Social Wizard
              </h2>
              <p className="text-gray-300 mt-1 text-base font-medium truncate max-w-md" title={product.name}>
                {product.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCloseModal}
            className="group relative text-gray-400 hover:text-white p-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-400/30 border border-transparent"
            title="Close Modal"
          >
            <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Platform Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Select Platforms</h3>
              <p className="text-gray-300 text-base font-medium">Choose where to share your content</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatformSelection(platform.id)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] transform-gpu ${
                      isSelected
                        ? 'border-blue-500/60 bg-gradient-to-br from-blue-500/20 to-purple-500/10 shadow-2xl shadow-blue-500/30 ring-2 ring-blue-500/40'
                        : 'border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-700/30 hover:border-white/30 hover:bg-gradient-to-br hover:from-slate-700/60 hover:to-slate-600/40 backdrop-blur-xl shadow-xl shadow-slate-900/20'
                    }`}
                  >
                    {/* Glowing background effect */}
                    <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-100' 
                        : 'bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                    }`}></div>
                    
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className={`p-2 rounded-xl transition-all duration-300 ${
                        isSelected 
                          ? 'bg-blue-500/20 ring-2 ring-blue-400/30' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Icon className={`w-6 h-6 ${platform.color} transition-all duration-300 ${
                          isSelected ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110'
                        }`} />
                      </div>
                      <p className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                        isSelected ? 'text-blue-200' : 'text-white group-hover:text-blue-100'
                      }`}>
                        {platform.name}
                      </p>
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full ring-4 ring-slate-900/80 flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white font-bold" />
                      </div>
                    )}
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Create Caption</h3>
              <p className="text-gray-300 text-base">Choose how you want to create your caption</p>
            </div>
            
            {captionMode === 'none' && (
              <div className="space-y-6">
                {/* Caption Creation Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Manual Input Button */}
                  <Button
                    type="button"
                    onClick={handleInsertDescription}
                    className="h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-blue-400/30 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] backdrop-blur-sm"
                  >
                    <HiPencilAlt className="w-4 h-4 text-blue-400" />
                    <span>Write Manually</span>
                  </Button>

                  {/* Use Product Description Button */}
                  <Button
                    type="button"
                    onClick={() => {
                      const cleanDescription = htmlToText(product?.description || '');
                      setCaption(cleanDescription);
                      setCaptionMode('manual');
                    }}
                    className="h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-emerald-400/30 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] backdrop-blur-sm"
                  >
                    <HiDocumentText className="w-4 h-4 text-emerald-400" />
                    <span>Use Product Description</span>
                  </Button>
                  
                </div>

                {/* AI Generation Section */}
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-gray-300 text-sm font-medium">Or let AI create a caption for you</p>
                  </div>

                  {/* AI Generation Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask AI to write a caption... (e.g., 'Write a catchy Bengali caption')"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isGeneratingCaption && product && promptText.trim()) {
                          generateCaption();
                        }
                      }}
                      className="w-full h-12 pl-4 pr-12 border border-white/20 hover:border-purple-400/50 focus:border-purple-500 rounded-xl bg-white/5 backdrop-blur-sm text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
                    />
                    
                    <Button
                      type="button"
                      onClick={generateCaption}
                      disabled={isGeneratingCaption || !product || !promptText.trim()}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-lg transition-all duration-200 ${
                        isGeneratingCaption 
                          ? 'bg-purple-600 animate-pulse' 
                          : promptText.trim()
                            ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105'
                            : 'bg-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isGeneratingCaption ? (
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {captionMode === 'manual' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white tracking-tight">Write Your Caption</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCaptionMode('none')}
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative">
                  <textarea
                    placeholder="Write your social media caption here..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={6}
                    className="w-full p-4 border border-white/20 hover:border-blue-500/50 focus:border-blue-500 rounded-xl bg-white/5 backdrop-blur-sm text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[150px] max-h-[400px] leading-relaxed resize-y transition-colors duration-200"
                  />
                  
                  {/* Floating Insert Description Button - Only show when textarea is empty */}
                  {!caption.trim() && (
                    <Button
                      type="button"
                      onClick={() => setCaption(htmlToText(product?.description || ''))}
                      className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                      title="Insert Product Description"
                    >
                      <HiDocumentText className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {captionMode === 'ai-generated' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white tracking-tight">AI Generated Caption</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCaptionMode('none')}
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="p-5 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{aiGeneratedCaption}</p>
                  </div>
                  
                  {/* Floating Edit Button */}
                  <Button
                    type="button"
                    onClick={handleEditAiCaption}
                    className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {captionMode === 'editing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white tracking-tight">Edit Caption</h4>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl px-3 py-2 font-medium transition-all duration-300"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCaptionMode('ai-generated')}
                      className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2 font-medium transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={8}
                  className="w-full p-6 border-2 border-white/10 hover:border-green-500/30 focus:border-green-500/50 rounded-3xl bg-slate-800/60 backdrop-blur-2xl text-white text-base focus:outline-none focus:ring-4 focus:ring-green-500/20 min-h-[200px] max-h-[400px] leading-relaxed resize-y transition-all duration-300 shadow-2xl shadow-slate-900/30"
                />
              </div>
            )}
          </div>

          {/* Image Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white tracking-tight">Select Images</h3>
            <p className="text-gray-400 text-sm mb-4 font-medium">Choose up to 10 images for your post</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableImages.map((imageUrl, index) => {
                const isSelected = selectedImages.includes(imageUrl);
                return (
                  <button
                    key={index}
                    onClick={() => toggleImageSelection(imageUrl)}
                    className={`group relative aspect-square rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] transform-gpu overflow-hidden ${
                      isSelected
                        ? 'border-blue-500/60 bg-gradient-to-br from-blue-500/20 to-purple-500/10 shadow-2xl shadow-blue-500/30 ring-2 ring-blue-500/40'
                        : 'border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-700/30 hover:border-white/30 hover:bg-gradient-to-br hover:from-slate-700/60 hover:to-slate-600/40 backdrop-blur-xl shadow-xl shadow-slate-900/20'
                    }`}
                  >
                    {/* Glowing background effect */}
                    <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-100' 
                        : 'bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                    }`}></div>
                    
                    <Image
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      fill
                      className={`object-cover transition-all duration-300 ${
                        isSelected ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                    />
                    
                    {/* Selection indicator - same style as platform selection */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full ring-2 ring-white/30 flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 text-white font-bold" />
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-t from-blue-600/30 via-blue-500/10 to-transparent' 
                        : 'bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-blue-600/20'
                    }`}></div>
                  </button>
                );
              })}
            </div>
            <p className="text-gray-400 text-xs mt-4">Selected: {selectedImages.length} of {availableImages.length}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative border-t border-white/20 p-8 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl rounded-b-[2rem]">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/5 to-transparent rounded-b-[2rem]"></div>
          
          {/* Mobile Layout */}
          <div className="block sm:hidden space-y-6 relative">
            <div className="bg-slate-800/60 border-2 border-white/20 rounded-2xl p-4 backdrop-blur-xl">
              <DateTimePicker
                date={scheduledTime}
                onDateChange={setScheduledTime}
                placeholder="Schedule post"
                className="w-full bg-transparent border-0 text-gray-300 placeholder:text-gray-400 hover:bg-transparent focus:bg-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1 h-14 text-gray-300 hover:text-white border-2 border-white/20 hover:border-white/40 bg-slate-800/50 hover:bg-slate-700/60 rounded-2xl font-semibold text-base transition-all duration-300 backdrop-blur-xl hover:scale-[1.02]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={selectedPlatforms.length === 0 || 
                         (captionMode === 'none') || 
                         (captionMode === 'manual' && !caption) ||
                         (captionMode === 'ai-generated' && !aiGeneratedCaption) ||
                         (captionMode === 'editing' && !caption) ||
                         isPosting}
                className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-base shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPosting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    <span>Posting...</span>
                  </div>
                ) : scheduledTime && scheduledTime > new Date() ? (
                  <div className="flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 mr-3" />
                    <span>Schedule Post</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="w-5 h-5 mr-3" />
                    <span>Post Now</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between relative">
            <div className="bg-slate-800/60 border-2 border-white/20 rounded-2xl p-3 backdrop-blur-xl">
              <DateTimePicker
                date={scheduledTime}
                onDateChange={setScheduledTime}
                placeholder="Schedule post"
                className="min-w-[220px] bg-transparent border-0 text-gray-300 placeholder:text-gray-400 hover:bg-transparent focus:bg-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="h-14 px-8 text-gray-300 hover:text-white border-2 border-white/20 hover:border-white/40 bg-slate-800/50 hover:bg-slate-700/60 rounded-2xl font-semibold text-base transition-all duration-300 backdrop-blur-xl hover:scale-[1.02]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={selectedPlatforms.length === 0 || 
                         (captionMode === 'none') || 
                         (captionMode === 'manual' && !caption) ||
                         (captionMode === 'ai-generated' && !aiGeneratedCaption) ||
                         (captionMode === 'editing' && !caption) ||
                         isPosting}
                className="h-14 px-8 min-w-[160px] bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-base shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPosting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    <span>Posting...</span>
                  </div>
                ) : scheduledTime && scheduledTime > new Date() ? (
                  <div className="flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 mr-3" />
                    <span>Schedule Post</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="w-5 h-5 mr-3" />
                    <span>Post Now</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
