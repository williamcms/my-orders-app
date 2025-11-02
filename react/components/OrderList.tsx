import React, { useEffect, useState } from 'react'
import type { EventName } from 'vtex.pixel-manager/react/PixelEventTypes'
import { useOrderItems } from 'vtex.order-items/OrderItems'
import { usePixel } from 'vtex.pixel-manager'
import axios from 'axios'

import type { OrderListItemWithDetails, OrderListResponse } from '../../node/types/orderList'
import { ChevronRightIcon, RefreshCwIcon, ImagePlaceholder } from './ui/svg'
import { adjustItemsForEvent } from '../utils/adjustItemsForEvent'
import type { OrderItem } from '../../node/types/orderDetails'
import { getTrackingNumber } from '../utils/getTrackingNumber'
import { formatCurrency, formatDate } from '../utils/formats'
import { Card, CardContent, CardHeader } from './ui/card'
import type { ErrorResponse, MyPageProps } from '../types'
import { getOrderStatus } from '../utils/getOrderStatus'
import { CancellationModal } from './CancellationModal'
import { Skeleton } from './ui/skeleton'
import { Tooltip } from './ui/tooltip'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

import styles from '../styles/index.module.css'

type Props = {
  _empty?: unknown
} & Pick<MyPageProps, 'history'>

const OrderList = ({ history }: Props) => {
  const { push } = usePixel()
  const { addItems } = useOrderItems()

  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderListResponse | undefined>()
  const [error, setError] = useState<ErrorResponse>()
  const [retry, setRetry] = useState<unknown>()
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([])

  useEffect(() => {
    axios
      .get<OrderListResponse>('/_v/private/listOrders', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then((response) => {
        setLoading(false)
        setOrders(response.data)
      })
      .catch((e: ErrorResponse) => {
        console.error('Error fetching order:', e)
        setLoading(false)
        setError(e)
      })

    console.info('Retry used to re-fetch orders:', { retry })
  }, [retry])

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter((id) => id !== orderId))
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId])
    }
  }

  const isOrderExpanded = (order: OrderListItemWithDetails, index: number): boolean => {
    return index < 3 || expandedOrderIds.includes(order.orderId)
  }

  const addToCart = (items: OrderItem[] | undefined) => {
    if (!items || items.length === 0) return

    const mapItemsToAdd = () => {
      if (!items) {
        return []
      }

      const list = items
        .map((item) => {
          if (!item) {
            return undefined
          }

          return {
            id: item.id,
            seller: item.seller,
            quantity: item.quantity,
          }
        })
        .filter((item): item is { id: string; seller: string; quantity: number } => item !== undefined)

      return list
    }

    const productToAdd = mapItemsToAdd()

    addItems(productToAdd)

    const pixelEventItems = items.map((product) => adjustItemsForEvent(product, product.quantity))

    push({
      event: 'addToCart',
      items: pixelEventItems,
    })

    push({
      event: 'openMinicart' as EventName,
      items: pixelEventItems,
    })
  }

  if (error && !orders && !loading) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>Erro ao carregar a lista de pedidos</h2>
        <span className={styles.errorMessage}>{error.message}</span>

        <Button
          variant="default"
          onClick={() => {
            setRetry(Date.now() + Math.random())
            setLoading(true)
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div>
      {loading ? (
        <div className={styles.ordersList}>
          {Array.from({ length: Math.floor(Math.random() * 5) + 4 }).map((_, i) => (
            <Card key={i} className={`${styles.card} ${i >= 3 ? styles.orderCardClickable : ''}`} data-id={i}>
              <CardHeader className={styles.orderCardHeader}>
                <div className={styles.orderHeaderContent}>
                  <div className={styles.orderHeaderItem}>
                    <div className={styles.orderHeaderLabel}>
                      <Skeleton style={{ width: '9.75rem', height: '0.875rem' }} />
                    </div>
                    <div className={styles.orderHeaderValue}>
                      <Skeleton style={{ width: '9.75rem', height: '1.125rem' }} />
                    </div>
                  </div>
                  <div className={styles.orderHeaderItem}>
                    <div className={styles.orderHeaderLabel}>
                      <Skeleton style={{ width: '4.625rem', height: '0.875rem' }} />
                    </div>
                    <div className={styles.orderHeaderValue}>
                      <Skeleton style={{ width: '4.625rem', height: '1.125rem' }} />
                    </div>
                  </div>
                  <div className={styles.orderHeaderItem}>
                    <div className={styles.orderHeaderLabel}>
                      <Skeleton style={{ width: '9.9375rem', height: '0.875rem' }} />
                    </div>
                    <div className={styles.orderHeaderValue}>
                      <Skeleton style={{ width: '9.9375rem', height: '1.125rem' }} />
                    </div>
                  </div>
                  <Skeleton style={{ width: '5.5625rem', height: '1.25rem' }} />
                </div>
              </CardHeader>

              {i < 3 && (
                <CardContent className={styles.cardContent}>
                  <div className={styles.orderDetails}>
                    <div className={styles.orderShipping}>
                      <Skeleton style={{ width: '5.5625rem', height: '1rem' }} />

                      <div className={styles.smallText}>
                        <Skeleton style={{ width: '5.5625rem', height: '1rem' }} />
                      </div>
                    </div>

                    <div className={styles.orderItems}>
                      {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((__, j) => (
                        <div key={j} className={styles.orderItem}>
                          <div className={styles.orderItemImage}>
                            <Skeleton style={{ width: '4rem', height: '4rem' }} />
                          </div>
                          <div className={styles.orderItemDetails}>
                            <div className={styles.itemName}>
                              <Skeleton style={{ width: '60%', height: '1.125rem' }} />
                            </div>
                            <div className={styles.itemPrice}>
                              <Skeleton style={{ width: '6.0625rem', height: '1rem' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderActions}>
                      <Skeleton style={{ width: '10.75rem', height: '2.5rem' }} />
                      <Skeleton style={{ width: '10.75rem', height: '2.5rem' }} />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders?.list.map((order, index) => {
            if (!('details' in order)) return null

            const trackinInfo = getTrackingNumber(order)
            const orderStatus = getOrderStatus(order)

            return (
              <Card key={order.orderId} className={`${styles.card} ${index >= 3 ? styles.orderCardClickable : ''}`}>
                <CardHeader
                  className={styles.orderCardHeader}
                  onClick={() => index >= 3 && toggleOrderExpansion(order.orderId)}
                >
                  <div className={styles.orderHeaderContent}>
                    <div className={styles.orderHeaderItem} style={{ minWidth: '12.5rem' }}>
                      <div className={styles.orderHeaderLabel}>DATA DO PEDIDO</div>
                      <div className={styles.orderHeaderValue}>{formatDate(order.creationDate)}</div>
                    </div>
                    <div className={styles.orderHeaderItem}>
                      <Tooltip label={order.paymentNames}>
                        <div className={styles.orderHeaderLabel}>TOTAL</div>
                        <div className={styles.orderHeaderValue}>R$ {formatCurrency(order.totalValue)}</div>
                      </Tooltip>
                    </div>
                    <div className={styles.orderHeaderItem}>
                      <div className={styles.orderHeaderLabel}>NÚMERO DO PEDIDO</div>
                      <div className={styles.orderHeaderValue}>#{order.orderId}</div>
                    </div>
                    <Tooltip label={orderStatus.tooltip}>
                      <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
                    </Tooltip>
                    <ChevronRightIcon
                      className={styles.chevronIcon}
                      style={{ transform: !isOrderExpanded(order, index) ? 'initial' : 'rotate(-90deg)' }}
                    />
                  </div>
                </CardHeader>

                {isOrderExpanded(order, index) && (
                  <CardContent className={styles.orderCardContent}>
                    <div className={styles.orderDetails}>
                      <div className={styles.orderShipping}>
                        <div className={styles.textMuted}>
                          {order.ShippingEstimatedDateMax &&
                            `Entrega até ${formatDate(order.ShippingEstimatedDateMax, '2-digit')}`}
                        </div>
                        {Boolean(trackinInfo.length) && (
                          <div className={styles.smallText}>
                            <span className={styles.textMuted}>Número de rastreio: </span>
                            {trackinInfo.map(({ trackingNumber, trackingUrl }) => {
                              if (trackingUrl) {
                                return (
                                  <Button
                                    className={styles.trackingNumber}
                                    to={trackingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    variant="outline"
                                    isLink
                                    key={trackingNumber}
                                  >
                                    {trackingNumber}
                                  </Button>
                                )
                              }

                              return (
                                <Button className={styles.trackingNumber} variant="outline" key={trackingNumber}>
                                  {trackingNumber}
                                </Button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div className={styles.orderItems}>
                        {order.details?.items.map((item) => (
                          <div key={item.id} className={styles.orderItem}>
                            <div className={styles.orderItemImage}>
                              {imageError ? (
                                <div className={styles.imagePlaceholder}>
                                  <ImagePlaceholder />
                                </div>
                              ) : (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className={styles.itemImage}
                                  onError={() => setImageError(true)}
                                />
                              )}
                            </div>
                            <div className={styles.orderItemDetails}>
                              <div className={styles.itemName}>{item.name}</div>
                              <div className={styles.itemPrice}>
                                {item.quantity} un · R$ {formatCurrency(item.sellingPrice)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderActions}>
                        <Button variant="outline" onClick={() => addToCart(order.details?.items)}>
                          <RefreshCwIcon className={styles.icon_marginRight} />
                          Pedir novamente
                        </Button>
                        <Button variant="outline" onClick={() => history.push(`/myOrders/${order.orderId}`)}>
                          Ver detalhes do pedido
                        </Button>
                        <CancellationModal
                          orderId={order.orderId}
                          shouldShow={order.details?.allowCancellation}
                          history={order?.details?.cancellationRequests}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { OrderList }
