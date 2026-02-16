// Mock dependencies
const mockStorageFrom = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test-image.jpg' } })),
  remove: vi.fn(),
};

const mockFrom = {
  insert: vi.fn(() => ({
    select: vi.fn(() => ({ data: null, error: null })),
  })),
  update: vi.fn(() => ({ eq: vi.fn(() => ({ data: null, error: null })) })),
  delete: vi.fn(() => ({ eq: vi.fn(() => ({ data: null, error: null })) })),
};

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => mockStorageFrom),
    },
    from: vi.fn(() => mockFrom),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { renderWithProviders, screen, fireEvent, waitFor } from '../../renderWithProviders';
import { vi } from 'vitest';
import { ImageUploader } from '../../../components/admin/ImageUploader';
import { toast } from 'sonner';

const mockToast = vi.mocked(toast);

const mockExistingImages = [
  {
    id: '1',
    product_id: 'prod-1',
    image_url: 'https://example.com/image1.jpg',
    display_order: 0,
    is_primary: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: 'prod-1',
    image_url: 'https://example.com/image2.jpg',
    display_order: 1,
    is_primary: false,
    created_at: '2024-01-02T00:00:00Z',
  },
];

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with no existing images', () => {
    renderWithProviders(<ImageUploader productId="prod-1" />);

    expect(screen.getByText('Product Images')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, GIF up to 5MB (multiple files supported)')).toBeInTheDocument();
    expect(screen.getByText('No images uploaded yet. Upload your first image above.')).toBeInTheDocument();
  });

  it('renders existing images in grid', () => {
    renderWithProviders(<ImageUploader productId="prod-1" existingImages={mockExistingImages} />);

    expect(screen.getByText('Product Images')).toBeInTheDocument();
    expect(screen.getAllByAltText('Product')).toHaveLength(2);
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('shows primary badge only on primary image', () => {
    renderWithProviders(<ImageUploader productId="prod-1" existingImages={mockExistingImages} />);

    const primaryBadges = screen.getAllByText('Primary');
    expect(primaryBadges).toHaveLength(1);
  });

  it('handles file selection via click', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockStorageFrom.upload.mockResolvedValue({ error: null });
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: '3',
          product_id: 'prod-1',
          image_url: 'https://example.com/test.jpg',
          display_order: 2,
          is_primary: false,
          created_at: '2024-01-03T00:00:00Z',
        }],
        error: null,
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('1 uploaded');
    });
  });

  it('validates file types', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('test.txt is not an image');
    });
  });

  it('validates file size', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('large.jpg too large (max 5MB)');
    });
  });

  it('handles drag and drop', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockStorageFrom.upload.mockResolvedValue({ error: null });
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: '3',
          product_id: 'prod-1',
          image_url: 'https://example.com/test.jpg',
          display_order: 0,
          is_primary: true,
          created_at: '2024-01-03T00:00:00Z',
        }],
        error: null,
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    const uploadArea = input.parentElement;

    fireEvent.dragOver(uploadArea!);

    await waitFor(() => {
      expect(uploadArea).toHaveClass('border-primary-500');
    });

    fireEvent.drop(uploadArea!, {
      dataTransfer: {
        files: [mockFile],
      },
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('1 uploaded');
    });
  });

  it('shows loading state during upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Mock a slow upload
    mockStorageFrom.upload.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: '3',
          product_id: 'prod-1',
          image_url: 'https://example.com/test.jpg',
          display_order: 0,
          is_primary: true,
          created_at: '2024-01-03T00:00:00Z',
        }],
        error: null,
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('handles upload error', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockStorageFrom.upload.mockResolvedValue({ error: new Error('Upload failed') });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Upload failed: test.jpg');
    });
  });

  it('handles database error', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockStorageFrom.upload.mockResolvedValue({ error: null });
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to save images');
    });
  });

  it('sets first uploaded image as primary', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockStorageFrom.upload.mockResolvedValue({ error: null });
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: '3',
          product_id: 'prod-1',
          image_url: 'https://example.com/test.jpg',
          display_order: 0,
          is_primary: true,
          created_at: '2024-01-03T00:00:00Z',
        }],
        error: null,
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  it('deletes image when confirmed', async () => {
    const mockConfirm = vi.fn(() => true);
    globalThis.confirm = mockConfirm;

    mockStorageFrom.remove.mockResolvedValue({ error: null });

    mockFrom.delete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" existingImages={mockExistingImages} />);

    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Image deleted');
    });
  });

  it('does not delete image when not confirmed', async () => {
    const mockConfirm = vi.fn(() => false);
    globalThis.confirm = mockConfirm;

    renderWithProviders(<ImageUploader productId="prod-1" existingImages={mockExistingImages} />);

    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this image?');
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('sets image as primary', async () => {
    mockFrom.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" existingImages={mockExistingImages} />);

    const setPrimaryButtons = screen.getAllByLabelText('Set as primary image');
    fireEvent.click(setPrimaryButtons[0]);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Primary image updated');
    });
  });

  it('calls onImagesUpdated callback after successful operations', async () => {
    const mockOnImagesUpdated = vi.fn();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockStorageFrom.upload.mockResolvedValue({ error: null });
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: '3',
          product_id: 'prod-1',
          image_url: 'https://example.com/test.jpg',
          display_order: 0,
          is_primary: true,
          created_at: '2024-01-03T00:00:00Z',
        }],
        error: null,
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" onImagesUpdated={mockOnImagesUpdated} />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnImagesUpdated).toHaveBeenCalled();
    });
  });

  it('disables upload during uploading', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Mock a slow upload
    mockStorageFrom.upload.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

    mockFrom.insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: '3',
          product_id: 'prod-1',
          image_url: 'https://example.com/test.jpg',
          display_order: 0,
          is_primary: true,
          created_at: '2024-01-03T00:00:00Z',
        }],
        error: null,
      }),
    });

    renderWithProviders(<ImageUploader productId="prod-1" />);

    const input = screen.getByLabelText(/click to upload/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    // Upload area should be disabled during upload
    await waitFor(() => {
      const uploadArea = input.parentElement;
      expect(uploadArea).toHaveClass('opacity-50', 'pointer-events-none');
    });
  });
});