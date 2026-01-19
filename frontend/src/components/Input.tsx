interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random()}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  )
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  id,
  ...props
}) => {
  const textAreaId = id || `textarea-${Math.random()}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textAreaId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textAreaId}
        className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  )
}
