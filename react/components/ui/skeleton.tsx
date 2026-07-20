import React from 'react'

import styles from '../../styles/index.module.css'

function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.skeleton} ${className}`} {...props} />
}

export { Skeleton }
