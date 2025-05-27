import React from 'react'
import styles from '../../styles/index.module.css'
import { Link } from 'vtex.render-runtime'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'orange' | 'success' | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLink?: boolean
  to?: string
  target?: string
  rel?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', isLink = undefined, children, ...props }, ref) => {
    let sizeClass = ''

    if (size === 'sm') sizeClass = styles.button_sm
    else if (size === 'lg') sizeClass = styles.button_lg
    else if (size === 'icon') sizeClass = styles.buttonIcon

    const classes = `${styles.button} ${
      styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] || ''
    } ${sizeClass} ${className}`

    if (isLink) {
      return (
        <Link to={props?.to} target={props?.target} rel={props?.rel}>
          <span className={classes} ref={ref as React.Ref<HTMLSpanElement>} {...props}>
            {children}
          </span>
        </Link>
      )
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
