import {
	LucideIcon,
	Shield,
	FileText,
	RotateCcw,
	Cookie,
	Trash2,
} from 'lucide-react';

// Search-focused interfaces
export interface HelpArticle {
	id: string;
	title: string;
	description: string;
	category: string;
	categoryIcon: string;
	content: string;
	keywords: string[];
	url: string;
	lastUpdated: string;
}

export interface HelpCategory {
	id: string;
	title: string;
	description: string;
	icon: string;
	articles: HelpArticle[];
}

// Detailed page data interfaces
export interface HelpPageData {
	id: string;
	title: string;
	subtitle: string;
	icon: LucideIcon;
	iconColor: string;
	bgColor: string;
	lastUpdated?: string;
	sections: HelpSection[];
}

export interface HelpSection {
	id: string;
	title: string;
	icon?: LucideIcon;
	iconColor?: string;
	content: HelpContent[];
}

export interface HelpContent {
	type:
		| 'paragraph'
		| 'list'
		| 'grid'
		| 'highlight'
		| 'warning'
		| 'steps'
		| 'contact';
	content: string | string[] | GridItem[] | ContactInfo | StepItem[];
	className?: string;
}

export interface GridItem {
	title: string;
	description: string;
	items: string[];
	className?: string;
	duration?: string;
}

export interface ContactInfo {
	email: string;
	phone: string;
	address: string;
	businessHours?: string;
}

export interface StepItem {
	step: number;
	title: string;
	description: string;
}

// Centralized help data that simulates API response
export const helpDatabase: HelpCategory[] = [
	{
		id: 'your-order',
		title: 'Your Order',
		description: 'Order status, tracking & changes',
		icon: 'User',
		articles: [
			{
				id: 'track-order',
				title: 'Track an Order',
				description:
					'Find out where your order is and when it will arrive',
				category: 'Your Order',
				categoryIcon: 'User',
				content:
					'Learn how to track your order and get delivery updates.',
				keywords: ['track', 'order', 'delivery', 'status', 'shipping'],
				url: '/help/track-order',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'cancel-order',
				title: 'Edit or Cancel an Order',
				description: 'Make changes to your order before it ships',
				category: 'Your Order',
				categoryIcon: 'User',
				content:
					'Learn how to edit or cancel your order before it ships.',
				keywords: ['cancel', 'edit', 'order', 'change', 'modify'],
				url: '/help/cancel-order',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'order-history',
				title: 'Order History',
				description: 'View your past orders and reorder items',
				category: 'Your Order',
				categoryIcon: 'User',
				content:
					'Access your complete order history and reorder favorite items.',
				keywords: ['history', 'past orders', 'reorder', 'previous'],
				url: '/help/order-history',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'missing-orders',
				title: 'Missing Orders',
				description: 'What to do if your order is missing or lost',
				category: 'Your Order',
				categoryIcon: 'User',
				content:
					'Steps to take when your order goes missing or gets lost.',
				keywords: [
					'missing',
					'lost',
					'order',
					'not received',
					'where is',
				],
				url: '/help/missing-orders',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
	{
		id: 'account-payments',
		title: 'Account & Payments',
		description: 'Create or Edit an Account',
		icon: 'CreditCard',
		articles: [
			{
				id: 'payment-methods',
				title: 'Payment Methods',
				description:
					'Add, edit, or remove payment methods from your account',
				category: 'Account & Payments',
				categoryIcon: 'CreditCard',
				content:
					'Manage your payment methods including credit cards, PayPal, and gift cards.',
				keywords: [
					'payment',
					'credit card',
					'paypal',
					'gift card',
					'billing',
				],
				url: '/help/payment-methods',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'account-settings',
				title: 'Account Settings',
				description: 'Update your personal information and preferences',
				category: 'Account & Payments',
				categoryIcon: 'CreditCard',
				content:
					'Modify your account details, preferences, and privacy settings.',
				keywords: [
					'account',
					'settings',
					'profile',
					'personal',
					'preferences',
				],
				url: '/help/account-settings',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'password-reset',
				title: 'Password Reset',
				description: 'Reset your password if you forgot it',
				category: 'Account & Payments',
				categoryIcon: 'CreditCard',
				content: 'Step-by-step guide to reset your forgotten password.',
				keywords: ['password', 'reset', 'forgot', 'login', 'access'],
				url: '/help/password-reset',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'data-deletion',
				title: 'Delete Your Data',
				description: 'How to request deletion of your personal data',
				category: 'Account & Payments',
				categoryIcon: 'CreditCard',
				content:
					'Learn how to request deletion of your personal data from our systems.',
				keywords: [
					'data',
					'deletion',
					'privacy',
					'remove',
					'delete',
					'personal information',
					'GDPR',
				],
				url: '/help/data-deletion',
				lastUpdated: 'August 4, 2025',
			},
		],
	},
	{
		id: 'returns-refunds',
		title: 'Returns & Refunds',
		description: 'Easy returns',
		icon: 'RotateCcw',
		articles: [
			{
				id: 'return-policy',
				title: 'Horekmart Standard Return Policy',
				description: 'Learn about our return policy and process',
				category: 'Returns & Refunds',
				categoryIcon: 'RotateCcw',
				content:
					'Complete guide to our return policy, timelines, and conditions.',
				keywords: [
					'return',
					'policy',
					'refund',
					'exchange',
					'warranty',
				],
				url: '/help/return-policy',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'start-return',
				title: 'Start an Online Return',
				description: 'Begin the return process for your items',
				category: 'Returns & Refunds',
				categoryIcon: 'RotateCcw',
				content:
					'How to initiate a return through your online account.',
				keywords: [
					'start return',
					'online return',
					'return process',
					'initiate',
				],
				url: '/help/start-return',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'refund-status',
				title: 'Refund Status',
				description: 'Check the status of your refund',
				category: 'Returns & Refunds',
				categoryIcon: 'RotateCcw',
				content:
					'Track your refund progress and expected processing times.',
				keywords: [
					'refund',
					'status',
					'money back',
					'processing',
					'timeline',
				],
				url: '/help/refund-status',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
	{
		id: 'horekmart-services',
		title: 'Horekmart Services',
		description: 'Types of Horekmart Services',
		icon: 'Star',
		articles: [
			{
				id: 'delivery-options',
				title: 'Delivery Options',
				description: 'Learn about our delivery and shipping options',
				category: 'Horekmart Services',
				categoryIcon: 'Star',
				content:
					'Explore different delivery methods and their timelines.',
				keywords: [
					'delivery',
					'shipping',
					'express',
					'standard',
					'pickup',
				],
				url: '/help/delivery-options',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'customer-support',
				title: 'Customer Support',
				description: 'How to contact our support team',
				category: 'Horekmart Services',
				categoryIcon: 'Star',
				content: 'Various ways to reach our customer support team.',
				keywords: ['support', 'contact', 'help', 'assistance', 'chat'],
				url: '/help/customer-support',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
	{
		id: 'horekmart-plus',
		title: 'Horekmart+',
		description: 'Horekmart+ Memberships',
		icon: 'ShoppingBag',
		articles: [
			{
				id: 'membership-benefits',
				title: 'Horekmart+ Benefits Overview',
				description: 'Learn about all Horekmart+ membership benefits',
				category: 'Horekmart+',
				categoryIcon: 'ShoppingBag',
				content:
					'Complete overview of Horekmart+ membership perks and benefits.',
				keywords: [
					'membership',
					'benefits',
					'plus',
					'premium',
					'perks',
				],
				url: '/help/membership-benefits',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'free-shipping',
				title: 'Free Shipping Benefits',
				description: 'Understand your free shipping benefits',
				category: 'Horekmart+',
				categoryIcon: 'ShoppingBag',
				content:
					'How to get free shipping with your Horekmart+ membership.',
				keywords: [
					'free shipping',
					'delivery',
					'membership',
					'benefits',
				],
				url: '/help/free-shipping',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
	{
		id: 'shopping',
		title: 'Shopping with Horekmart',
		description: 'The Horekmart Site and App Experience',
		icon: 'ShoppingCart',
		articles: [
			{
				id: 'how-to-shop',
				title: 'How to Shop on Horekmart.com',
				description: 'Getting started with online shopping',
				category: 'Shopping with Horekmart',
				categoryIcon: 'ShoppingCart',
				content: 'Step-by-step guide to shopping on our website.',
				keywords: ['shop', 'website', 'online', 'browse', 'purchase'],
				url: '/help/how-to-shop',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'mobile-app',
				title: 'Mobile App Features',
				description: 'Learn about our mobile app',
				category: 'Shopping with Horekmart',
				categoryIcon: 'ShoppingCart',
				content:
					'Discover features and benefits of the Horekmart mobile app.',
				keywords: ['mobile', 'app', 'phone', 'features', 'download'],
				url: '/help/mobile-app',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
	{
		id: 'terms-of-use',
		title: 'Terms of Use',
		description: 'Horekmart.com Terms of Use',
		icon: 'FileText',
		articles: [
			{
				id: 'privacy-policy',
				title: 'Privacy Policy',
				description: 'Our commitment to protecting your privacy',
				category: 'Terms of Use',
				categoryIcon: 'FileText',
				content:
					'Detailed privacy policy explaining how we handle your data.',
				keywords: [
					'privacy',
					'policy',
					'data protection',
					'personal information',
				],
				url: '/help/privacy-policy',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'terms-and-conditions',
				title: 'Terms & Conditions',
				description: 'Legal terms for using our services',
				category: 'Terms of Use',
				categoryIcon: 'FileText',
				content:
					'Complete terms and conditions for using Horekmart services.',
				keywords: [
					'terms',
					'conditions',
					'legal',
					'agreement',
					'usage',
				],
				url: '/help/terms-and-conditions',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'cookie-policy',
				title: 'Cookie Policy',
				description: 'How we use cookies on our website',
				category: 'Terms of Use',
				categoryIcon: 'FileText',
				content:
					'Information about cookies and tracking technologies we use.',
				keywords: ['cookies', 'tracking', 'website', 'policy', 'data'],
				url: '/help/cookie-policy',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
	{
		id: 'policies',
		title: 'Policies',
		description: 'Horekmart Policies and Guidelines',
		icon: 'Settings',
		articles: [
			{
				id: 'shipping-policy',
				title: 'Shipping Policy',
				description: 'Our shipping rates and delivery information',
				category: 'Policies',
				categoryIcon: 'Settings',
				content:
					'Complete shipping policy including rates and delivery times.',
				keywords: [
					'shipping',
					'policy',
					'delivery',
					'rates',
					'timeline',
				],
				url: '/help/shipping-policy',
				lastUpdated: 'July 17, 2025',
			},
			{
				id: 'price-matching',
				title: 'Price Matching Policy',
				description: 'Learn about our price matching guarantee',
				category: 'Policies',
				categoryIcon: 'Settings',
				content:
					'How our price matching policy works and eligibility requirements.',
				keywords: [
					'price match',
					'guarantee',
					'lower price',
					'competitor',
				],
				url: '/help/price-matching',
				lastUpdated: 'July 17, 2025',
			},
		],
	},
];

// Detailed help pages data
export const helpPagesData: Record<string, HelpPageData> = {
	'privacy-policy': {
		id: 'privacy-policy',
		title: 'Privacy Policy',
		subtitle:
			'We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.',
		icon: Shield,
		iconColor: 'text-blue-600',
		bgColor: 'bg-blue-100',
		sections: [
			{
				id: 'information-collection',
				title: 'Information We Collect',
				icon: Shield,
				iconColor: 'text-blue-600',
				content: [
					{
						type: 'grid',
						content: [
							{
								title: 'Personal Information',
								description: '',
								items: [
									'Name, email address, phone number',
									'Shipping and billing addresses',
									'Payment information (processed securely)',
									'Account credentials and preferences',
								],
							},
							{
								title: 'Usage Information',
								description: '',
								items: [
									'Browsing behavior and shopping patterns',
									'Device information and IP address',
									'Cookies and similar tracking technologies',
									'Customer support interactions',
								],
							},
						],
					},
				],
			},
			{
				id: 'data-usage',
				title: 'How We Use Your Information',
				content: [
					{
						type: 'grid',
						content: [
							{
								title: 'Essential Operations',
								description: '',
								items: [
									'Process and fulfill orders',
									'Manage your account',
									'Provide customer support',
									'Process payments securely',
								],
							},
							{
								title: 'Improvements & Marketing',
								description: '',
								items: [
									'Improve our products and services',
									'Send promotional offers (with consent)',
									'Analyze usage patterns',
									'Prevent fraud and ensure security',
								],
							},
						],
					},
				],
			},
			{
				id: 'data-sharing',
				title: 'Information Sharing',
				content: [
					{
						type: 'paragraph',
						content:
							'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
					},
					{
						type: 'list',
						content: [
							'Service Providers: Trusted partners who help us operate our business (payment processors, shipping companies)',
							'Help Requirements: When required by law or to protect our rights',
							'Business Transfer: In the event of a merger or acquisition',
							'With Your Consent: When you explicitly agree to share information',
						],
					},
				],
			},
			{
				id: 'contact',
				title: 'Contact Us',
				content: [
					{
						type: 'contact',
						content: {
							email: 'business@horekmart.com',
							phone: '+880 1763 223035',
							address:
								'Horekmart HQ, Alam Market, Koimari Road, Jaldhaka, Nilphamari, Bangladesh',
						},
					},
				],
			},
		],
	},

	'terms-and-conditions': {
		id: 'terms-and-conditions',
		title: 'Terms and Conditions',
		subtitle:
			'Please read these terms and conditions carefully before using our service. By accessing our website, you agree to be bound by these terms.',
		icon: FileText,
		iconColor: 'text-green-600',
		bgColor: 'bg-green-100',
		sections: [
			{
				id: 'agreement',
				title: 'Agreement to Terms',
				content: [
					{
						type: 'paragraph',
						content:
							'By accessing and using HOREKMART, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, you should not use our website or services.',
					},
					{
						type: 'highlight',
						content:
							'These terms apply to all visitors, users, and others who access or use our service.',
						className: 'bg-green-50 text-green-800',
					},
				],
			},
			{
				id: 'user-accounts',
				title: 'User Accounts',
				content: [
					{
						type: 'grid',
						content: [
							{
								title: 'Account Responsibilities',
								description: '',
								items: [
									'Provide accurate, current information',
									'Maintain security of your password',
									'Notify us of unauthorized access',
									'Accept responsibility for all activities',
								],
							},
							{
								title: 'Account Restrictions',
								description: '',
								items: [
									'One account per person',
									'Must be 18 years or older',
									'No sharing of account credentials',
									'Comply with all applicable laws',
								],
							},
						],
					},
				],
			},
			{
				id: 'contact',
				title: 'Contact Information',
				content: [
					{
						type: 'contact',
						content: {
							email: 'business@horekmart.com',
							phone: '+880 1763 223035',
							address:
								'Horekmart HQ, Alam Market, Koimari Road, Jaldhaka, Nilphamari, Bangladesh',
						},
					},
				],
			},
		],
	},

	'refund-return-policy': {
		id: 'refund-return-policy',
		title: 'Refund & Return Policy',
		subtitle:
			'We want you to be completely satisfied with your purchase. Learn about our hassle-free return and refund process.',
		icon: RotateCcw,
		iconColor: 'text-orange-600',
		bgColor: 'bg-orange-100',
		sections: [
			{
				id: 'return-window',
				title: 'Return Window',
				content: [
					{
						type: 'highlight',
						content:
							'30-Day Return Policy: You have 30 days from the date of delivery to return most items for a full refund.',
						className: 'bg-orange-50 text-orange-800',
					},
					{
						type: 'grid',
						content: [
							{
								title: 'Standard Returns',
								description: '30 Days',
								items: [
									'Electronics and gadgets',
									'Home and garden items',
									'Books and media',
									'Sports and outdoor equipment',
								],
							},
							{
								title: 'Extended Returns',
								description: '60 Days',
								items: [
									'Clothing and accessories',
									'Shoes and footwear',
									'Jewelry and watches',
									'Gifts during holiday seasons',
								],
							},
						],
					},
				],
			},
			{
				id: 'return-process',
				title: 'How to Return an Item',
				content: [
					{
						type: 'steps',
						content: [
							{
								step: 1,
								title: 'Initiate Return',
								description:
									'Log into your account and select the item you want to return from your order history.',
							},
							{
								step: 2,
								title: 'Print Label',
								description:
									"We'll email you a prepaid return shipping label. Package the item securely.",
							},
							{
								step: 3,
								title: 'Ship & Track',
								description:
									'Drop off at any authorized shipping location and track your return online.',
							},
						],
					},
				],
			},
			{
				id: 'contact',
				title: 'Need Help with Returns?',
				content: [
					{
						type: 'contact',
						content: {
							email: 'business@horekmart.com',
							phone: '+880 1763 223035',
							address:
								'Horekmart HQ, Alam Market, Koimari Road, Jaldhaka, Nilphamari, Bangladesh',
							businessHours:
								'Monday - Friday: 9:00 AM - 6:00 PM (GMT+6)',
						},
					},
				],
			},
		],
	},

	'cookie-policy': {
		id: 'cookie-policy',
		title: 'Cookie Policy',
		subtitle:
			'This policy explains how HOREKMART uses cookies and similar technologies to recognize you when you visit our website.',
		icon: Cookie,
		iconColor: 'text-purple-600',
		bgColor: 'bg-purple-100',
		sections: [
			{
				id: 'what-are-cookies',
				title: 'What Are Cookies?',
				content: [
					{
						type: 'paragraph',
						content:
							'Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.',
					},
					{
						type: 'highlight',
						content:
							'Why We Use Cookies: To remember your preferences, analyze website usage, improve your experience, and provide personalized content.',
						className: 'bg-purple-50 text-purple-800',
					},
				],
			},
			{
				id: 'cookie-types',
				title: 'Types of Cookies We Use',
				content: [
					{
						type: 'grid',
						content: [
							{
								title: 'Essential Cookies',
								description: 'Necessary for website function',
								duration: 'Session or up to 1 year',
								className: 'border-green-200 bg-green-50',
								items: [
									'Shopping cart functionality',
									'User authentication',
									'Security features',
									'Basic website operations',
								],
							},
							{
								title: 'Analytics Cookies',
								description:
									'Help us understand visitor behavior',
								duration: 'Up to 2 years',
								className: 'border-blue-200 bg-blue-50',
								items: [
									'Page views and traffic patterns',
									'User behavior analysis',
									'Performance monitoring',
									'Error tracking',
								],
							},
							{
								title: 'Functional Cookies',
								description: 'Enable enhanced functionality',
								duration: 'Up to 1 year',
								className: 'border-orange-200 bg-orange-50',
								items: [
									'Language preferences',
									'Region/currency settings',
									'Wishlist and favorites',
									'Recent searches',
								],
							},
							{
								title: 'Marketing Cookies',
								description: 'Used for advertising purposes',
								duration: 'Up to 13 months',
								className: 'border-red-200 bg-red-50',
								items: [
									'Targeted advertisements',
									'Social media integration',
									'Conversion tracking',
									'Retargeting campaigns',
								],
							},
						],
					},
				],
			},
			{
				id: 'contact',
				title: 'Questions About Cookies?',
				content: [
					{
						type: 'contact',
						content: {
							email: 'business@horekmart.com',
							phone: '+880 1763 223035',
							address:
								'Horekmart HQ, Alam Market, Koimari Road, Jaldhaka, Nilphamari, Bangladesh',
						},
					},
				],
			},
		],
	},

	'data-deletion': {
		id: 'data-deletion',
		title: 'Delete Your Data',
		subtitle:
			'Learn how to request deletion of your personal data from our systems in compliance with privacy regulations.',
		icon: Trash2,
		iconColor: 'text-red-600',
		bgColor: 'bg-red-100',
		lastUpdated: 'August 4, 2025',
		sections: [
			{
				id: 'overview',
				title: 'Data Deletion Overview',
				icon: Trash2,
				iconColor: 'text-red-600',
				content: [
					{
						type: 'paragraph',
						content:
							'You have the right to request deletion of your personal data from our systems. This page explains how to make such a request and what to expect during the process.',
					},
					{
						type: 'highlight',
						content:
							'Data deletion requests are processed in accordance with applicable privacy laws including GDPR, CCPA, and other regional privacy regulations.',
						className: 'bg-blue-50 text-blue-800',
					},
				],
			},
			{
				id: 'what-data-we-delete',
				title: 'What Data We Can Delete',
				content: [
					{
						type: 'grid',
						content: [
							{
								title: 'Personal Information',
								description:
									'Data that directly identifies you',
								items: [
									'Name, email address, phone number',
									'Shipping and billing addresses',
									'Account credentials and preferences',
									'Profile information and settings',
								],
							},
							{
								title: 'Activity Data',
								description:
									'Your interactions with our platform',
								items: [
									'Order history and purchase records',
									'Browsing behavior and preferences',
									'Customer support interactions',
									"Reviews and ratings you've submitted",
								],
							},
							{
								title: 'Technical Data',
								description: 'Device and usage information',
								items: [
									'IP addresses and device identifiers',
									'Cookies and tracking data',
									'Session logs and analytics data',
									'Error reports and crash logs',
								],
							},
						],
					},
				],
			},
			{
				id: 'how-to-request',
				title: 'How to Request Data Deletion',
				content: [
					{
						type: 'steps',
						content: [
							{
								step: 1,
								title: 'Log into Your Account',
								description:
									'Sign in to your Horekmart account using your email and password.',
							},
							{
								step: 2,
								title: 'Go to Account Settings',
								description:
									'Navigate to your account settings and look for the "Privacy & Data" section.',
							},
							{
								step: 3,
								title: 'Submit Deletion Request',
								description:
									'Click on "Request Data Deletion" and follow the on-screen instructions.',
							},
							{
								step: 4,
								title: 'Verify Your Identity',
								description:
									'For security purposes, you may need to verify your identity via email or SMS.',
							},
							{
								step: 5,
								title: 'Confirmation',
								description:
									"You'll receive a confirmation email with your request details and tracking number.",
							},
						],
					},
				],
			},
			{
				id: 'what-to-expect',
				title: 'What to Expect',
				content: [
					{
						type: 'grid',
						content: [
							{
								title: 'Processing Time',
								description: '',
								items: [
									'Most requests processed within 30 days',
									'Complex requests may take up to 60 days',
									"You'll receive status updates via email",
									'Expedited processing available in some cases',
								],
							},
							{
								title: 'Data Retention Requirements',
								description: '',
								items: [
									'Financial records kept for tax purposes (7 years)',
									'Legal compliance data retained as required',
									'Anonymous analytics may be preserved',
									'Security logs kept for fraud prevention',
								],
							},
						],
					},
				],
			},
			{
				id: 'important-considerations',
				title: 'Important Considerations',
				content: [
					{
						type: 'warning',
						content:
							'Account Closure: Requesting data deletion will permanently close your account. This action cannot be undone.',
						className:
							'bg-yellow-50 text-yellow-800 border-yellow-200',
					},
					{
						type: 'list',
						content: [
							'Order History: All past orders and receipts will be permanently deleted',
							'Stored Payment Methods: All saved cards and payment information will be removed',
							'Preferences: All saved preferences, wishlists, and recommendations will be lost',
							'Customer Support: Previous support tickets and chat history will be deleted',
							'Reviews: Your product reviews and ratings will be anonymized or removed',
						],
					},
				],
			},
			{
				id: 'exceptions',
				title: 'When We Cannot Delete Data',
				content: [
					{
						type: 'paragraph',
						content:
							'There are certain situations where we may not be able to delete all of your data immediately:',
					},
					{
						type: 'list',
						content: [
							'Legal Obligations: Data required by law to be retained (tax records, fraud prevention)',
							'Active Disputes: Information needed for ongoing legal proceedings or disputes',
							'Security Purposes: Data necessary for system security and fraud prevention',
							'Anonymous Data: Information that has been anonymized and cannot be linked to you',
							'Third-Party Services: Data managed by external payment processors or shipping partners',
						],
					},
				],
			},
			{
				id: 'contact',
				title: 'Need Help?',
				content: [
					{
						type: 'paragraph',
						content:
							'If you have questions about data deletion or need assistance with your request, our privacy team is here to help.',
					},
					{
						type: 'contact',
						content: {
							email: 'privacy@horekmart.com',
							phone: '+880 1763 223035',
							address:
								'Horekmart HQ, Alam Market, Koimari Road, Jaldhaka, Nilphamari, Bangladesh',
							businessHours:
								'Monday - Friday: 9:00 AM - 6:00 PM (Bangladesh Time)',
						},
					},
				],
			},
		],
	},
};

// Search function that simulates API search
export function searchHelpArticles(query: string): HelpArticle[] {
	if (!query.trim()) return [];

	const searchTerm = query.toLowerCase().trim();
	const allArticles = helpDatabase.flatMap((category) => category.articles);

	return allArticles
		.filter((article) => {
			const titleMatch = article.title.toLowerCase().includes(searchTerm);
			const descriptionMatch = article.description
				.toLowerCase()
				.includes(searchTerm);
			const contentMatch = article.content
				.toLowerCase()
				.includes(searchTerm);
			const keywordMatch = article.keywords.some((keyword) =>
				keyword.toLowerCase().includes(searchTerm)
			);

			return (
				titleMatch || descriptionMatch || contentMatch || keywordMatch
			);
		})
		.slice(0, 50); // Limit results to 50
}

// Get articles by category
export function getArticlesByCategory(categoryId: string): HelpArticle[] {
	const category = helpDatabase.find((cat) => cat.id === categoryId);
	return category ? category.articles : [];
}

// Get single article by ID
export function getArticleById(articleId: string): HelpArticle | null {
	const allArticles = helpDatabase.flatMap((category) => category.articles);
	return allArticles.find((article) => article.id === articleId) || null;
}

// Get all categories
export function getAllCategories(): HelpCategory[] {
	return helpDatabase;
}
