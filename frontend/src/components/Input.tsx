import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    helperText?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-semibold text-[var(--color-ink-primary)] skeuo-embossed">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`
            w-full skeuo-input
            px-4 py-3 text-[var(--color-ink-primary)]
            placeholder:text-[var(--color-ink-subtle)]
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon ? 'pr-12' : ''}
            ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : ''}
            ${className}
          `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]">
                        {rightIcon}
                    </div>
                )}
            </div>
            {(helperText || error) && (
                <p
                    className={`
            mt-2 text-sm
            ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-ink-muted)]'}
          `}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    helperText?: string
    error?: string
    notebook?: boolean
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    helperText,
    error,
    notebook = false,
    className = '',
    rows = 4,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-semibold text-[var(--color-ink-primary)] skeuo-embossed">
                    {label}
                </label>
            )}
            <textarea
                rows={rows}
                className={`
          w-full skeuo-input resize-none
          px-4 py-3 text-[var(--color-ink-primary)]
          placeholder:text-[var(--color-ink-subtle)]
          ${notebook ? 'skeuo-notebook' : ''}
          ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : ''}
          ${className}
        `}
                {...props}
            />
            {(helperText || error) && (
                <p
                    className={`
            mt-2 text-sm
            ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-ink-muted)]'}
          `}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    helperText?: string
    error?: string
    options: { value: string; label: string }[]
}

export const Select: React.FC<SelectProps> = ({
    label,
    helperText,
    error,
    options,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-semibold text-[var(--color-ink-primary)] skeuo-embossed">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`
            w-full skeuo-input appearance-none
            px-4 py-3 pr-10 text-[var(--color-ink-primary)]
            cursor-pointer
            ${error ? 'border-[var(--color-error)]' : ''}
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-ink-muted)]">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
            {(helperText || error) && (
                <p
                    className={`
            mt-2 text-sm
            ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-ink-muted)]'}
          `}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    className = '',
    ...props
}) => {
    return (
        <label className="inline-flex items-center gap-3 cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    className={`
            w-5 h-5 rounded
            skeuo-input cursor-pointer
            checked:bg-[var(--color-accent-primary)]
            checked:border-[var(--color-accent-primary-dark)]
            focus:ring-offset-2
            ${className}
          `}
                    {...props}
                />
            </div>
            <span className="text-sm text-[var(--color-ink-primary)] group-hover:text-[var(--color-ink-secondary)] transition-colors">
                {label}
            </span>
        </label>
    )
}

// Search Input with icon
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
    onSearch?: (value: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
    onSearch,
    ...props
}) => {
    return (
        <Input
            leftIcon={
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            }
            placeholder="Search..."
            {...props}
        />
    )
}
