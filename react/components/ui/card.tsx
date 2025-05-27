import React from 'react'
import styles from '../../styles/index.module.css'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`${styles.card} ${className}`} {...props} />
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`${styles.cardHeader} ${className}`} {...props} />
  }
)

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => {
    return <h3 ref={ref} className={`${styles.cardTitle} ${className}`} {...props} />
  }
)

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => {
    return <p ref={ref} className={`${styles.cardDescription} ${className}`} {...props} />
  }
)

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`${styles.cardContent} ${className}`} {...props} />
  }
)

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`${styles.cardFooter} ${className}`} {...props} />
  }
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
