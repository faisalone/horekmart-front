import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragStylesExtended extends React.CSSProperties {
  liveIndex?: number;
}

interface DraggableItemProps {
  children: React.ReactNode;
  index: number;
  isDraggedItem: boolean;
  isDropTarget: boolean;
  isDragging: boolean;
  onDragStart: (index: number, event: React.PointerEvent) => void;
  onDragMove: (event: React.PointerEvent) => void;
  onDragEnd: (event: React.PointerEvent) => void;
  onDragCancel: (event: React.PointerEvent) => void;
  onDelete?: () => void;
  disabled?: boolean;
  className?: string;
  dragStyles?: DragStylesExtended;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  index,
  isDraggedItem,
  isDropTarget,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onDelete,
  disabled = false,
  className,
  dragStyles = {} as DragStylesExtended
}) => {
  return (
    <div
      data-drag-index={index}
      className={cn(
        "relative group rounded-lg border transition-all duration-200 will-change-transform",
        "border-gray-200 hover:border-gray-300 bg-white overflow-hidden",
        // Cursor and touch states for dragging
        !disabled && "cursor-grab active:cursor-grabbing select-none touch-none",
        // Professional drag states with better contrast
        isDraggedItem && "border-blue-500 bg-gradient-to-br from-blue-100 to-blue-50 cursor-grabbing",
        isDropTarget && "border-emerald-500 bg-gradient-to-br from-emerald-100 to-emerald-50 ring-2 ring-emerald-300/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        transform: dragStyles.transform || 'scale(1)',
        opacity: dragStyles.opacity || 1,
        zIndex: dragStyles.zIndex || 1,
        transition: dragStyles.transition || 'all 0.2s ease-out',
        touchAction: 'none', // Essential for mobile drag support
        boxShadow: dragStyles.boxShadow || 'none',
        ...dragStyles
      }}
      onPointerDown={!disabled ? (e) => onDragStart(index, e) : undefined}
      onPointerMove={!disabled ? onDragMove : undefined}
      onPointerUp={!disabled ? onDragEnd : undefined}
      onPointerCancel={!disabled ? onDragCancel : undefined}
    >
      {children}
      

      
      {/* Delete Button - Top Right */}
      {onDelete && !disabled && (
        <div className="absolute top-2 right-2 z-30">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "h-7 w-7 p-0 transition-all duration-200",
              "bg-red-500 hover:bg-red-600 text-white shadow-md",
              "opacity-90 hover:opacity-100 hover:scale-105"
            )}
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Order Badge - Top Left */}
      <div className="absolute top-2 left-2 z-20">
        <span className={cn(
          "inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white",
          "bg-gray-800/90 backdrop-blur-sm rounded-full transition-all duration-200 shadow-sm",
          isDraggedItem && "bg-blue-600 scale-110 shadow-lg",
          isDropTarget && "bg-emerald-600 scale-110 shadow-lg"
        )}>
          {dragStyles.liveIndex || index + 1}
        </span>
      </div>


    </div>
  );
};