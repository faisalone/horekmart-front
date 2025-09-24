import React, { useCallback, useReducer, useRef } from 'react';

// Modern drag state management with useReducer for predictability
interface DragState {
	draggedIndex: number | null;
	targetIndex: number | null;
	isDragging: boolean;
	dragOffset: { x: number; y: number };
}

type DragAction =
	| { type: 'DRAG_START'; index: number; offset: { x: number; y: number } }
	| { type: 'DRAG_MOVE'; targetIndex: number | null }
	| { type: 'DRAG_END' }
	| { type: 'DRAG_CANCEL' };

const initialState: DragState = {
	draggedIndex: null,
	targetIndex: null,
	isDragging: false,
	dragOffset: { x: 0, y: 0 },
};

function dragReducer(state: DragState, action: DragAction): DragState {
	switch (action.type) {
		case 'DRAG_START':
			return {
				...state,
				draggedIndex: action.index,
				isDragging: true,
				dragOffset: action.offset,
				targetIndex: null,
			};

		case 'DRAG_MOVE':
			return {
				...state,
				targetIndex: action.targetIndex,
			};

		case 'DRAG_END':
		case 'DRAG_CANCEL':
			return initialState;

		default:
			return state;
	}
}

interface DragStyles extends React.CSSProperties {
	isDraggedItem: boolean;
	isDropTarget: boolean;
	isDragging: boolean;
	liveIndex?: number;
}

interface UseDragAndDropOptions<T> {
	items: T[];
	onReorder: (items: T[]) => void;
	disabled?: boolean;
}

export function useDragAndDrop<T>({
	items,
	onReorder,
	disabled = false,
}: UseDragAndDropOptions<T>) {
	const [dragState, dispatch] = useReducer(dragReducer, initialState);
	const dragElementRef = useRef<HTMLElement | null>(null);
	const pointerIdRef = useRef<number | null>(null);

	// Enhanced drag start with mobile support
	const handleDragStart = useCallback(
		(index: number, event: React.PointerEvent) => {
			if (
				disabled ||
				(event.pointerType === 'mouse' && event.button !== 0)
			)
				return;

			// Prevent default behavior immediately for touch devices
			event.preventDefault();
			event.stopPropagation();

			const rect = event.currentTarget.getBoundingClientRect();
			const offset = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};

			dispatch({ type: 'DRAG_START', index, offset });
			pointerIdRef.current = event.pointerId;

			// Subtle haptic feedback for mobile
			if ('vibrate' in navigator && event.pointerType === 'touch') {
				navigator.vibrate(20);
			}

			// Capture pointer for consistent event handling
			const element = event.currentTarget as HTMLElement;
			try {
				element.setPointerCapture(event.pointerId);
				// Disable text selection and scrolling during drag
				document.body.style.userSelect = 'none';
				document.body.style.webkitUserSelect = 'none';
				document.body.classList.add('drag-in-progress');
			} catch (error) {
				console.warn('Pointer capture failed:', error);
			}
		},
		[disabled]
	);

	// Simplified drag move with target detection
	const handleDragMove = useCallback(
		(event: React.PointerEvent) => {
			if (
				!dragState.isDragging ||
				pointerIdRef.current !== event.pointerId
			)
				return;

			event.preventDefault();

			// Find target element under pointer
			const elementBelow = document.elementFromPoint(
				event.clientX,
				event.clientY
			);
			const targetElement = elementBelow?.closest(
				'[data-drag-index]'
			) as HTMLElement;
			const targetIndex = targetElement
				? parseInt(targetElement.dataset.dragIndex || '', 10)
				: null;

			if (
				!isNaN(targetIndex as number) &&
				targetIndex !== dragState.draggedIndex
			) {
				dispatch({ type: 'DRAG_MOVE', targetIndex });
			}
		},
		[dragState.isDragging, dragState.draggedIndex]
	);

	// Enhanced drag end with proper cleanup for mobile
	const handleDragEnd = useCallback(
		(event: React.PointerEvent) => {
			if (pointerIdRef.current !== event.pointerId) return;

			// Cleanup pointer capture and text selection
			try {
				(event.currentTarget as HTMLElement).releasePointerCapture(
					event.pointerId
				);
				// Re-enable text selection and scrolling
				document.body.style.userSelect = '';
				document.body.style.webkitUserSelect = '';
				document.body.classList.remove('drag-in-progress');
			} catch (error) {
				console.warn('Cleanup failed:', error);
			}

			// Perform reorder if we have a valid drop target
			if (
				dragState.draggedIndex !== null &&
				dragState.targetIndex !== null
			) {
				const newItems = [...items];
				const [draggedItem] = newItems.splice(
					dragState.draggedIndex,
					1
				);
				newItems.splice(dragState.targetIndex, 0, draggedItem);
				onReorder(newItems);

				// Success haptic feedback
				if ('vibrate' in navigator && event.pointerType === 'touch') {
					navigator.vibrate([25, 25, 25]); // Triple tap pattern
				}
			}

			dispatch({ type: 'DRAG_END' });
			pointerIdRef.current = null;
		},
		[dragState.draggedIndex, dragState.targetIndex, items, onReorder]
	);

	// Cancel drag with proper cleanup for mobile
	const handleDragCancel = useCallback((event?: React.PointerEvent) => {
		if (event && pointerIdRef.current !== event.pointerId) return;

		// Cleanup pointer capture and text selection
		if (event) {
			try {
				(event.currentTarget as HTMLElement).releasePointerCapture(
					event.pointerId
				);
				document.body.style.userSelect = '';
				document.body.style.webkitUserSelect = '';
				document.body.classList.remove('drag-in-progress');
			} catch (error) {
				console.warn('Drag cancel cleanup failed:', error);
			}
		} else {
			// Cleanup without event (e.g., on unmount)
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';
			document.body.classList.remove('drag-in-progress');
		}

		dispatch({ type: 'DRAG_CANCEL' });
		pointerIdRef.current = null;
	}, []);

	// Utility functions for styling - professional approach with live preview
	const getDragStyles = useCallback(
		(index: number): DragStyles => {
			const isDraggedItem = dragState.draggedIndex === index;
			const isDropTarget = dragState.targetIndex === index;

			// Calculate live preview positions during drag
			let liveIndex = index;
			if (
				dragState.isDragging &&
				dragState.draggedIndex !== null &&
				dragState.targetIndex !== null
			) {
				const draggedIdx = dragState.draggedIndex;
				const targetIdx = dragState.targetIndex;

				if (index === draggedIdx) {
					// Dragged item goes to target position
					liveIndex = targetIdx;
				} else if (draggedIdx < targetIdx) {
					// Moving forward: shift items back
					if (index > draggedIdx && index <= targetIdx) {
						liveIndex = index - 1;
					}
				} else if (draggedIdx > targetIdx) {
					// Moving backward: shift items forward
					if (index >= targetIdx && index < draggedIdx) {
						liveIndex = index + 1;
					}
				}
			}

			return {
				isDraggedItem,
				isDropTarget,
				isDragging: dragState.isDragging,
				liveIndex: liveIndex + 1, // 1-based for display
				transform: isDraggedItem
					? 'scale(1.05) translateY(-6px) rotate(1deg)'
					: isDropTarget
					? 'scale(1.02)'
					: 'scale(1)',
				opacity: isDraggedItem ? 0.9 : 1,
				zIndex: isDraggedItem ? 1000 : isDropTarget ? 10 : 1,
				transition: dragState.isDragging
					? 'transform 0.15s ease-out'
					: 'all 0.2s ease-out',
				boxShadow: isDraggedItem
					? '0 15px 35px -5px rgba(0, 0, 0, 0.25), 0 5px 15px -3px rgba(59, 130, 246, 0.3)'
					: isDropTarget
					? '0 0 0 2px rgba(16, 185, 129, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.15)'
					: 'none',
			};
		},
		[dragState]
	);

	return {
		dragState,
		handleDragStart,
		handleDragMove,
		handleDragEnd,
		handleDragCancel,
		getDragStyles,
		isDragging: dragState.isDragging,
	};
}
