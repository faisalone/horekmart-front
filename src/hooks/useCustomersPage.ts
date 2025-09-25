import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Customer, TableFilter } from '@/types/admin';
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	createColumnHelper,
} from '@tanstack/react-table';
import { toast } from 'sonner';

export function useCustomersPage() {
	const [filters, setFilters] = useState<TableFilter>({
		search: '',
		page: 1,
		per_page: 15,
	});

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
		null
	);

	const queryClient = useQueryClient();
	const router = useRouter();

	// Fetch customers
	const { data, isLoading, error, isFetching } = useQuery({
		queryKey: ['dashboard-customers', filters],
		queryFn: () => adminApi.getCustomers(filters),
	});

	// Delete customer mutation
	const deleteCustomerMutation = useMutation({
		mutationFn: (customerId: string) => adminApi.deleteCustomer(customerId),
		onSuccess: () => {
			toast.success('Customer deleted successfully');
			queryClient.invalidateQueries({
				queryKey: ['dashboard-customers'],
			});
			setIsDeleteDialogOpen(false);
			setCustomerToDelete(null);
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.error || 'Failed to delete customer'
			);
		},
	});

	const customers = data?.data || [];

	const handleFiltersChange = (newFilters: Partial<TableFilter>) => {
		setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
	};

	const handleClearFilters = () => {
		setFilters({
			search: '',
			page: 1,
			per_page: 15,
		});
	};

	const handlePageChange = (page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	};

	const handleDeleteCustomer = (customer: Customer) => {
		setCustomerToDelete(customer);
		setIsDeleteDialogOpen(true);
	};

	const confirmDeleteCustomer = () => {
		if (customerToDelete) {
			deleteCustomerMutation.mutate(customerToDelete.id.toString());
		}
	};

	// Filter configuration for the Filters component
	const filterConfig = {
		title: 'Customer Filters',
		description: 'Filter and search customers',
		fields: [
			{
				key: 'search',
				type: 'search' as const,
				placeholder: 'Search customers by name or phone...',
			},
		],
	};

	return {
		// Data
		data,
		customers,
		isLoading,
		isFetching,
		error,

		// Dialogs
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
		customerToDelete,

		// Mutations
		deleteCustomerMutation,

		// Filter and pagination
		filters,
		filterConfig,
		handleFiltersChange,
		handleClearFilters,
		handlePageChange,

		// Actions
		handleDeleteCustomer,
		confirmDeleteCustomer,
	};
}
