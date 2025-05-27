import React from 'react'
import styles from '../../styles/index.module.css'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={`${styles.badge} ${
        styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] || ''
      } ${className}`}
      {...props}
    />
  )
}

export { Badge }
