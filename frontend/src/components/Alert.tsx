interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
}

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  onClose,
}) => {
  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✓',
      iconColor: 'text-green-600',
      text: 'text-green-900',
      title: 'text-green-900',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '✕',
      iconColor: 'text-red-600',
      text: 'text-red-900',
      title: 'text-red-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: '⚠',
      iconColor: 'text-yellow-600',
      text: 'text-yellow-900',
      title: 'text-yellow-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'ℹ',
      iconColor: 'text-blue-600',
      text: 'text-blue-900',
      title: 'text-blue-900',
    },
  }

  const style = variants[variant]

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex gap-4`}>
      <div className={`text-2xl ${style.iconColor} flex-shrink-0`}>
        {style.icon}
      </div>
      <div className="flex-1">
        {title && <p className={`font-semibold ${style.title}`}>{title}</p>}
        <p className={`text-sm ${style.text} ${title ? 'mt-1' : ''}`}>
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.text} hover:opacity-70`}
        >
          ✕
        </button>
      )}
    </div>
  )
}
