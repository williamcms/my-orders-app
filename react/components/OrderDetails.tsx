import React, { useEffect, useState } from 'react'
import axios from 'axios'

import type { MyPageProps } from '../types'
import type { OrderListItemWithDetails, OrderListResponse } from '../../node/types/orderList'
import { Button } from './ui/button'
import { formatAddress, formatCurrency, formatDate } from '../utils/formats'
import { Badge } from './ui/badge'
import { CardHeader, CardContent, Card } from './ui/card'
import { PackageIcon } from './ui/svg'
import { Skeleton } from './ui/skeleton'
import { getPaymentMethodName } from '../utils/getPaymentMethodName'
import styles from '../styles/index.module.css'
import { Tooltip } from './ui/tooltip'

type Props = {} & Pick<MyPageProps, 'match'>

const OrderDetails = ({ match }: Props) => {
  const {
    params: { orderId },
  } = match

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<OrderListItemWithDetails | undefined>()

  useEffect(() => {
    axios
      .get<OrderListResponse>(`/_v/private/getOrderDetails/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then((response) => {
        setLoading(false)
        setOrder(response.data?.list?.[0] ?? {})
        console.log({ response })
      })
      .catch((error) => {
        console.error('Error fetching order:', error)
      })

    console.log({ orderId, loading, order })
  }, [])

  if (!loading) {
    return (
      <div className={styles.container}>
        <div className={styles.orderDetailsGrid}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.375rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.cardInnerContent}>
                <Skeleton style={{ width: '70%', height: '1.125rem' }} />
                <Skeleton style={{ width: '100%', height: '2.875rem' }} />
              </div>
            </CardContent>
          </Card>

          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.375rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.paymentContent}>
                <Skeleton style={{ width: '100%', height: '4.5rem' }} />
              </div>
            </CardContent>
          </Card>

          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.375rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.paymentDetails}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton style={{ width: '100%', height: '1.5625rem' }} key={i} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`${styles.card} ${styles.fullLine}`}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.375rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.orderSummaryContent}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton style={{ width: '100%', height: '1.5625rem' }} key={i} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`${styles.card} ${styles.fullLine}`}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.5rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <Skeleton style={{ width: '100%', height: '27.1875rem' }} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) {
    return <></>
  }

  return (
    <div className={styles.container}>
      <div className={styles.orderDetailsGrid}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Endereço de Entrega</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.cardInnerContent}>
              <div className={styles.addressName}>{order.details?.shippingData.address.receiverName}</div>
              <div className={styles.addressDetails}>{formatAddress(order.details?.shippingData.address)}</div>
              {order.details?.shippingData.address.reference && (
                <div className={styles.textMuted}>Referência: {order.details?.shippingData.address.reference}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Forma de Pagamento</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.paymentContent}>
              {order.details?.paymentData.transactions.map((transaction) =>
                transaction.payments.map((payment) => (
                  <div key={payment.id} className={styles.cardInnerContent}>
                    <div className={styles.paymentName}>
                      {getPaymentMethodName(payment.paymentSystemName, payment.group)}
                    </div>
                    <div className={styles.paymentDetails}>
                      {payment.paymentSystemName === 'Vale' && (
                        <div className={styles.textMuted}>{payment.redemptionCode}</div>
                      )}
                      {payment.firstDigits && payment.lastDigits && (
                        <div className={styles.textMuted}>**** **** **** {payment.lastDigits}</div>
                      )}
                      {payment.installments > 1 && (
                        <div className={styles.textMuted}>
                          {payment.installments}x de R$ {formatCurrency(payment.value / payment.installments)}
                        </div>
                      )}
                      <div className={styles.totalValue}>R$ {formatCurrency(payment.value)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Detalhamento de Preços</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.orderSummaryContent}>
              {order.details?.totals.map((total) => (
                <div key={total.id} className={styles.summaryItem}>
                  <span className={styles.textMuted}>{total.name}:</span>
                  <span className={styles.summaryValue}>R$ {formatCurrency(total.value)}</span>
                </div>
              ))}
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>Total:</span>
                <span className={styles.totalValue}>R$ {formatCurrency(order.details?.value)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${styles.card} ${styles.fullLine}`}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Resumo do Pedido</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.orderSummaryContent}>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>Data do pedido:</span>
                <span className={styles.summaryValue}>{formatDate(order.creationDate, '2-digit')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>Última atualização:</span>
                <span className={styles.summaryValue}>{formatDate(order.details?.lastChange, '2-digit')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>Total de itens:</span>
                <span className={styles.summaryValue}>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>Valor total:</span>
                <span className={styles.totalValue}>R$ {formatCurrency(order.details?.value)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${styles.card} ${styles.fullLine}`}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitleWithIcon}>
              <PackageIcon className={styles.icon_marginRight} />
              <h2 className={styles.cardTitle}>Pacotes de Entrega</h2>
            </div>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.packagesList}>
              {order.details?.packageAttachment.packages.map((packageItem, index) => (
                <div key={index} className={styles.packageItem}>
                  <div className={styles.packageHeader}>
                    <h3 className={styles.packageTitle}>Pacote {index + 1}</h3>
                    <Badge variant="outline">{packageItem.courier || 'Transportadora'}</Badge>
                  </div>

                  <div className={styles.packageDetails}>
                    <div className={styles.packageInfo}>
                      <Tooltip label={packageItem.invoiceKey}>
                        <div className={styles.packageInfoItem}>
                          <span className={styles.textMuted}>Nota fiscal:</span>
                          <span>{packageItem.invoiceNumber}</span>
                        </div>
                      </Tooltip>
                      {packageItem.trackingNumber && (
                        <div className={styles.packageInfoItem}>
                          <span className={styles.textMuted}>Rastreamento:</span>
                          <span>{packageItem.trackingNumber}</span>
                        </div>
                      )}
                      <div className={styles.packageInfoItem}>
                        <span className={styles.textMuted}>Data de emissão:</span>
                        <span>{formatDate(packageItem.issuanceDate)}</span>
                      </div>
                      <div className={styles.packageInfoItem}>
                        <span className={styles.textMuted}>Valor da nota:</span>
                        <span>R$ {formatCurrency(packageItem.invoiceValue)}</span>
                      </div>
                    </div>

                    <div className={styles.packageItems}>
                      <h4 className={styles.packageItemsTitle}>Itens neste pacote:</h4>
                      {packageItem.items.map((packageItem) => {
                        return (
                          <div key={packageItem.itemIndex} className={styles.packageItemDetail}>
                            <span>{packageItem.description}</span>
                            <span className={styles.textMuted}>Qtd: {packageItem.quantity}</span>
                            <span className={styles.textMuted}>R$ {formatCurrency(packageItem.price)}</span>
                          </div>
                        )
                      })}
                    </div>

                    {packageItem.courierStatus?.data && packageItem.courierStatus?.data.length > 0 && (
                      <div className={styles.trackingStatus}>
                        <h4 className={styles.trackingTitle}>Status de rastreamento:</h4>
                        <div className={styles.trackingEvent}>
                          <div className={styles.trackingDescription}>
                            {packageItem.courierStatus?.data?.[0].description}
                          </div>
                          <div className={styles.textMuted}>
                            {packageItem.courierStatus?.data?.[0].city}, {packageItem.courierStatus?.data?.[0].state} -{' '}
                            {formatDate(packageItem.courierStatus?.data?.[0].lastChange)}
                          </div>
                        </div>
                      </div>
                    )}

                    {packageItem.trackingUrl && (
                      <div className={styles.packageActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          to={packageItem.trackingUrl}
                          rel="noopener noreferrer"
                          isLink
                        >
                          Rastrear Pacote
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { OrderDetails }
