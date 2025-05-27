import React from 'react'

import styles from '../styles/index.module.css'

type ConnectorResponsesProps = {
  responses: Record<string, unknown>
}

export const ConnectorResponses = ({ responses }: ConnectorResponsesProps) => {
  return (
    <>
      {Object.entries(responses).map(
        ([key, value]) =>
          value && (
            <div key={key} className={`${styles.textMuted} ${styles.connectorMessage}`}>
              {key}: {value}
            </div>
          )
      )}
    </>
  )
}
