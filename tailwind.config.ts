import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				inter: [
					'var(--font-inter)',
					'Inter',
					'system-ui',
					'sans-serif',
				],
				quicksand: [
					'var(--font-quicksand)',
					'Quicksand',
					'system-ui',
					'sans-serif',
				],
				sans: [
					'var(--font-quicksand)',
					'Quicksand',
					'system-ui',
					'sans-serif',
				],
			},
			fontSize: {
				xs: '0.8rem',
				sm: '0.9rem',
				base: '1.1rem',
				lg: '1.2rem',
				xl: '1.3rem',
				'2xl': '1.6rem',
				'3xl': '2rem',
				'4xl': '2.5rem',
				'5xl': '3rem',
			},
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				// Main Theme Colors - Cosmic Galaxy Theme
				'theme-primary': {
					50: '#faf7ff',
					100: '#f3edff',
					200: '#e9ddff',
					300: '#d4bdff',
					400: '#b794ff',
					500: '#9c6aff',
					600: '#8a4fff',
					700: '#7c3aff',
					800: '#6a2fa3',
					900: '#5a2a87',
					950: '#3b1a5c',
				},
				'theme-secondary': {
					50: '#fff0f8',
					100: '#ffe3f3',
					200: '#ffc7e8',
					300: '#ff9bd3',
					400: '#ff5eb5',
					500: '#ff2d92',
					600: '#ff0066',
					700: '#e6004d',
					800: '#bf0342',
					900: '#a1073c',
					950: '#66001f',
				},
				'theme-accent': {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				},
				// Gradient combinations
				'cosmic-from': '#7c3aff', // Deep purple
				'cosmic-via': '#ff0066', // Magenta
				'cosmic-to': '#0ea5e9', // Electric blue
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554',
				},
				gray: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
					950: '#030712',
				},
			},
			// Add gradient utilities for the theme
			backgroundImage: {
				'cosmic-gradient':
					'linear-gradient(135deg, var(--cosmic-from, #7c3aff) 0%, var(--cosmic-via, #ff0066) 50%, var(--cosmic-to, #0ea5e9) 100%)',
				'cosmic-gradient-reverse':
					'linear-gradient(315deg, var(--cosmic-from, #7c3aff) 0%, var(--cosmic-via, #ff0066) 50%, var(--cosmic-to, #0ea5e9) 100%)',
				'theme-primary-gradient':
					'linear-gradient(135deg, var(--theme-primary-600, #8a4fff) 0%, var(--theme-primary-700, #7c3aff) 100%)',
				'theme-accent-gradient':
					'linear-gradient(135deg, var(--theme-secondary-500, #ff2d92) 0%, var(--theme-accent-500, #0ea5e9) 100%)',
			},
		},
	},
	plugins: [],
} satisfies Config;
