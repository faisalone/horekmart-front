import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product, Category } from '@/types';

// Example: Laravel-friendly API endpoints
export const api = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
	tagTypes: ['Product', 'Category', 'Asset'],
	endpoints: (builder) => ({
		getProducts: builder.query<Product[], void>({
			query: () => 'products',
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({
								type: 'Product' as const,
								id,
							})),
							{ type: 'Product', id: 'LIST' },
					  ]
					: [{ type: 'Product', id: 'LIST' }],
		}),
		getCategories: builder.query<Category[], void>({
			query: () => 'categories',
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({
								type: 'Category' as const,
								id,
							})),
							{ type: 'Category', id: 'LIST' },
					  ]
					: [{ type: 'Category', id: 'LIST' }],
		}),
		getLogo: builder.query<string, void>({
			query: () => 'assets/logo',
			providesTags: [{ type: 'Asset', id: 'logo' }],
			// Cache logo for 24h (no refetch unless invalidated)
			keepUnusedDataFor: 60 * 60 * 24,
		}),
		// Add more endpoints as needed (banners, promos, etc.)
	}),
});

export const { useGetProductsQuery, useGetCategoriesQuery, useGetLogoQuery } =
	api;
