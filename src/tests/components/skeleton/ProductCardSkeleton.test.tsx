import { describe, it, expect } from 'vitest';
import { ProductCardSkeleton } from "../../../components/skeleton/ProductCardSkeleton";
import { renderWithProviders } from "../../renderWithProviders";

describe('ProductCardSkeleton', () => {
  it('renders skeleton structure', () => {
    renderWithProviders(<ProductCardSkeleton />);

    // Check that the main container has the correct classes
    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('card', 'animate-pulse');
  });

  it('renders image skeleton', () => {
    renderWithProviders(<ProductCardSkeleton />);

    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    const imageSkeleton = skeleton.firstChild as HTMLElement;
    expect(imageSkeleton).toHaveClass('w-full', 'h-48', 'bg-gray-200', 'rounded-lg', 'mb-4');
  });

  it('renders title skeleton elements', () => {
    renderWithProviders(<ProductCardSkeleton />);

    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    const titleSkeleton1 = skeleton.children[1] as HTMLElement;
    const titleSkeleton2 = skeleton.children[2] as HTMLElement;

    expect(titleSkeleton1).toHaveClass('h-6', 'bg-gray-200', 'rounded', 'mb-2');
    expect(titleSkeleton2).toHaveClass('h-4', 'bg-gray-200', 'rounded', 'w-3/4', 'mb-3');
  });

  it('renders description skeleton', () => {
    renderWithProviders(<ProductCardSkeleton />);

    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    const descriptionContainer = skeleton.children[3] as HTMLElement;

    expect(descriptionContainer).toHaveClass('space-y-2', 'mb-3');
    expect(descriptionContainer.children[0]).toHaveClass('h-3', 'bg-gray-200', 'rounded');
    expect(descriptionContainer.children[1]).toHaveClass('h-3', 'bg-gray-200', 'rounded', 'w-5/6');
  });

  it('renders rating skeleton', () => {
    renderWithProviders(<ProductCardSkeleton />);

    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    const ratingContainer = skeleton.children[4] as HTMLElement;

    expect(ratingContainer).toHaveClass('flex', 'items-center', 'gap-2', 'mb-3');
    expect(ratingContainer.children[0]).toHaveClass('h-4', 'w-20', 'bg-gray-200', 'rounded');
    expect(ratingContainer.children[1]).toHaveClass('h-4', 'w-16', 'bg-gray-200', 'rounded');
  });

  it('renders price and button skeleton', () => {
    renderWithProviders(<ProductCardSkeleton />);

    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    const bottomContainer = skeleton.children[5] as HTMLElement;

    expect(bottomContainer).toHaveClass('flex', 'justify-between', 'items-center');
    expect(bottomContainer.children[0]).toHaveClass('h-6', 'w-20', 'bg-gray-200', 'rounded');
    expect(bottomContainer.children[1]).toHaveClass('h-10', 'w-28', 'bg-gray-200', 'rounded');
  });

  it('has correct number of skeleton elements', () => {
    renderWithProviders(<ProductCardSkeleton />);

    const skeleton = document.querySelector('.card.animate-pulse') as HTMLElement;
    expect(skeleton.children).toHaveLength(6);
  });
});