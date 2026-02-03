import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCartStore } from '../../store/cartStore';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid'
  }
});

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
      result.current.setUserId(null);
    });
  });

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.items).toEqual([]);
    expect(result.current.getTotalPrice()).toBe(0);
    expect(result.current.getTotalItems()).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    const product = {
      id: 'prod1',
      name: 'Test Product',
      price: 25.99,
      image_url: 'test.jpg'
    };

    act(() => {
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      id: 'mock-uuid',
      product_id: 'prod1',
      quantity: 1,
      product
    });
    expect(result.current.getTotalPrice()).toBe(25.99);
    expect(result.current.getTotalItems()).toBe(1);
  });

  it('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCartStore());

    const product = {
      id: 'prod1',
      name: 'Test Product',
      price: 25.99,
      image_url: 'test.jpg'
    };

    act(() => {
      result.current.addItem(product);
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.getTotalPrice()).toBe(51.98);
    expect(result.current.getTotalItems()).toBe(2);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    const product = {
      id: 'prod1',
      name: 'Test Product',
      price: 25.99,
      image_url: 'test.jpg'
    };

    act(() => {
      result.current.addItem(product);
      result.current.removeItem('prod1');
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.getTotalPrice()).toBe(0);
    expect(result.current.getTotalItems()).toBe(0);
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCartStore());

    const product = {
      id: 'prod1',
      name: 'Test Product',
      price: 25.99,
      image_url: 'test.jpg'
    };

    act(() => {
      result.current.addItem(product);
      result.current.updateQuantity('prod1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getTotalPrice()).toBe(129.95);
    expect(result.current.getTotalItems()).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useCartStore());

    const product = {
      id: 'prod1',
      name: 'Test Product',
      price: 25.99,
      image_url: 'test.jpg'
    };

    act(() => {
      result.current.addItem(product);
      result.current.updateQuantity('prod1', 0);
    });

    expect(result.current.items).toEqual([]);
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = {
      id: 'prod1',
      name: 'Product 1',
      price: 25.99,
      image_url: 'test1.jpg'
    };

    const product2 = {
      id: 'prod2',
      name: 'Product 2',
      price: 15.99,
      image_url: 'test2.jpg'
    };

    act(() => {
      result.current.addItem(product1);
      result.current.addItem(product2);
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.getTotalPrice()).toBe(0);
    expect(result.current.getTotalItems()).toBe(0);
  });

  it('calculates total price correctly', () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = {
      id: 'prod1',
      name: 'Product 1',
      price: 25.99,
      image_url: 'test1.jpg'
    };

    const product2 = {
      id: 'prod2',
      name: 'Product 2',
      price: 15.99,
      image_url: 'test2.jpg'
    };

    act(() => {
      result.current.addItem(product1); // 25.99
      result.current.addItem(product2); // 15.99
      result.current.updateQuantity('prod1', 2); // 51.98
    });

    expect(result.current.getTotalPrice()).toBe(67.97);
  });

  it('calculates total items correctly', () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = {
      id: 'prod1',
      name: 'Product 1',
      price: 25.99,
      image_url: 'test1.jpg'
    };

    const product2 = {
      id: 'prod2',
      name: 'Product 2',
      price: 15.99,
      image_url: 'test2.jpg'
    };

    act(() => {
      result.current.addItem(product1); // 1 item
      result.current.addItem(product2); // 1 item
      result.current.updateQuantity('prod1', 3); // 3 items total for prod1
    });

    expect(result.current.getTotalItems()).toBe(4);
  });
});