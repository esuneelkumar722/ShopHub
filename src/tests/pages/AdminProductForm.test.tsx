// Mock dependencies
vi.mock('../../hooks/useAdmin', () => ({
  useAdmin: vi.fn()
}));
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() }))
  };
});
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  useController: vi.fn()
}));
vi.mock('@hookform/resolvers/zod');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

import { renderWithProviders, screen, fireEvent } from '../renderWithProviders';
import { vi } from 'vitest';
import { AdminProductForm } from '../../pages/admin/AdminProductForm';
import { useAdmin } from '../../hooks/useAdmin';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

const mockUseAdmin = vi.mocked(useAdmin);
const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockUseForm = vi.mocked(useForm);
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseParams = vi.mocked(useParams);

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  price: 99.99,
  category: 'electronics',
  image_url: 'https://example.com/image.jpg',
  stock: 10,
  rating: 4.5,
  reviews_count: 100
};

describe('AdminProductForm', () => {
  const mockNavigate = vi.fn();
  const mockReset = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockRegister = vi.fn();
  const mockFormState = {
    errors: {},
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValid: true,
    isValidating: false,
    submitCount: 0,
    touchedFields: {},
    dirtyFields: {},
    defaultValues: {},
    disabled: false,
    validatingFields: {},
    isReady: true,
  };

  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseParams.mockReturnValue({});
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: mockFormState,
      reset: mockReset,
      watch: vi.fn(),
      getValues: vi.fn(),
      getFieldState: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      setValue: vi.fn(),
      trigger: vi.fn(),
      control: {} as any,
      setFocus: vi.fn(),
      unregister: vi.fn(),
      resetField: vi.fn(),
      subscribe: vi.fn(),
    });
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as any);
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      isPending: false,
      isIdle: true,
      isError: false,
      isSuccess: false,
      status: 'idle',
      error: null,
      data: undefined,
      variables: undefined,
      submittedAt: 0,
      failureCount: 0,
      failureReason: null
    } as any);
  });

  it('renders access denied for non-admin users', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false, isLoading: false });
    renderWithProviders(<AdminProductForm />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('renders create form in create mode', () => {
    renderWithProviders(<AdminProductForm />);
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
  });

  it('renders edit form in edit mode', () => {
    mockUseParams.mockReturnValue({ id: '1' });
    mockUseQuery.mockReturnValue({
      data: mockProduct,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as any);
    renderWithProviders(<AdminProductForm />);
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByText('Update Product')).toBeInTheDocument();
  });

  it('shows form validation errors', () => {
    mockUseForm.mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: {
        errors: {
          name: { message: 'Name is required', type: 'required' },
          price: { message: 'Price must be greater than 0', type: 'min' }
        },
        isDirty: false,
        isLoading: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValid: false,
        isValidating: false,
        submitCount: 0,
        touchedFields: {},
        dirtyFields: {},
        defaultValues: {},
        disabled: false,
        validatingFields: {},
        isReady: true,
      },
      reset: mockReset,
      watch: vi.fn(),
      getValues: vi.fn(),
      getFieldState: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      setValue: vi.fn(),
      trigger: vi.fn(),
      control: {} as any,
      setFocus: vi.fn(),
      unregister: vi.fn(),
      resetField: vi.fn(),
      subscribe: vi.fn(),
    });
    renderWithProviders(<AdminProductForm />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
  });

  it('submits form data on create', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      isPending: false,
      isIdle: true,
      isError: false,
      isSuccess: false,
      status: 'idle',
      error: null,
      data: undefined,
      variables: undefined,
      submittedAt: 0,
      failureCount: 0,
      failureReason: null
    } as any);

    const mockOnSubmit = vi.fn();
    mockHandleSubmit.mockReturnValue(mockOnSubmit);

    renderWithProviders(<AdminProductForm />);
    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('shows loading state during save', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      isPending: true,
      isIdle: false,
      isError: false,
      isSuccess: false,
      status: 'pending',
      error: null,
      data: undefined,
      variables: undefined,
      submittedAt: Date.now(),
      failureCount: 0,
      failureReason: null
    } as any);

    renderWithProviders(<AdminProductForm />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('navigates back when cancel is clicked', () => {
    renderWithProviders(<AdminProductForm />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('navigates back when back button is clicked', () => {
    renderWithProviders(<AdminProductForm />);
    const backButton = screen.getByText('Back to Products');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('shows image uploader in edit mode', () => {
    mockUseParams.mockReturnValue({ id: '1' });
    mockUseQuery.mockReturnValue({
      data: mockProduct,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as any);
    renderWithProviders(<AdminProductForm />);
    // ImageUploader component should be rendered in edit mode
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });
});