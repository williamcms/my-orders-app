import React from 'react'

import styles from '../styles/index.module.css'
import { Button } from './ui/button'

const Footer = () => {
  return (
    <div className={styles.viewAllContainer}>
      <Button variant="orange" className={styles.viewAllButton} to="{{link}}" target="_blank" rel="noreferrer" isLink>
        Ver todos os pedidos
      </Button>
    </div>
  )
}

export { Footer }
