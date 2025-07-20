'use client';

interface SpecificationItemProps {
	label: string;
	value: string;
	borderColor?: string;
}

export default function SpecificationItem({ 
	label, 
	value, 
	borderColor = "border-gray-100" 
}: SpecificationItemProps) {
	return (
		<div className={`flex justify-between items-center py-2.5 md:py-3 border-b ${borderColor} last:border-b-0`}>
			<span className="font-medium text-gray-600 text-sm md:text-base">{label}</span>
			<span className="text-gray-900 font-semibold text-sm md:text-base text-right">{value}</span>
		</div>
	);
}
