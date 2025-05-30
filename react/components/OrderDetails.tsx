import React, { useEffect, useState } from 'react'
import axios from 'axios'

import type { MyPageProps } from '../types'
import type { OrderListItemWithDetails, OrderListResponse } from '../../node/types/orderList'
import { Button } from './ui/button'
import { formatAddress, formatCurrency, formatDate, formatShippingEstimate } from '../utils/formats'
import { Badge } from './ui/badge'
import { CardHeader, CardContent, Card } from './ui/card'
import { CalendarIcon, ClockIcon, CopyIcon, PackageIcon, PhoneIcon, StoreIcon } from './ui/svg'
import { Skeleton } from './ui/skeleton'
import { getPaymentMethodName } from '../utils/getPaymentMethodName'
import { Tooltip } from './ui/tooltip'
import { getOrderStatus } from '../utils/getOrderStatus'
import { ConnectorResponses } from './ConnectorResponses'
import { extractPhoneNumber } from '../utils/getPhoneNumber'
import { CancellationModal } from './CancellationModal'
import styles from '../styles/index.module.css'
import { getPickupItems } from '../utils/getPickupItems'

type Props = {
  _notUsed?: null
} & Pick<MyPageProps, 'match'>

const OrderDetails = ({ match }: Props) => {
  const {
    params: { orderId },
  } = match

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<OrderListItemWithDetails | undefined>()

  const hasShippingAddress =
    (
      order?.details?.shippingData?.availableAddresses.filter((address) => {
        return address.addressType !== 'pickup'
      }) ?? []
    )?.length > 0

  const packageList = order?.details?.packageAttachment.packages ?? []
  const pickupItems = getPickupItems(order?.details?.shippingData?.logisticsInfo)
  const orderStatus = getOrderStatus(order)

  const hasShipping = hasShippingAddress && packageList.length > 0

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
      })
      .catch((error) => {
        console.error('Error fetching order:', error)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.orderDetailsGrid}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.375rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContentGrid}>
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
            <CardContent className={styles.cardContentGrid}>
              <div className={styles.paymentContent}>
                <Skeleton style={{ width: '100%', height: '4.5rem' }} />
              </div>
            </CardContent>
          </Card>

          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <Skeleton style={{ width: '100%', height: '1.375rem' }} />
            </CardHeader>
            <CardContent className={styles.cardContentGrid}>
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
                {Array.from({ length: 5 }).map((_, i) => (
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

  console.log({ order })

  return (
    <div className={styles.container}>
      {order?.orderId && (
        <div className={styles.headerContainer}>
          <div className={styles.headerInfo}>
            <span className={styles.orderSubtitle}>{formatDate(order.creationDate, 'long')}</span>
            <span> • </span>
            <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
          </div>
          <CancellationModal allowCancellation={order.details?.allowCancellation} orderId={order?.orderId} />
        </div>
      )}
      <div className={styles.orderDetailsGrid}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Endereço</h2>
          </CardHeader>
          <CardContent className={styles.cardContentGrid}>
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
          <CardContent className={styles.cardContentGrid}>
            <div className={styles.paymentContent}>
              {order.details?.paymentData.transactions.map((transaction) =>
                transaction.payments.map((payment) => (
                  <div key={payment.id} className={styles.cardInnerContent}>
                    <div className={styles.paymentName}>
                      {getPaymentMethodName(payment.paymentSystemName, payment.group)}

                      {payment.paymentSystemName === 'Boleto Bancário' && payment.url && (
                        <div className={styles.textMuted}>
                          <Tooltip label="O link pode não estar mais disponível">
                            <Button
                              variant="link"
                              size="sm"
                              to={payment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              isLink
                            >
                              (ver)
                            </Button>
                          </Tooltip>
                        </div>
                      )}
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

                      {Object.entries(payment.connectorResponses).length > 0 && (
                        <details className={styles.additionalInfo}>
                          <summary className={`${styles.textMuted} ${styles.additionalInfoToggle}`}>
                            Informações adicionais
                          </summary>
                          <ConnectorResponses responses={payment.connectorResponses} />
                        </details>
                      )}
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
          <CardContent className={styles.cardContentGrid}>
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
                <span className={styles.textMuted}>Status:</span>
                <span className={styles.summaryValue}>{orderStatus.label}</span>
              </div>
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

        {pickupItems.length > 0 && (
          <Card className={`${styles.card} ${styles.fullLine}`}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.cardTitleWithIcon}>
                <StoreIcon className={styles.icon_marginRight} />
                <h2 className={styles.cardTitle}>Itens para Retirada</h2>
              </div>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.packagesList}>
                {pickupItems.map((pickupItem, index) => {
                  const items = pickupItem.items
                    .map((pickupOrderItem: { itemId: string }) =>
                      order?.details?.items.find((i) => i.id === pickupOrderItem.itemId)
                    )
                    .filter(Boolean)

                  const storeInfo = pickupItem.pickupStoreInfo
                  const phoneNumber = extractPhoneNumber(storeInfo.address?.complement)

                  return (
                    <div key={index} className={styles.packageItem}>
                      <div className={styles.packageHeader}>
                        <h3 className={styles.packageTitle}>{storeInfo.friendlyName ?? 'Loja para Retirada'}</h3>
                        <Badge variant="success">Retirada na Loja</Badge>
                      </div>

                      <div className={styles.packageDetails}>
                        <div className={styles.packageInfo}>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>Endereço:</span>
                            <span>
                              {storeInfo.address
                                ? `${storeInfo.address.street}, ${storeInfo.address.number}, ${storeInfo.address.neighborhood}`
                                : 'Endereço não disponível'}
                            </span>
                          </div>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>Cidade/Estado:</span>
                            <span>
                              {storeInfo.address
                                ? `${storeInfo.address.city} - ${storeInfo.address.state}`
                                : 'Localização não disponível'}
                            </span>
                          </div>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>Prazo de retirada:</span>
                            <span>
                              {pickupItem.shippingEstimate
                                ? formatShippingEstimate(pickupItem.shippingEstimate)
                                : 'Não disponível'}
                            </span>
                          </div>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>Contato:</span>
                            <span>{phoneNumber ?? 'Não disponível'}</span>
                          </div>
                          <div className={`${styles.packageInfoItem} ${styles.fullLine}`}>
                            <span className={styles.textMuted}>Complemento:</span>
                            <span>{storeInfo.address?.complement ?? 'Não disponível'}</span>
                          </div>

                          {storeInfo.additionalInfo && (
                            <div className={`${styles.packageInfoItem} ${styles.fullLine}`}>
                              <span className={styles.textMuted}>Informações adicionais:</span>
                              <span>{storeInfo.additionalInfo}</span>
                            </div>
                          )}
                        </div>

                        <div className={styles.packageItems}>
                          <h4 className={styles.packageItemsTitle}>Itens para retirada:</h4>

                          {items.map((item) => (
                            <div className={styles.packageItemDetail} key={item?.name}>
                              <span>{item?.name}</span>
                              <span className={styles.textMuted}>Qtd: {item?.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className={styles.pickupCodeSection}>
                          <h4 className={styles.pickupCodeTitle}>Código para retirada:</h4>
                          <div className={styles.pickupCodeContainer}>
                            {order.pickupOnStoreCode ? (
                              <div className={styles.pickupCodeDisplay}>
                                <div className={styles.pickupCodeValue}>
                                  <span className={styles.pickupCodeText}>{order.pickupOnStoreCode}</span>
                                  <Button
                                    variant="iconOnly"
                                    className={styles.pickupCodeCopyButton}
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.pickupOnStoreCode!)
                                    }}
                                    title="Copiar código"
                                  >
                                    <CopyIcon />
                                  </Button>
                                </div>
                                <p className={styles.pickupCodeInstructions}>
                                  Apresente este código na loja para retirar seus produtos.
                                </p>
                              </div>
                            ) : (
                              <div className={styles.pickupCodePending}>
                                <div className={styles.pickupCodePendingIcon}>
                                  <ClockIcon />
                                </div>
                                <div className={styles.pickupCodePendingText}>
                                  <p className={styles.pickupCodePendingTitle}>Código em preparação</p>
                                  <p className={styles.pickupCodePendingDescription}>
                                    Você receberá um e-mail com o código assim que os produtos estiverem disponíveis
                                    para retirada.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {pickupItem.shippingEstimateDate && (
                          <div className={styles.trackingStatus}>
                            {order.details?.cancellationData ? (
                              <>
                                <h4 className={styles.trackingTitle}>Pedido cancelado</h4>
                                <div className={styles.trackingEventCancelled}>
                                  <div className={styles.trackingDescription}>
                                    <div className="flex items-center">
                                      <CalendarIcon className={styles.icon_marginRight} />
                                      <span>
                                        Cancelado em {formatDate(order.details.cancellationData.CancellationDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={styles.smallText}>
                                    Este pedido foi cancelado e não estará mais disponível para entrega ou retirada.
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <h4 className={styles.trackingTitle}>Disponível para retirada:</h4>
                                <div className={styles.trackingEvent}>
                                  <div className={styles.trackingDescription}>
                                    <div className="flex items-center">
                                      <CalendarIcon className={styles.icon_marginRight} />
                                      <span>Disponível a partir de {formatDate(pickupItem.shippingEstimateDate)}</span>
                                    </div>
                                  </div>
                                  <div className={styles.smallText}>
                                    Assim que o pedido estiver disponível para retirada, você receberá um e-mail com o
                                    código necessário.
                                    <br />O código também será exibido na seção acima.
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        <div className={styles.packageActions}>
                          {storeInfo.address?.geoCoordinates && (
                            <Button
                              variant="outline"
                              size="sm"
                              to={`https://www.google.com/maps/search/?api=1&query=${storeInfo.address.geoCoordinates[1]},${storeInfo.address.geoCoordinates[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              isLink
                            >
                              Ver no Mapa
                            </Button>
                          )}
                          {phoneNumber && (
                            <Button variant="outline" size="sm" to={`tel:${phoneNumber}`} isLink>
                              <PhoneIcon className={styles.icon_marginRight} />
                              Ligar para Loja
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {hasShipping && (
          <Card className={`${styles.card} ${styles.fullLine}`}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.cardTitleWithIcon}>
                <PackageIcon className={styles.icon_marginRight} />
                <h2 className={styles.cardTitle}>Pacotes de Entrega</h2>
              </div>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.packagesList}>
                {packageList.map((packageMain, index) => (
                  <div key={index} className={styles.packageItem}>
                    <div className={styles.packageHeader}>
                      <h3 className={styles.packageTitle}>Pacote {index + 1}</h3>
                      <Badge variant="outline">{packageMain.courier ?? 'Transportadora'}</Badge>
                    </div>

                    <div className={styles.packageDetails}>
                      <div className={styles.packageInfo}>
                        <Tooltip label={packageMain.invoiceKey}>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>Nota fiscal:</span>
                            <span>{packageMain.invoiceNumber}</span>
                          </div>
                        </Tooltip>
                        {packageMain.trackingNumber && (
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>Rastreamento:</span>
                            <span>{packageMain.trackingNumber}</span>
                          </div>
                        )}
                        <div className={styles.packageInfoItem}>
                          <span className={styles.textMuted}>Data de emissão:</span>
                          <span>{formatDate(packageMain.issuanceDate)}</span>
                        </div>
                        <div className={styles.packageInfoItem}>
                          <span className={styles.textMuted}>Valor da nota:</span>
                          <span>R$ {formatCurrency(packageMain.invoiceValue)}</span>
                        </div>
                      </div>

                      <div className={styles.packageItems}>
                        <h4 className={styles.packageItemsTitle}>Itens neste pacote:</h4>
                        {packageMain.items.map((packageItem) => {
                          return (
                            <div key={packageItem.itemIndex} className={styles.packageItemDetail}>
                              <span>{packageItem.description}</span>
                              <span className={styles.textMuted}>Qtd: {packageItem.quantity}</span>
                              <span className={styles.textMuted}>R$ {formatCurrency(packageItem.price)}</span>
                            </div>
                          )
                        })}
                      </div>

                      {packageMain.courierStatus?.data && packageMain.courierStatus?.data.length > 0 && (
                        <div className={styles.trackingStatus}>
                          <h4 className={styles.trackingTitle}>Status de rastreamento:</h4>
                          <div className={styles.trackingEvent}>
                            <div className={styles.trackingDescription}>
                              {packageMain.courierStatus?.data?.[0].description}
                            </div>
                            <div className={styles.textMuted}>
                              {packageMain.courierStatus?.data?.[0].city}, {packageMain.courierStatus?.data?.[0].state}
                              {' - '}
                              {formatDate(packageMain.courierStatus?.data?.[0].lastChange)}
                            </div>
                          </div>
                        </div>
                      )}

                      {packageMain.trackingUrl && (
                        <div className={styles.packageActions}>
                          <Button
                            variant="outline"
                            size="sm"
                            to={packageMain.trackingUrl}
                            target="_blank"
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
        )}

        <Card className={`${styles.card} ${styles.fullLine}`}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Lista de Produtos</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.itemsList}>
              {order.details?.items.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.orderItemImage}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={styles.itemImage}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          'https://{{account}}.vtexassets.com/_v/public/assets/v1/published/vtex.my-orders-app@3.25.3/public/react/2ea7751cc60e35056a078060add977c2.svg'
                      }}
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemInfoCol}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.textMuted}>SKU: {item.refId ?? item.sellerSku}</div>
                      <div className={styles.textMuted}>Quantidade: {item.quantity}</div>
                    </div>
                    <div className={styles.itemInfoCol}>
                      <div className={styles.itemPrice}>R$ {formatCurrency(item.sellingPrice * item.quantity)}</div>
                      <div className={styles.textMuted}>R$ {formatCurrency(item.sellingPrice)} un.</div>
                    </div>
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
