import type { Config } from 'tailwindcss';

const config: Config = {
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
				'noto-bengali': [
					'var(--font-noto-bengali)',
					'Noto Sans Bengali',
					'system-ui',
					'sans-serif',
				],
				sans: [
					'var(--font-quicksand)',
					'Quicksand',
					'var(--font-noto-bengali)',
					'Noto Sans Bengali',
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
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				// Main Theme Colors - Cosmic Galaxy Theme
				'hm-theme-secondary': {
					50: '#faf7ff',
					100: '#f3edff',
					200: '#e9ddff',
					300: '#d4bdff',
					400: '#b794ff',
					500: '#9c6aff',
					600: '#ffe7b1',
					700: '#7c3aff',
					800: '#6a2fa3',
					900: '#5a2a87',
					950: '#3b1a5c',
				},
				'theme-primary': {
					DEFAULT: '#f22540',
					light: '#ff5a70',
					dark: '#d11330',
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#f22540',
					600: '#d11330',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d',
				},
				'theme-secondary': {
					DEFAULT: '#0074bf',
					light: '#2196f3',
					dark: '#005a9b',
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#0074bf',
					600: '#005a9b',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
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
	plugins: [
		require('tailwindcss-animate'),
		require('tailwind-scrollbar')({ nocompatible: true }),
	],
};

export default config;
