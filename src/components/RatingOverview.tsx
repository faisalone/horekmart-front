'use client';

import { Star } from 'lucide-react';

interface RatingOverviewProps {
	rating: number;
	totalReviews: number;
	ratings: { rating: number; count: number; percentage: number }[];
}

export default function RatingOverview({ rating, totalReviews, ratings }: RatingOverviewProps) {
	return (
		<div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 md:p-8 border border-yellow-200 md:shadow-sm">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
				<div className="text-center md:text-left mb-4 md:mb-0">
					<h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Overall Rating</h4>
					<p className="text-gray-600 text-sm md:text-base">Based on customer feedback</p>
				</div>
				<div className="text-center">
					<div className="flex items-center justify-center space-x-2 mb-2">
						<div className="flex items-center space-x-1">
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									className={`w-5 h-5 md:w-6 md:h-6 ${
										i < Math.floor(rating)
											? 'text-yellow-400 fill-current'
											: 'text-gray-300'
									}`}
								/>
							))}
						</div>
						<span className="text-2xl md:text-3xl font-bold text-gray-900 ml-2">{rating}</span>
					</div>
					<p className="text-xs md:text-sm text-gray-500">{totalReviews} total reviews</p>
				</div>
			</div>

			{/* Rating Breakdown */}
			<div className="space-y-3 md:space-y-4">
				{ratings.map((item) => (
					<div key={item.rating} className="flex items-center space-x-3 md:space-x-4">
						<div className="flex items-center space-x-1 md:space-x-2 min-w-[35px] md:min-w-[60px]">
							<span className="text-xs md:text-sm font-medium text-gray-700">{item.rating}</span>
							<Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
						</div>
						<div className="flex-1 bg-gray-200 rounded-full h-2.5 md:h-3">
							<div 
								className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 md:h-3 rounded-full transition-all duration-500" 
								style={{ width: `${item.percentage}%` }}
							></div>
						</div>
						<span className="text-xs md:text-sm text-gray-600 min-w-[2rem] md:min-w-[3rem] text-right font-medium">
							{item.count} review{item.count !== 1 ? 's' : ''}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
