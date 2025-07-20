'use client';

import { Star } from 'lucide-react';

interface ReviewCardProps {
	review: {
		id: number;
		name: string;
		rating: number;
		date: string;
		comment: string;
		verified: boolean;
	};
}

export default function ReviewCard({ review }: ReviewCardProps) {
	return (
		<div className="bg-gray-50 md:bg-white rounded-xl p-4 md:p-6 border border-gray-200 md:shadow-sm">
			<div className="flex items-start justify-between mb-3 md:mb-4">
				<div className="flex items-center space-x-3 md:space-x-4">
					<div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
						{review.name.charAt(0)}
					</div>
					<div>
						<h5 className="font-semibold text-gray-900 text-sm md:text-lg">{review.name}</h5>
						<div className="flex items-center space-x-2 md:space-x-3 mt-1">
							<div className="flex items-center space-x-1">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`w-3 h-3 md:w-4 md:h-4 ${
											i < review.rating
												? 'text-yellow-400 fill-current'
												: 'text-gray-300'
										}`}
									/>
								))}
							</div>
							{review.verified && (
								<span className="text-xs md:text-sm bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full font-medium">
									✓ Verified{' '}
									<span className="hidden md:inline">Purchase</span>
								</span>
							)}
						</div>
					</div>
				</div>
				<span className="text-xs md:text-sm text-gray-500 bg-white md:bg-gray-100 px-2 md:px-3 py-1 rounded-full border md:border-0">
					{review.date}
				</span>
			</div>
			<p className="text-gray-700 leading-relaxed text-sm md:text-lg">{review.comment}</p>
		</div>
	);
}
