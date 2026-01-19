interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
}) => (
  <div
    className={`bg-white rounded-lg border border-slate-200 shadow-elegant ${
      hover ? 'hover:shadow-lg hover:border-slate-300 transition-all' : ''
    } ${className}`}
  >
    {children}
  </div>
)

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="ml-4">{action}</div>}
  </div>
)

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
)

interface CardFooterProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  align = 'between',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div className={`px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3 ${alignClasses[align]}`}>
      {children}
    </div>
  )
}
