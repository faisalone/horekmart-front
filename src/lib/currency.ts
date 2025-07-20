// Currency formatting utility
// All prices are already in BDT from the backend
export const formatCurrency = (amount: number): string => {
	return (
		new Intl.NumberFormat('en-BD', {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount) + ' Tk'
	);
};
