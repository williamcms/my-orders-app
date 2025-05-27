import React from 'react'
import styles from '../../styles/index.module.css'

interface Props {
  label?: string | null
}

export const Tooltip = ({ children, label }: React.PropsWithChildren<Props>) => {
  if (!label) return <div>{children}</div>

  return (
    <div className={styles.tooltip}>
      <span
        className={`${styles.tooltip_textElement} absolute pv3 ph4 bg-base--inverted c-on-base--inverted br2 shadow-4 mw5 overflow-hidden t-small`}
      >
        {label}
      </span>
      {children}
    </div>
  )
}
