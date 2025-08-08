/**
 * Shipping Calculator Service
 * Calculates shipping charges based on product weight and delivery location
 */

export type ShippingZone =
	| 'inside_nilphamari'
	| 'inside_dhaka'
	| 'near_dhaka'
	| 'outside_dhaka_nilphamari';

export interface WeightBasedRate {
	minWeight: number;
	maxWeight: number;
	rate: number;
}

export interface ShippingZoneConfig {
	zone: ShippingZone;
	name: string;
	description: string;
	rates: WeightBasedRate[];
	additionalRatePerKg: number; // Rate per kg after 2kg
}

export interface ShippingCalculationResult {
	zone: ShippingZone;
	zoneName: string;
	totalWeight: number;
	shippingCost: number;
	breakdown: {
		baseRate: number;
		additionalWeight: number;
		additionalCost: number;
	};
}

export interface CartItemWithWeight {
	weight?: number;
	weightUnit?: string;
	quantity: number;
}

class ShippingCalculator {
	private readonly shippingZones: ShippingZoneConfig[] = [
		{
			zone: 'inside_nilphamari',
			name: 'Inside Nilphamari City',
			description: 'Delivery within Nilphamari city limits',
			rates: [
				{ minWeight: 0, maxWeight: 0.5, rate: 60 },
				{ minWeight: 0.5, maxWeight: 1, rate: 70 },
				{ minWeight: 1, maxWeight: 2, rate: 90 },
			],
			additionalRatePerKg: 15,
		},
		{
			zone: 'inside_dhaka',
			name: 'Inside Dhaka City',
			description: 'Delivery within Dhaka city limits',
			rates: [
				{ minWeight: 0, maxWeight: 0.5, rate: 60 },
				{ minWeight: 0.5, maxWeight: 1, rate: 70 },
				{ minWeight: 1, maxWeight: 2, rate: 90 },
			],
			additionalRatePerKg: 15,
		},
		{
			zone: 'near_dhaka',
			name: 'Near Dhaka (Suburbs)',
			description: 'Gazipur, Keranigong, Narayanganj, Savar',
			rates: [
				{ minWeight: 0, maxWeight: 0.5, rate: 80 },
				{ minWeight: 0.5, maxWeight: 1, rate: 100 },
				{ minWeight: 1, maxWeight: 2, rate: 130 },
			],
			additionalRatePerKg: 25,
		},
		{
			zone: 'outside_dhaka_nilphamari',
			name: 'Outside Dhaka & Nilphamari',
			description: 'All other locations in Bangladesh',
			rates: [
				{ minWeight: 0, maxWeight: 0.5, rate: 110 },
				{ minWeight: 0.5, maxWeight: 1, rate: 130 },
				{ minWeight: 1, maxWeight: 2, rate: 170 },
			],
			additionalRatePerKg: 25,
		},
	];

	/**
	 * Get all available shipping zones
	 */
	getShippingZones(): ShippingZoneConfig[] {
		return this.shippingZones;
	}

	/**
	 * Get shipping zone configuration by zone ID
	 */
	getShippingZone(zone: ShippingZone): ShippingZoneConfig | null {
		return this.shippingZones.find((z) => z.zone === zone) || null;
	}

	/**
	 * Calculate total weight of cart items
	 */
	calculateTotalWeight(items: CartItemWithWeight[]): number {
		return items.reduce((totalWeight, item) => {
			let itemWeight = item.weight || 0.1; // Default weight if not provided (100g)

			// Convert weight to kg if needed
			if (item.weightUnit === 'g') {
				itemWeight = itemWeight / 1000;
			}

			return totalWeight + itemWeight * item.quantity;
		}, 0);
	}

	/**
	 * Calculate shipping cost for given weight and zone
	 */
	calculateShippingCost(
		totalWeight: number,
		zone: ShippingZone
	): ShippingCalculationResult {
		const zoneConfig = this.getShippingZone(zone);

		if (!zoneConfig) {
			throw new Error(`Invalid shipping zone: ${zone}`);
		}

		let baseRate = 0;
		let additionalWeight = 0;
		let additionalCost = 0;

		// Find the appropriate base rate
		if (totalWeight <= 2) {
			// Find the rate for weights up to 2kg
			const rate = zoneConfig.rates.find(
				(r) => totalWeight > r.minWeight && totalWeight <= r.maxWeight
			);

			if (rate) {
				baseRate = rate.rate;
			} else {
				// If no exact match, use the highest rate in the base range
				baseRate = zoneConfig.rates[zoneConfig.rates.length - 1].rate;
			}
		} else {
			// Weight is over 2kg
			baseRate = zoneConfig.rates[zoneConfig.rates.length - 1].rate; // Use 1-2kg rate as base
			additionalWeight = totalWeight - 2;
			additionalCost = additionalWeight * zoneConfig.additionalRatePerKg;
		}

		const shippingCost = baseRate + additionalCost;

		return {
			zone,
			zoneName: zoneConfig.name,
			totalWeight,
			shippingCost,
			breakdown: {
				baseRate,
				additionalWeight,
				additionalCost,
			},
		};
	}

	/**
	 * Calculate shipping cost for cart items
	 */
	calculateShippingForCart(
		items: CartItemWithWeight[],
		zone: ShippingZone
	): ShippingCalculationResult {
		const totalWeight = this.calculateTotalWeight(items);
		return this.calculateShippingCost(totalWeight, zone);
	}

	/**
	 * Get shipping options for a given cart with calculated costs
	 */
	getShippingOptionsForCart(items: CartItemWithWeight[]): Array<{
		zone: ShippingZone;
		name: string;
		description: string;
		cost: number;
		weight: number;
		breakdown: ShippingCalculationResult['breakdown'];
	}> {
		const totalWeight = this.calculateTotalWeight(items);

		return this.shippingZones.map((zoneConfig) => {
			const calculation = this.calculateShippingCost(
				totalWeight,
				zoneConfig.zone
			);

			return {
				zone: zoneConfig.zone,
				name: zoneConfig.name,
				description: zoneConfig.description,
				cost: calculation.shippingCost,
				weight: totalWeight,
				breakdown: calculation.breakdown,
			};
		});
	}

	/**
	 * Legacy method to maintain backward compatibility
	 * Maps old shipping methods to new zones
	 */
	getShippingCostLegacy(shippingMethod: string): number {
		const legacyMapping: Record<string, ShippingZone> = {
			inside_rangpur: 'inside_nilphamari', // Rangpur -> Nilphamari
			inside_dhaka: 'inside_dhaka',
			outside_dhaka: 'outside_dhaka_nilphamari',
		};

		const zone = legacyMapping[shippingMethod];
		if (!zone) {
			return 130; // Default fallback
		}

		// Use minimum weight for legacy calculation (0.1kg)
		const result = this.calculateShippingCost(0.1, zone);
		return result.shippingCost;
	}

	/**
	 * Format weight for display
	 */
	formatWeight(weight: number): string {
		if (weight < 1) {
			return `${Math.round(weight * 1000)}g`;
		}
		return `${weight.toFixed(1)}kg`;
	}

	/**
	 * Get weight tier description for display
	 */
	getWeightTierDescription(weight: number): string {
		if (weight <= 0.5) return '0-0.5 Kg';
		if (weight <= 1) return '0.5-1 Kg';
		if (weight <= 2) return '1-2 Kg';
		return `Over 2 Kg (${this.formatWeight(weight)})`;
	}
}

// Export singleton instance
export const shippingCalculator = new ShippingCalculator();
export default shippingCalculator;
