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
				// Main Theme Colors
				'theme-primary': {
					DEFAULT: '#f22540',
					light: '#ff5a70',
					dark: '#d11330',
				},
				'theme-secondary': {
					DEFAULT: '#0074bf',
					light: '#2196f3',
					dark: '#005a9b',
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			// Add gradient utilities for the theme
			backgroundImage: {
				'theme-primary-gradient':
					'linear-gradient(135deg, #f22540 0%, #d11330 100%)',
				'theme-secondary-gradient':
					'linear-gradient(135deg, #0074bf 0%, #005a9b 100%)',
				'theme-primary-light-gradient':
					'linear-gradient(135deg, #ff5a70 0%, #f22540 100%)',
				'theme-secondary-light-gradient':
					'linear-gradient(135deg, #2196f3 0%, #0074bf 100%)',
			},
		},
	},
	plugins: [],
} satisfies Config;
