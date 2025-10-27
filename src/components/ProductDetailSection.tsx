'use client';

import { ReactNode } from 'react';

interface ProductDetailSectionProps {
	title: string;
	icon?: ReactNode;
	gradient?: string;
	children: ReactNode;
	className?: string;
}

export default function ProductDetailSection({
	title,
	icon,
	children,
	className = "",
}: ProductDetailSectionProps) {
	return (
		<section className={`bg-white rounded-xl border border-gray-200 ${className}`}>
			<header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-gray-200">
				{icon ? (
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-theme-primary">
						{icon}
					</span>
				) : null}
				<h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
			</header>
			<div className="px-4 md:px-6 py-6">
				{children}
			</div>
		</section>
	);
}
