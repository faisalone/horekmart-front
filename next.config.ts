import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'logos-world.net',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'logo.clearbit.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/storage/**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '8000',
				pathname: '/storage/**',
			},
			{
				protocol: 'https',
				hostname: 'placehold.co',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'eilm.io',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'o6.eilm.io',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'www.theauditoronline.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '0a407bbd97a6.ngrok-free.app',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'www.google.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
