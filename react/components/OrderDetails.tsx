import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import type { ApiResponse } from '../../node/types/api'
import type { OrderListItemWithDetails, OrderListResponse } from '../../node/types/orderList'
import styles from '../styles/index.module.css'
import type { MyPageProps } from '../types'
import {
  calculateDeliveryDate,
  convertShippingEstimateToMinutes,
  formatAddress,
  formatCurrency,
  formatDate,
  formatShippingEstimate,
} from '../utils/formats'
import { getCancellationText } from '../utils/getCancellationText'
import { getPickupItems } from '../utils/getItemsByDeliveryChannel'
import { getOrderStatus } from '../utils/getOrderStatus'
import { getPaymentMethodName } from '../utils/getPaymentMethodName'
import { extractPhoneNumber } from '../utils/getPhoneNumber'
import { CancellationModal } from './CancellationModal'
import { ConnectorResponses } from './ConnectorResponses'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { CalendarIcon, ClockIcon, CopyIcon, PackageIcon, PhoneIcon, StoreIcon } from './ui/svg'
import { Tooltip } from './ui/tooltip'

type Props = {
  _notUsed?: null
} & Pick<MyPageProps, 'match'>

const OrderDetails = ({ match }: Props) => {
  const {
    params: { orderId },
  } = match

  const intl = useIntl()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<OrderListItemWithDetails | undefined>()

  const hasShippingAddress =
    (
      order?.details?.shippingData?.availableAddresses.filter((address) => {
        return address.addressType !== 'pickup'
      }) ?? []
    )?.length > 0

  const packageList = order?.details?.packageAttachment.packages ?? []
  const pickupItems = getPickupItems(order?.details?.shippingData?.logisticsInfo, 'pickup-in-point')
  const deliveryItems = getPickupItems(order?.details?.shippingData?.logisticsInfo, 'delivery')
  const orderStatus = getOrderStatus(intl, order)

  const SLA_FALLBACK = '0bd'

  const maxDeliveryEstimate = deliveryItems.reduce((max, item) => {
    const maxMinutes = convertShippingEstimateToMinutes(max)
    const currentMinutes = convertShippingEstimateToMinutes(item.shippingEstimate)

    return currentMinutes > maxMinutes ? item.shippingEstimate : max
  }, deliveryItems[0]?.shippingEstimate || SLA_FALLBACK)

  const maxPickupEstimate = pickupItems.reduce((max, item) => {
    const maxMinutes = convertShippingEstimateToMinutes(max)
    const currentMinutes = convertShippingEstimateToMinutes(item.shippingEstimate)

    return currentMinutes > maxMinutes ? item.shippingEstimate : max
  }, pickupItems[0]?.shippingEstimate || SLA_FALLBACK)

  const maximumShippingEstimateDate = calculateDeliveryDate(
    order?.creationDate,
    maxDeliveryEstimate === SLA_FALLBACK ? maxPickupEstimate : maxDeliveryEstimate
  ).toISOString()

  const hasShipping = hasShippingAddress && packageList.length > 0
  const isCancellationRequest = order?.status === 'cancellation-requested'

  useEffect(() => {
    axios
      .get<ApiResponse<OrderListResponse>>(`/_v/private/getOrderDetails/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then((response) => {
        setLoading(false)
        setOrder(response.data.data?.list?.[0] ?? {})
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

  const CancellationMessage = () => {
    if (!order?.details?.cancellationData) return null

    let titleId = 'store/my-orders-app.cancellation.cancelledTitle'
    let dateId = 'store/my-orders-app.cancellation.cancelledAt'

    if (isCancellationRequest) {
      titleId = 'store/my-orders-app.cancellation.requestedTitle'
      dateId = 'store/my-orders-app.cancellation.requestedAt'
    }

    return (
      <>
        <h4 className={styles.trackingTitle}>
          <FormattedMessage id={titleId} />
        </h4>
        <div className={styles.trackingEventCancelled}>
          <div className={styles.trackingDescription}>
            <div className="flex items-center">
              <CalendarIcon className={styles.icon_marginRight} />
              <span>
                <FormattedMessage
                  id={dateId}
                  values={{ date: formatDate(order?.details?.cancellationData?.CancellationDate) }}
                />
              </span>
            </div>
          </div>
          <div className={styles.smallText}>
            {getCancellationText(intl, order?.details?.cancellationData, isCancellationRequest)}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={styles.container}>
      {order?.orderId && (
        <div className={styles.headerContainer}>
          <div className={styles.headerInfo}>
            <span className={styles.orderSubtitle}>{formatDate(order.creationDate, 'long')}</span>
            <span> • </span>
            <Tooltip label={orderStatus.tooltip}>
              <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
            </Tooltip>
          </div>
          <CancellationModal
            allowCancellation={order.details?.allowCancellation}
            orderId={order?.orderId}
            history={order?.details?.cancellationRequests}
          />
        </div>
      )}

      <div className={styles.orderDetailsGrid}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FormattedMessage id="store/my-orders-app.details.address" />
            </h2>
          </CardHeader>

          <CardContent className={styles.cardContentGrid}>
            <div className={styles.cardInnerContent}>
              <div className={styles.addressName}>{order.details?.shippingData.address.receiverName}</div>

              <div className={styles.addressDetails}>{formatAddress(order.details?.shippingData.address)}</div>

              {order.details?.shippingData.address.reference && (
                <div className={styles.textMuted}>
                  <FormattedMessage
                    id="store/my-orders-app.details.reference"
                    values={{ value: order.details?.shippingData.address.reference }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FormattedMessage id="store/my-orders-app.details.paymentMethod" />
            </h2>
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
                          <Tooltip label={intl.formatMessage({ id: 'store/my-orders-app.details.boletoLinkTooltip' })}>
                            <Button
                              variant="link"
                              size="sm"
                              to={payment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              isLink
                            >
                              <FormattedMessage id="store/my-orders-app.details.boletoView" />
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
                          <FormattedMessage
                            id="store/my-orders-app.details.installments"
                            values={{
                              installments: payment.installments,
                              value: formatCurrency(payment.value / payment.installments),
                            }}
                          />
                        </div>
                      )}

                      <div className={styles.totalValue}>
                        <FormattedMessage
                          id="store/my-orders-app.details.price"
                          values={{ value: formatCurrency(payment.value) }}
                        />
                      </div>

                      {Object.entries(payment.connectorResponses).length > 0 && (
                        <details className={styles.additionalInfo}>
                          <summary className={`${styles.textMuted} ${styles.additionalInfoToggle}`}>
                            <FormattedMessage id="store/my-orders-app.details.additionalInfo" />
                          </summary>
                          <div className={styles.additionalInfoContent}>
                            <ConnectorResponses responses={payment.connectorResponses} />
                          </div>
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
            <h2 className={styles.cardTitle}>
              <FormattedMessage id="store/my-orders-app.details.priceBreakdown" />
            </h2>
          </CardHeader>

          <CardContent className={styles.cardContentGrid}>
            <div className={styles.orderSummaryContent}>
              {order.details?.totals.map((total) => (
                <div key={total.id} className={styles.summaryItem}>
                  <span className={styles.textMuted}>{total.name}:</span>
                  <span className={styles.summaryValue}>
                    <FormattedMessage
                      id="store/my-orders-app.details.price"
                      values={{ value: formatCurrency(total.value) }}
                    />
                  </span>
                </div>
              ))}
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.total" />
                </span>
                <span className={styles.totalValue}>
                  <FormattedMessage
                    id="store/my-orders-app.details.price"
                    values={{ value: formatCurrency(order.details?.value) }}
                  />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${styles.card} ${styles.fullLine}`}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FormattedMessage id="store/my-orders-app.details.orderSummary" />
            </h2>
          </CardHeader>

          <CardContent className={styles.cardContent}>
            <div className={styles.orderSummaryContent}>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.summaryStatus" />
                </span>
                <span className={styles.summaryValue}>{orderStatus.label}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.summaryDeliveryEstimate" />
                </span>
                <span className={styles.summaryValue}>{formatDate(maximumShippingEstimateDate, '2-digit')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.summaryOrderDate" />
                </span>
                <span className={styles.summaryValue}>{formatDate(order.creationDate, '2-digit')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.summaryLastUpdate" />
                </span>
                <span className={styles.summaryValue}>{formatDate(order.details?.lastChange, '2-digit')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.summaryTotalItems" />
                </span>
                <span className={styles.summaryValue}>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.textMuted}>
                  <FormattedMessage id="store/my-orders-app.details.summaryTotalValue" />
                </span>
                <span className={styles.totalValue}>
                  <FormattedMessage
                    id="store/my-orders-app.details.price"
                    values={{ value: formatCurrency(order.details?.value) }}
                  />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {pickupItems.length > 0 && (
          <Card className={`${styles.card} ${styles.fullLine}`}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.cardTitleWithIcon}>
                <StoreIcon className={styles.icon_marginRight} />
                <h2 className={styles.cardTitle}>
                  <FormattedMessage id="store/my-orders-app.details.pickupTitle" />
                </h2>
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
                        <h3 className={styles.packageTitle}>
                          {storeInfo.friendlyName ??
                            intl.formatMessage({ id: 'store/my-orders-app.details.pickupStoreFallback' })}
                        </h3>
                        <Badge variant="success">
                          <FormattedMessage id="store/my-orders-app.details.pickupBadge" />
                        </Badge>
                      </div>

                      <div className={styles.packageDetails}>
                        <div className={styles.packageInfo}>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.addressLabel" />
                            </span>
                            <span>
                              {storeInfo.address
                                ? `${storeInfo.address.street}, ${storeInfo.address.number}, ${storeInfo.address.neighborhood}`
                                : intl.formatMessage({ id: 'store/my-orders-app.details.addressUnavailable' })}
                            </span>
                          </div>

                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.cityState" />
                            </span>
                            <span>
                              {storeInfo.address
                                ? `${storeInfo.address.city} - ${storeInfo.address.state}`
                                : intl.formatMessage({ id: 'store/my-orders-app.details.locationUnavailable' })}
                            </span>
                          </div>

                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.pickupEstimate" />
                            </span>
                            <span>
                              {pickupItem.shippingEstimate
                                ? formatShippingEstimate(pickupItem.shippingEstimate, intl)
                                : intl.formatMessage({ id: 'store/my-orders-app.details.notAvailable' })}
                            </span>
                          </div>

                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.contact" />
                            </span>
                            <span>
                              {storeInfo.address?.complement ??
                                intl.formatMessage({ id: 'store/my-orders-app.details.notAvailable' })}
                            </span>
                          </div>

                          {storeInfo.additionalInfo && (
                            <div className={`${styles.packageInfoItem} ${styles.fullLine}`}>
                              <span className={styles.textMuted}>
                                <FormattedMessage id="store/my-orders-app.details.additionalInfoLabel" />
                              </span>
                              <span>{storeInfo.additionalInfo}</span>
                            </div>
                          )}
                        </div>

                        <div className={styles.packageItems}>
                          <h4 className={styles.packageItemsTitle}>
                            <FormattedMessage id="store/my-orders-app.details.pickupItemsTitle" />
                          </h4>

                          {items.map((item) => (
                            <div className={styles.packageItemDetail} key={item?.name}>
                              <span>{item?.name}</span>
                              <span className={styles.textMuted}>
                                <FormattedMessage
                                  id="store/my-orders-app.details.quantityShort"
                                  values={{ value: item?.quantity }}
                                />
                              </span>
                            </div>
                          ))}
                        </div>

                        {!order?.details?.cancellationData && (
                          <div className={styles.pickupCodeSection}>
                            <h4 className={styles.pickupCodeTitle}>
                              <FormattedMessage id="store/my-orders-app.details.pickupCodeTitle" />
                            </h4>
                            <div className={styles.pickupCodeContainer}>
                              {order.pickupOnStoreCode ? (
                                <div className={styles.pickupCodeDisplay}>
                                  <div className={styles.pickupCodeValue}>
                                    <span className={styles.pickupCodeText}>{order.pickupOnStoreCode}</span>
                                    <Button
                                      variant="iconOnly"
                                      className={styles.pickupCodeCopyButton}
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.pickupOnStoreCode ?? '')
                                      }}
                                      title={intl.formatMessage({ id: 'store/my-orders-app.details.copyCode' })}
                                    >
                                      <CopyIcon />
                                    </Button>
                                  </div>
                                  <p className={styles.pickupCodeInstructions}>
                                    <FormattedMessage id="store/my-orders-app.details.pickupCodeInstructions" />
                                  </p>
                                </div>
                              ) : (
                                <div className={styles.pickupCodePending}>
                                  <div className={styles.pickupCodePendingIcon}>
                                    <ClockIcon />
                                  </div>
                                  <div className={styles.pickupCodePendingText}>
                                    <p className={styles.pickupCodePendingTitle}>
                                      <FormattedMessage id="store/my-orders-app.details.pickupCodePendingTitle" />
                                    </p>
                                    <p className={styles.pickupCodePendingDescription}>
                                      <FormattedMessage id="store/my-orders-app.details.pickupCodePendingDescription" />
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className={styles.trackingStatus}>
                          {order?.details?.cancellationData ? (
                            <CancellationMessage />
                          ) : (
                            pickupItem.shippingEstimateDate && (
                              <>
                                <h4 className={styles.trackingTitle}>
                                  <FormattedMessage id="store/my-orders-app.details.pickupAvailableTitle" />
                                </h4>
                                <div className={styles.trackingEvent}>
                                  <div className={styles.trackingDescription}>
                                    <div className="flex items-center">
                                      <CalendarIcon className={styles.icon_marginRight} />
                                      <span>
                                        <FormattedMessage
                                          id="store/my-orders-app.details.pickupAvailableFrom"
                                          values={{ date: formatDate(pickupItem.shippingEstimateDate) }}
                                        />
                                      </span>
                                    </div>
                                  </div>
                                  <div className={styles.smallText}>
                                    <FormattedMessage id="store/my-orders-app.details.pickupAvailableDescription" />
                                    <br />
                                    <FormattedMessage id="store/my-orders-app.details.pickupAvailableDescriptionCode" />
                                  </div>
                                </div>
                              </>
                            )
                          )}
                        </div>

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
                              <FormattedMessage id="store/my-orders-app.details.viewOnMap" />
                            </Button>
                          )}
                          {phoneNumber && (
                            <Button variant="outline" size="sm" to={`tel:${phoneNumber}`} isLink>
                              <PhoneIcon className={styles.icon_marginRight} />
                              <FormattedMessage id="store/my-orders-app.details.callStore" />
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

        {deliveryItems.length > 0 && (
          <Card className={`${styles.card} ${styles.fullLine}`}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.cardTitleWithIcon}>
                <StoreIcon className={styles.icon_marginRight} />
                <h2 className={styles.cardTitle}>
                  <FormattedMessage id="store/my-orders-app.details.deliveryTitle" />
                </h2>
              </div>
            </CardHeader>

            <CardContent className={styles.cardContent}>
              <div className={styles.packagesList}>
                {deliveryItems.map((deliveryItem, index) => {
                  const items = deliveryItem.items
                    .map((pickupOrderItem: { itemId: string }) =>
                      order?.details?.items.find((i) => i.id === pickupOrderItem.itemId)
                    )
                    .filter(Boolean)

                  return (
                    <div key={index} className={styles.packageItem}>
                      <div className={styles.packageHeader}>
                        <h3 className={styles.packageTitle}>
                          <FormattedMessage
                            id="store/my-orders-app.details.deliveredBy"
                            values={{ company: deliveryItem.deliveryCompany }}
                          />
                        </h3>
                        <Badge variant="success">
                          <FormattedMessage id="store/my-orders-app.details.deliveryBadge" />
                        </Badge>
                      </div>

                      <div className={styles.packageDetails}>
                        <div className={styles.packageInfo}>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.addressLabel" />
                            </span>
                            <span>{formatAddress(order.details?.shippingData.address)}</span>
                          </div>

                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.recipient" />
                            </span>
                            <span>{order.details?.shippingData.address.receiverName}</span>
                          </div>

                          <div className={`${styles.packageInfoItem} ${styles.fullLine}`}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.deliveryEstimate" />
                            </span>
                            <span>
                              {deliveryItem.shippingEstimate
                                ? formatShippingEstimate(deliveryItem.shippingEstimate, intl)
                                : intl.formatMessage({ id: 'store/my-orders-app.details.notAvailable' })}
                            </span>
                          </div>
                        </div>

                        <div className={styles.packageItems}>
                          <h4 className={styles.packageItemsTitle}>
                            <FormattedMessage id="store/my-orders-app.details.deliveryItemsTitle" />
                          </h4>

                          {items.map((item) => (
                            <div className={styles.packageItemDetail} key={item?.name}>
                              <span>{item?.name}</span>
                              <span className={styles.textMuted}>
                                <FormattedMessage
                                  id="store/my-orders-app.details.quantityShort"
                                  values={{ value: item?.quantity }}
                                />
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className={styles.trackingStatus}>
                          {order?.details?.cancellationData ? (
                            <CancellationMessage />
                          ) : (
                            deliveryItem.shippingEstimateDate && (
                              <>
                                <h4 className={styles.trackingTitle}>
                                  <FormattedMessage id="store/my-orders-app.details.deliveredUntilTitle" />
                                </h4>
                                <div className={styles.trackingEvent}>
                                  <div className={styles.trackingDescription}>
                                    <div className="flex items-center">
                                      <CalendarIcon className={styles.icon_marginRight} />
                                      <span>
                                        <FormattedMessage
                                          id="store/my-orders-app.details.deliveredUntilText"
                                          values={{ date: formatDate(maximumShippingEstimateDate, '2-digit') }}
                                        />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )
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
                <h2 className={styles.cardTitle}>
                  <FormattedMessage id="store/my-orders-app.details.packagesTitle" />
                </h2>
              </div>
            </CardHeader>

            <CardContent className={styles.cardContent}>
              <div className={styles.packagesList}>
                {packageList.map((packageMain, index) => (
                  <div key={index} className={styles.packageItem}>
                    <div className={styles.packageHeader}>
                      <h3 className={styles.packageTitle}>
                        <FormattedMessage
                          id="store/my-orders-app.details.packageNumber"
                          values={{ number: index + 1 }}
                        />
                      </h3>
                      <Badge variant="outline">
                        {packageMain.courier ??
                          intl.formatMessage({ id: 'store/my-orders-app.details.courierFallback' })}
                      </Badge>
                    </div>

                    <div className={styles.packageDetails}>
                      <div className={styles.packageInfo}>
                        <Tooltip label={packageMain.invoiceKey}>
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.invoice" />
                            </span>
                            <span>{packageMain.invoiceNumber}</span>
                          </div>
                        </Tooltip>
                        {packageMain.trackingNumber && (
                          <div className={styles.packageInfoItem}>
                            <span className={styles.textMuted}>
                              <FormattedMessage id="store/my-orders-app.details.tracking" />
                            </span>
                            <span>{packageMain.trackingNumber}</span>
                          </div>
                        )}
                        <div className={styles.packageInfoItem}>
                          <span className={styles.textMuted}>
                            <FormattedMessage id="store/my-orders-app.details.issuanceDate" />
                          </span>
                          <span>{formatDate(packageMain.issuanceDate)}</span>
                        </div>
                        <div className={styles.packageInfoItem}>
                          <span className={styles.textMuted}>
                            <FormattedMessage id="store/my-orders-app.details.invoiceValue" />
                          </span>
                          <span>
                            <FormattedMessage
                              id="store/my-orders-app.details.price"
                              values={{ value: formatCurrency(packageMain.invoiceValue) }}
                            />
                          </span>
                        </div>
                      </div>

                      <div className={styles.packageItems}>
                        <h4 className={styles.packageItemsTitle}>
                          <FormattedMessage id="store/my-orders-app.details.packageItemsTitle" />
                        </h4>
                        {packageMain.items.map((packageItem) => {
                          return (
                            <div key={packageItem.itemIndex} className={styles.packageItemDetail}>
                              <span>{packageItem.description}</span>
                              <span className={styles.textMuted}>
                                <FormattedMessage
                                  id="store/my-orders-app.details.quantityShort"
                                  values={{ value: packageItem.quantity }}
                                />
                              </span>
                              <span className={styles.textMuted}>
                                <FormattedMessage
                                  id="store/my-orders-app.details.price"
                                  values={{ value: formatCurrency(packageItem.price) }}
                                />
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {packageMain.courierStatus?.data && packageMain.courierStatus?.data.length > 0 && (
                        <div className={styles.trackingStatus}>
                          <h4 className={styles.trackingTitle}>
                            <FormattedMessage id="store/my-orders-app.details.trackingStatusTitle" />
                          </h4>
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
                            <FormattedMessage id="store/my-orders-app.details.trackPackage" />
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
            <h2 className={styles.cardTitle}>
              <FormattedMessage id="store/my-orders-app.details.productsTitle" />
            </h2>
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
                      <div className={styles.textMuted}>
                        <FormattedMessage
                          id="store/my-orders-app.details.sku"
                          values={{ value: item.refId ?? item.sellerSku }}
                        />
                      </div>
                      <div className={styles.textMuted}>
                        <FormattedMessage id="store/my-orders-app.details.quantity" values={{ value: item.quantity }} />
                      </div>
                    </div>
                    <div className={styles.itemInfoCol}>
                      <div className={styles.itemPrice}>
                        <FormattedMessage
                          id="store/my-orders-app.details.price"
                          values={{ value: formatCurrency(item.sellingPrice * item.quantity) }}
                        />
                      </div>
                      <div className={styles.textMuted}>
                        <FormattedMessage
                          id="store/my-orders-app.details.unitPrice"
                          values={{ value: formatCurrency(item.sellingPrice) }}
                        />
                      </div>
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
