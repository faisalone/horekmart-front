import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
} from '@tanstack/react-table';
import { adminApi } from '@/lib/admin-api';
import { Product, TableFilter, PaginatedResponse } from '@/types/admin';
import {
	productsFilterConfig,
	updateFilterConfigOptions,
} from '@/config/adminFilters';

export const useProductsPage = () => {
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(
		null
	);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isSocialMediaModalOpen, setIsSocialMediaModalOpen] = useState(false);
	const [socialMediaProduct, setSocialMediaProduct] =
		useState<Product | null>(null);
	const [filters, setFilters] = useState<TableFilter>({
		search: '',
		status: '',
		category_id: '',
		vendor_id: '',
		sort_by: undefined,
		sort_order: undefined,
		page: 1,
		per_page: 10,
	});

	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch categories and vendors for filters
	const { data: categoriesData } = useQuery({
		queryKey: ['admin-categories'],
		queryFn: () => adminApi.getCategories({ per_page: 100 }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const { data: vendorsData } = useQuery({
		queryKey: ['admin-vendors'],
		queryFn: () => adminApi.getVendors({ per_page: 100 }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Fetch products with advanced TanStack Query configuration
	const { data, isLoading, isFetching, error } = useQuery<
		PaginatedResponse<Product>
	>({
		queryKey: ['admin-products', filters],
		queryFn: () => adminApi.getProducts(filters),
		staleTime: 1000 * 60 * 2, // 2 minutes - data stays fresh
		gcTime: 1000 * 60 * 10, // 10 minutes - garbage collection time
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		placeholderData: (previousData) => previousData, // Keep previous data while loading
		retry: 2, // Retry failed requests 2 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
	});

	// Delete product mutation
	const deleteProductMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteProduct(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['admin-products'],
				type: 'all',
			});
		},
	});

	// Action handlers
	const handleAddProduct = () => {
		router.push('/dashboard/products/add');
	};

	const handleEditProduct = (productId: number) => {
		router.push(`/dashboard/products/${productId}/edit`);
	};

	const handleViewProduct = (product: Product) => {
		setSelectedProduct(product);
		setIsViewModalOpen(true);
	};

	const handleSocialMediaPost = (product: Product) => {
		setSocialMediaProduct(product);
		setIsSocialMediaModalOpen(true);
	};

	const handleDeleteProduct = (productId: number) => {
		if (confirm('Are you sure you want to delete this product?')) {
			deleteProductMutation.mutate(productId);
		}
	};

	// Filter handlers
	const handleFiltersChange = (newFilters: Partial<TableFilter>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	};

	const handleClearFilters = () => {
		setFilters({
			search: '',
			status: '',
			category_id: '',
			vendor_id: '',
			sort_by: undefined,
			sort_order: undefined,
			page: 1,
			per_page: 10,
		});
	};

	// Create dynamic filter config with categories and vendors
	const filterConfig = useMemo(() => {
		let config = { ...productsFilterConfig };

		// Add categories to category filter
		if (categoriesData?.data) {
			config = updateFilterConfigOptions(
				config,
				'category_id',
				categoriesData.data.map((category) => ({
					value: category.id.toString(),
					label: category.name,
				}))
			);
		}

		// Add vendors to vendor filter
		if (vendorsData?.data) {
			config = updateFilterConfigOptions(
				config,
				'vendor_id',
				vendorsData.data.map((vendor) => ({
					value: vendor.id.toString(),
					label: vendor.business_name || vendor.name,
				}))
			);
		}

		return config;
	}, [categoriesData?.data, vendorsData?.data]);

	const products = data?.data || [];

	// Table configuration helper
	const createTableConfig = (columns: any[]) => ({
		data: products,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: true, // Enable manual pagination
		pageCount: data?.meta?.last_page || 0, // Total pages from API
		state: {
			pagination: {
				pageIndex: (filters.page || 1) - 1, // Convert to 0-based index
				pageSize: filters.per_page || 10,
			},
		},
		onPaginationChange: (updater: any) => {
			const newPagination =
				typeof updater === 'function'
					? updater({
							pageIndex: (filters.page || 1) - 1,
							pageSize: filters.per_page || 10,
					  })
					: updater;

			setFilters((prev) => ({
				...prev,
				page: newPagination.pageIndex + 1, // Convert back to 1-based
				per_page: newPagination.pageSize,
			}));
		},
	});

	return {
		// State
		selectedProduct,
		setSelectedProduct,
		isViewModalOpen,
		setIsViewModalOpen,
		isSocialMediaModalOpen,
		setIsSocialMediaModalOpen,
		socialMediaProduct,
		setSocialMediaProduct,
		filters,

		// Query data
		data,
		isLoading,
		isFetching,
		error,
		products,

		// Table helper
		createTableConfig,

		// Filter config
		filterConfig,

		// Handlers
		handleAddProduct,
		handleEditProduct,
		handleViewProduct,
		handleSocialMediaPost,
		handleDeleteProduct,
		handleFiltersChange,
		handleClearFilters,

		// Mutations
		deleteProductMutation,
	};
};
