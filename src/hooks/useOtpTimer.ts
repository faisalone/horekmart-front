import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOtpTimerProps {
	initialTime: number; // in seconds
	onExpired?: () => void;
}

interface UseOtpTimerReturn {
	timeLeft: number;
	isExpired: boolean;
	formattedTime: string;
	restart: (newTime?: number) => void;
}

export function useOtpTimer({
	initialTime,
	onExpired,
}: UseOtpTimerProps): UseOtpTimerReturn {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const [isRunning, setIsRunning] = useState(initialTime > 0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const hasExpiredRef = useRef(false);

	const restart = useCallback(
		(newTime?: number) => {
			const time = newTime || initialTime;
			setTimeLeft(time);
			setIsRunning(time > 0);
			hasExpiredRef.current = false;
		},
		[initialTime]
	);

	useEffect(() => {
		// Clear existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// Don't start timer if not running or no time left
		if (!isRunning || timeLeft <= 0) {
			if (timeLeft <= 0 && !hasExpiredRef.current) {
				hasExpiredRef.current = true;
				onExpired?.();
			}
			return;
		}

		// Start countdown
		intervalRef.current = setInterval(() => {
			setTimeLeft((prevTime) => {
				const newTime = prevTime - 1;
				if (newTime <= 0) {
					setIsRunning(false);
					if (!hasExpiredRef.current) {
						hasExpiredRef.current = true;
						// Call onExpired after a small delay to ensure state is updated
						setTimeout(() => onExpired?.(), 0);
					}
					return 0;
				}
				return newTime;
			});
		}, 1000);

		// Cleanup function
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isRunning, onExpired, timeLeft]); // Include timeLeft to satisfy linter

	const formatTime = (seconds: number): string => {
		if (seconds <= 0) return '';

		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;

		if (mins > 0) {
			if (secs === 0) {
				return `Code expires in ${mins} minute${mins !== 1 ? 's' : ''}`;
			}
			return `Code expires in ${mins}:${secs
				.toString()
				.padStart(2, '0')}`;
		} else {
			return `Code expires in ${secs} second${secs !== 1 ? 's' : ''}`;
		}
	};

	return {
		timeLeft,
		isExpired: timeLeft === 0,
		formattedTime: formatTime(timeLeft),
		restart,
	};
}
