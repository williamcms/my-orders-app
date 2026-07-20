import React, { useState } from 'react'

import styles from '../../styles/index.module.css'
import { Skeleton } from './skeleton'
import { ImagePlaceholder } from './svg'

interface Props {
  src?: string
  alt: string
  className?: string
}

/** Shows a skeleton while the image loads and a placeholder when it is missing or fails */
function ProductImage({ src, alt, className = '' }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={styles.imagePlaceholder}>
        <ImagePlaceholder />
      </div>
    )
  }

  return (
    <>
      {!loaded && <Skeleton className={styles.productImageSkeleton} />}
      <img
        src={src}
        alt={alt}
        className={className}
        style={loaded ? undefined : { display: 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  )
}

export { ProductImage }
