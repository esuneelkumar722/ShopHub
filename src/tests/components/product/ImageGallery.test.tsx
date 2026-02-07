// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
  },
}));

import { renderWithProviders, screen, fireEvent } from '../../renderWithProviders';
import { vi } from 'vitest';
import React from 'react';
import { ImageGallery } from '../../../components/product/ImageGallery';

const mockImages = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
];

describe('ImageGallery', () => {
  it('renders nothing when no images provided', () => {
    const { container } = renderWithProviders(<ImageGallery images={[]} productName="Test Product" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single image without navigation controls', () => {
    renderWithProviders(<ImageGallery images={[mockImages[0]]} productName="Test Product" />);

    const mainImage = screen.getByAltText('Test Product - Image 1');
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', mockImages[0]);

    // No navigation arrows or counter for single image
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });

  it('renders multiple images with navigation controls', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    // Main image
    const mainImage = screen.getByAltText('Test Product - Image 1');
    expect(mainImage).toBeInTheDocument();

    // Navigation controls
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Thumbnails
    const thumbnails = screen.getAllByAltText(/Test Product thumbnail/);
    expect(thumbnails).toHaveLength(3);
  });

  it('navigates to next image', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);

    expect(screen.getByAltText('Test Product - Image 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous image', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    // Start at second image
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);

    // Go back to first
    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);

    expect(screen.getByAltText('Test Product - Image 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('wraps around to last image when going previous from first', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);

    expect(screen.getByAltText('Test Product - Image 3')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('wraps around to first image when going next from last', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    // Go to last image
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    // Go next again to wrap around
    fireEvent.click(nextButton);

    expect(screen.getByAltText('Test Product - Image 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('selects image via thumbnail click', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const thumbnails = screen.getAllByAltText(/Test Product thumbnail/);
    fireEvent.click(thumbnails[2]); // Click third thumbnail

    expect(screen.getByAltText('Test Product - Image 3')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('highlights selected thumbnail', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const thumbnails = screen.getAllByRole('button', { name: /View image/ });

    // First thumbnail should be selected initially
    expect(thumbnails[0]).toHaveAttribute('aria-current', 'true');
    expect(thumbnails[1]).not.toHaveAttribute('aria-current', 'true');
    expect(thumbnails[2]).not.toHaveAttribute('aria-current', 'true');

    // Click second thumbnail
    fireEvent.click(thumbnails[1]);

    expect(thumbnails[0]).not.toHaveAttribute('aria-current', 'true');
    expect(thumbnails[1]).toHaveAttribute('aria-current', 'true');
    expect(thumbnails[2]).not.toHaveAttribute('aria-current', 'true');
  });

  it('shows zoom icon when not zoomed', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    // Zoom icon should be rendered when not zoomed (initially)
    const zoomIconContainer = document.querySelector('div.absolute.top-4.right-4');
    expect(zoomIconContainer).toBeInTheDocument();
    expect(zoomIconContainer).toHaveClass('opacity-0'); // Initially hidden
  });

  it('hides zoom icon when zoomed', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const imageContainer = screen.getByAltText('Test Product - Image 1').parentElement!;

    // Initially, zoom icon should not be visible (opacity-0)
    let zoomIconContainer = document.querySelector('div.absolute.top-4.right-4');
    expect(zoomIconContainer).toHaveClass('opacity-0');

    // Hover over image to zoom - this should hide the zoom icon completely
    fireEvent.mouseEnter(imageContainer);

    // After mouse enter (zoom), the zoom icon should not be rendered
    zoomIconContainer = document.querySelector('div.absolute.top-4.right-4');
    expect(zoomIconContainer).toBeNull(); // Should not exist when zoomed
  });

  it('applies zoom transform on mouse move', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const imageContainer = screen.getByAltText('Test Product - Image 1').parentElement!;
    const image = screen.getByAltText('Test Product - Image 1');

    // Mock getBoundingClientRect
    const mockRect = {
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      bottom: 200,
      right: 200,
      toJSON: () => ({})
    };
    imageContainer.getBoundingClientRect = vi.fn(() => mockRect);

    // Hover and move mouse
    fireEvent.mouseEnter(imageContainer);
    fireEvent.mouseMove(imageContainer, {
      clientX: 100,
      clientY: 100,
    });

    // Image should have zoom transform
    expect(image).toHaveStyle('transform: scale(2)');
    expect(image).toHaveStyle('transform-origin: 50% 50%');
  });

  it('removes zoom on mouse leave', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const imageContainer = screen.getByAltText('Test Product - Image 1').parentElement!;
    const image = screen.getByAltText('Test Product - Image 1');

    // Hover and move mouse to zoom
    fireEvent.mouseEnter(imageContainer);
    fireEvent.mouseMove(imageContainer, {
      clientX: 100,
      clientY: 100,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
      },
    });

    // Leave mouse
    fireEvent.mouseLeave(imageContainer);

    // Image should not have zoom
    expect(image).toHaveStyle('transform: scale(1)');
  });

  it('loads thumbnails lazily', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    const thumbnails = screen.getAllByAltText(/Test Product thumbnail/);
    thumbnails.forEach(thumbnail => {
      expect(thumbnail).toHaveAttribute('loading', 'lazy');
    });
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<ImageGallery images={mockImages} productName="Test Product" />);

    // Main image
    const mainImage = screen.getByAltText('Test Product - Image 1');
    expect(mainImage).toHaveAttribute('alt', 'Test Product - Image 1');

    // Navigation buttons
    const prevButton = screen.getByLabelText('Previous image');
    const nextButton = screen.getByLabelText('Next image');
    expect(prevButton).toHaveAttribute('aria-label', 'Previous image');
    expect(nextButton).toHaveAttribute('aria-label', 'Next image');

    // Thumbnails
    const thumbnails = screen.getAllByRole('button', { name: /View image/ });
    thumbnails.forEach((thumbnail, index) => {
      expect(thumbnail).toHaveAttribute('aria-label', `View image ${index + 1}`);
    });
  });
});