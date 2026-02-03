import { describe, it, expect } from 'vitest';
import { ProductDetailSkeleton } from "../../../components/skeleton/ProductDetailSkeleton";
import { renderWithProviders } from "../../renderWithProviders";

describe('ProductDetailSkeleton', () => {
  it('renders with correct container classes', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8', 'animate-pulse');
  });

  it('renders back button skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const backButton = container.firstChild as HTMLElement;
    expect(backButton).toHaveClass('h-6', 'w-24', 'bg-gray-200', 'rounded', 'mb-6');
  });

  it('renders grid layout', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-12');
  });

  it('renders image skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const imageSkeleton = grid.children[0] as HTMLElement;
    expect(imageSkeleton).toHaveClass('w-full', 'h-96', 'bg-gray-200', 'rounded-2xl');
  });

  it('renders product info section', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;

    expect(productInfo.children).toHaveLength(7); // category, title, rating, price, description, stock, buttons
  });

  it('renders category badge skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const categoryBadge = productInfo.children[0] as HTMLElement;

    expect(categoryBadge).toHaveClass('h-6', 'w-24', 'bg-gray-200', 'rounded-full', 'mb-4');
  });

  it('renders title skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const title = productInfo.children[1] as HTMLElement;

    expect(title).toHaveClass('h-10', 'bg-gray-200', 'rounded', 'mb-4');
  });

  it('renders rating skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const rating = productInfo.children[2] as HTMLElement;

    expect(rating).toHaveClass('flex', 'items-center', 'gap-4', 'mb-6');
    expect(rating.children[0]).toHaveClass('h-6', 'w-32', 'bg-gray-200', 'rounded');
    expect(rating.children[1]).toHaveClass('h-6', 'w-24', 'bg-gray-200', 'rounded');
  });

  it('renders price skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const price = productInfo.children[3] as HTMLElement;

    expect(price).toHaveClass('h-12', 'w-32', 'bg-gray-200', 'rounded', 'mb-6');
  });

  it('renders description skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const description = productInfo.children[4] as HTMLElement;

    expect(description).toHaveClass('space-y-3', 'mb-8');
    expect(description.children).toHaveLength(3);
    expect(description.children[0]).toHaveClass('h-4', 'bg-gray-200', 'rounded');
    expect(description.children[1]).toHaveClass('h-4', 'bg-gray-200', 'rounded');
    expect(description.children[2]).toHaveClass('h-4', 'bg-gray-200', 'rounded', 'w-5/6');
  });

  it('renders stock skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const stock = productInfo.children[5] as HTMLElement;

    expect(stock).toHaveClass('h-10', 'w-32', 'bg-gray-200', 'rounded', 'mb-8');
  });

  it('renders buttons skeleton', () => {
    renderWithProviders(<ProductDetailSkeleton />);

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-8.animate-pulse') as HTMLElement;
    const grid = container.children[1] as HTMLElement;
    const productInfo = grid.children[1] as HTMLElement;
    const buttons = productInfo.children[6] as HTMLElement;

    expect(buttons).toHaveClass('flex', 'gap-4');
    expect(buttons.children[0]).toHaveClass('flex-1', 'h-14', 'bg-gray-200', 'rounded-lg');
    expect(buttons.children[1]).toHaveClass('h-14', 'w-14', 'bg-gray-200', 'rounded-lg');
  });
});