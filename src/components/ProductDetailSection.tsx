'use client';

import { ReactNode } from 'react';

interface ProductDetailSectionProps {
	title: string;
	icon: ReactNode;
	gradient: string;
	children: ReactNode;
	className?: string;
}

export default function ProductDetailSection({
	title,
	icon,
	gradient,
	children,
	className = ""
}: ProductDetailSectionProps) {
	return (
		<div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
			<div className={`${gradient} px-4 md:px-6 py-3 md:py-4`}>
				<h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white flex items-center">
					<div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-lg flex items-center justify-center mr-2 md:mr-3">
						{icon}
					</div>
					{title}
				</h3>
			</div>
			<div className="p-4 md:p-6 lg:p-8">
				{children}
			</div>
		</div>
	);
}
