import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'inline',
		contentSecurityPolicy:
			"default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'app.horekmart.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
