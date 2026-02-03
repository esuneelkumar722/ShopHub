import { fireEvent, screen } from '../../renderWithProviders'
import { renderWithProviders } from '../../renderWithProviders'
import { DarkModeToggle } from '../../../components/ui/DarkModeToggle'
import { vi } from 'vitest'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Moon: ({ className }: { className?: string }) => <svg data-testid="moon-icon" className={className} />,
  Sun: ({ className }: { className?: string }) => <svg data-testid="sun-icon" className={className} />,
}))

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.removeItem('theme')
    document.documentElement.classList.remove('dark')
    vi.clearAllMocks()
  })

  it('renders with light theme by default', () => {
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    expect(button).toHaveAttribute('title', 'Switch to dark mode')

    // Should show moon icon for light theme
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument()
  })

  it('renders with dark theme when stored in localStorage', () => {
    localStorage.setItem('theme', 'dark')
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    expect(button).toHaveAttribute('title', 'Switch to light mode')

    // Should show sun icon for dark theme
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
  })

  it('toggles from light to dark theme', () => {
    localStorage.setItem('theme', 'light')
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')

    // Initial state
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Click to toggle
    fireEvent.click(button)

    // After toggle
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggles from dark to light theme', () => {
    localStorage.setItem('theme', 'dark')
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')

    // Initial state
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Click to toggle
    fireEvent.click(button)

    // After toggle
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('applies correct CSS classes', () => {
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'p-2',
      'rounded-lg',
      'hover:bg-gray-100',
      'dark:hover:bg-gray-800',
      'transition-colors',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-primary-500',
      'focus-visible:ring-offset-2'
    )
  })

  it('icons have correct CSS classes', () => {
    renderWithProviders(<DarkModeToggle />)

    const moonIcon = screen.getByTestId('moon-icon')
    expect(moonIcon).toHaveClass('w-5', 'h-5', 'text-gray-600', 'dark:text-gray-300')
  })

  it('updates document class and localStorage on toggle', () => {
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')

    // Start with light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')

    // Toggle to dark
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    // Toggle back to light
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('has proper keyboard accessibility', () => {
    renderWithProviders(<DarkModeToggle />)

    const button = screen.getByRole('button')

    // Should be focusable
    button.focus()
    expect(document.activeElement).toBe(button)

    // Should have proper ARIA attributes
    expect(button).toHaveAttribute('aria-label')
    expect(button).toHaveAttribute('title')

    // Test that button can be activated via keyboard (simulate click since buttons handle keyboard internally)
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
