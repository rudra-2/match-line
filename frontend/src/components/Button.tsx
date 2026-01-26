import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold tracking-wide
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `

    const variants = {
        primary: `
      skeuo-button-primary
      text-white
      focus:ring-[var(--color-accent-primary)]
    `,
        secondary: `
      skeuo-button
      text-[var(--color-ink-primary)]
      hover:bg-[var(--color-surface-raised)]
      focus:ring-[var(--color-ink-muted)]
    `,
        ghost: `
      bg-transparent
      text-[var(--color-ink-secondary)]
      hover:bg-[var(--color-surface-sunken)]
      hover:text-[var(--color-ink-primary)]
      border border-transparent
      focus:ring-[var(--color-ink-muted)]
    `,
        danger: `
      bg-[var(--color-error)]
      border border-[#8a3030]
      text-white
      box-shadow: 0 1px 2px var(--shadow-color), inset 0 1px 0 rgba(255,255,255,0.2)
      hover:bg-[#943535]
      focus:ring-[var(--color-error)]
    `,
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-5 py-2.5 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-xl',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className="w-4 h-4">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="w-4 h-4">{rightIcon}</span>}
                </>
            )}
        </button>
    )
}

// Icon Button - circular
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'secondary' | 'ghost'
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    size = 'md',
    variant = 'secondary',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    }

    const variants = {
        primary: 'skeuo-button-primary text-white',
        secondary: 'skeuo-button text-[var(--color-ink-primary)]',
        ghost: 'bg-transparent hover:bg-[var(--color-surface-sunken)] text-[var(--color-ink-secondary)]',
    }

    return (
        <button
            className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-primary)]
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {icon}
        </button>
    )
}

// Button Group
interface ButtonGroupProps {
    children: React.ReactNode
    className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
    children,
    className = '',
}) => {
    return (
        <div
            className={`
        inline-flex rounded-lg overflow-hidden
        border border-[var(--border-medium)]
        skeuo-button
        ${className}
      `}
        >
            {React.Children.map(children, (child, index) => (
                <div
                    className={`
            ${index > 0 ? 'border-l border-[var(--border-medium)]' : ''}
          `}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}
