'use client';

import { useEffect } from 'react';

export const useIntersectionAnimation = () => {
	useEffect(() => {
		const observerOptions = {
			threshold: 0.1,
			rootMargin: '0px 0px -50px 0px',
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const element = entry.target as HTMLElement;

				if (entry.isIntersecting) {
					// Forward animation - element is visible
					element.classList.add('visible');
					element.classList.remove('hidden-animation');
				} else {
					// Reverse animation - element is not visible
					element.classList.remove('visible');
					element.classList.add('hidden-animation');
				}
			});
		}, observerOptions);

		// Find all elements with animation classes
		const animatedElements = document.querySelectorAll(
			'.fade-in, .slide-up, .slide-down, .slide-left, .slide-right, .scale-up, .scale-down, .rotate-in, .blur-in'
		);

		animatedElements.forEach((element) => {
			observer.observe(element);
		});

		return () => {
			animatedElements.forEach((element) => {
				observer.unobserve(element);
			});
		};
	}, []);
};

export default useIntersectionAnimation;
