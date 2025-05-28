export interface OrderListItemDetails {
  orderId: string
  /**
   * Sequence number part of the order ID.
   * For example, in order v70530116str-01, the sequence is 70530116.
   */
  sequence: string
  marketplaceOrderId: string
  marketplaceServicesEndpoint: string
  sellerOrderId: string
  /**
   * Order's origin in the order flow.
   * Allowed: Marketplace | Fulfillment | Chain
   */
  origin: 'Marketplace' | 'Fulfillment' | 'Chain'
  /**
   * Three-letter affiliate code configured by the seller to identify a marketplace.
   */
  affiliateId: string
  salesChannel: string
  /**
   * For a VTEX store, the merchant's name will be the same as the account name.
   * An external seller can have a merchantName, but it will not be an account name.
   */
  merchantName: string | null
  /**
   * Order status in the workflow.
   * @link https://help.vtex.com/en/tutorial/order-flow-and-status--tutorials_196
   */
  status: string
  /**
   * Indicates whether the order processing encountered a non-recoverable error in the workflow (true),
   * or if there are no such errors and processing can continue normally (false).
   */
  workflowIsInError: boolean
  /**
   * @deprecated Status description displayed on the VTEX Admin.
   * This field is obsolete and may not return any value.
   */
  statusDescription: string
  /**
   * Order total value in cents
   */
  value: number
  /**
   * Order creation date in ISO 8601 time zone offset format, as in YYYY-MM-DDThh:mm:ssZ.
   */
  creationDate: string
  /**
   * Order last change date in ISO 8601 time zone offset format, as in YYYY-MM-DDThh:mm:ssZ.
   */
  lastChange: string
  /**
   * Order group ID, a segment of the order ID that groups all orders related to the same purchase.
   * For example, in the order ID v71021570str-02), the order group ID is v71021570str.
   */
  orderGroup: string
  /**
   * Email of the store employee responsible for managing the order
   */
  followUpEmail: string
  lastMessage: string | null
  /**
   * Main account name.
   */
  hostname: string
  /**
   * Defines if the order payment has been settled (true) or not (false).
   */
  isCompleted: boolean
  /**
   * Total rounding error value in cents, when applicable.
   * This occurs in scenarios such as discounts applied to items with non-integer multipliers.
   * In these cases, rounding is performed per item rather than after summing all items,
   * which may result in a small difference in the overall discount total.
   */
  roundingError: number
  orderFormId: string
  /**
   * Defines if order cancellation is allowed (true) or not anymore (false).
   */
  allowCancellation: boolean
  /**
   * Defines if the order can be edited (true) or not anymore (false).
   */
  allowEdition: boolean
  /**
   * Defines if the order was placed via VTEX Sales App (true) or not (false).
   */
  isCheckedIn: boolean
  /**
   * Order authorization date in ISO 8601 time zone offset format, as in YYYY-MM-DDThh:mm:ssZ.
   */
  authorizedDate: string | null
  /**
   * Order invoice date in ISO 8601 time zone offset format, as in YYYY-MM-DDThh:mm:ssZ.
   */
  invoicedDate: string | null
  cancelReason: string | null
  /**
   * If the order was placed at a physical store configured as a pickup point, this field contains the pickup point ID.
   */
  checkedInPickupPointId: string | null
  /**
   * Information about the order totals
   */
  totals: OrderTotals[]
  /**
   * Information about the sellers associated with the order
   */
  sellers: OrderSeller[]
  /**
   * Information about the customer preferences
   */
  clientPreferencesData: ClientPreferencesData
  /**
   * Information about order cancellation, when applicable
   * @link https://developers.vtex.com/docs/guides/order-canceling-improvements
   */
  cancellationData: CancellationData | null
  /**
   * Order taxes information
   */
  taxData: unknown | null
  /**
   * Information about subscriptions, when applicable
   * @link https://help.vtex.com/tutorial/how-subscriptions-work--frequentlyAskedQuestions_4453
   */
  subscriptionData: unknown | null
  /**
   * Metadata information about the order's items
   */
  itemMetadata: ItemMetadata
  /**
   * Information about the marketplace related to the order
   */
  marketplace: MarketplaceData
  /**
   * Store preferences in the Account settings page
   * @link https://help.vtex.com/en/tutorial/account-details-page--2vhUVOKfCaswqLguT2F9xq
   */
  storePreferencesData: StorePreferencesData
  /**
   * Customizable fields created by the store for the shopping cart.
   * This field is useful for storing data not included in other fields.
   * For example, a message for a gift or a name to be printed in a shirt.
   */
  customData: unknown | null
  commercialConditionData: unknown | null
  /**
   * Optional field for additional information
   */
  openTextField: {
    value: string
  }
  invoiceData: InvoiceData | null
  changesAttachment: unknown | null
  callCenterOperatorData: unknown | null
  packageAttachment: {
    packages: Package[]
  }
  paymentData: PaymentData
  shippingData: ShippingData
  ratesAndBenefitsData: RatesAndBenefitsData
  /**
   * Information about promotions and marketing.
   * For example, coupon tracking information and internal or external UTMs
   */
  marketingData: MarketingData | null
  giftRegistryData: unknown | null
  clientProfileData: ClientProfileData
  items: OrderItem[]
  marketplaceItems: unknown[]
  cancellationRequests: CancellationRequest[] | null
  approvedBy: string | null
  cancelledBy: string | null
  purchaseAgentData: unknown | null
  pendingData: unknown | null
  creationEnvironment: string
}

export interface PackageItems {
  /**
   * Package item index number.
   */
  itemIndex: number
  /**
   * Package item quantity.
   */
  quantity: number
  /**
   * Package item price in cents.
   */
  price: number
  /**
   * Package item description.
   */
  description: string | null
  /**
   * Package item unit multiplier.
   */
  unitMultiplier: number | null
}

export interface CorrierStatusData {
  /**
   * Package tracking date since last update in ISO 8601 time zone offset format,
   * as in YYYY-MM-DD hh:mm:ss[.nnnnnnn]+hh:mm.
   */
  lastChange: string
  /**
   * Package current tracking city.
   */
  city: string
  /**
   * Package current tracking state in two-digit code format.
   */
  state: string
  /**
   * Package tracking description.
   */
  description: string
  /**
   * Package tracking creation date in ISO 8601 time zone offset format, as in YYYY-MM-DD hh:mm:ss[.nnnnnnn]+hh:mm.
   */
  createDate: string
}

export interface CorrierStatus {
  /**
   * Defines if a carrier was assigned for order shipping (ok) or not (null).
   */
  status: string | null
  /**
   * Defines if the carrier has already delivered the package (true) or not (false).
   */
  finished: boolean
  /**
   * Package delivery date in ISO 8601 time zone offset format, as in YYYY-MM-DD hh:mm:ss[.nnnnnnn]+hh:mm.
   */
  deliveredDate: string
  /**
   * Package tracking information.
   */
  data: CorrierStatusData[]
}

export interface Restitutions {
  /**
   * Customer refund details
   */
  Refund: Array<{
    /**
     * Refund value in cents
     */
    value: number
    /**
     * Refund involving Gift Card
     */
    giftCardData: string | null
    /**
     * Information about the items being returned
     */
    items: unknown[]
  }>
}

export interface Package {
  items: PackageItems[]
  /**
   * Name of the carrier responsible for the package shipping
   */
  courier: string | null
  /**
   * Unique identification code of the package invoice
   */
  invoiceNumber: string
  /**
   * Package invoice value in cents.
   */
  invoiceValue: number
  /**
   * Package invoice URL.
   */
  invoiceUrl: string | null
  /**
   * Package invoice issuance date in ISO 8601 time zone offset format, as in YYYY-MM-DD hh:mm:ss[.nnnnnnn]+hh:mm.
   */
  issuanceDate: string
  /**
   * Package tracking number.
   */
  trackingNumber: string | null
  /**
   * Package invoice key.
   */
  invoiceKey: string | null
  /**
   * Package tracking URL.
   */
  trackingUrl: string | null
  /**
   * Package invoice text in xml format. This field is important for stores integrated with external marketplaces.
   */
  embeddedInvoice: string
  /**
   * Package invoice type, which can be:
   * Output: Selling order invoice.
   * Input: Returning items invoice.
   * Allowed: Output | Input
   */
  type: 'Output' | 'Input'
  /**
   * Carrier package shipping information.
   */
  courierStatus: CorrierStatus | null
  /**
   * CFOP (Código Fiscal de Operação e Prestação) is a Brazilian fiscal code of operations
   * and services that classifies business transactions types.
   * @link https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/facilitacao/anexo-ecf-cfop
   */
  cfop: string | null
  /**
   * Information about a value being returned to the customer.
   * This field applies only to invoices with the Input type because it relates to returning items.
   */
  restitutions: Restitutions[] | Record<string, never>
  /**
   * Indicates the number of boxes (volumes) needed to contain the package items.
   * For example, two refrigerators do not fit in a single volume, so this field would have value 2.
   */
  volumes: number | null
  /**
   * Defines if the package items' value should be inferred by the invoice value (true) or not (false).
   */
  EnableInferItems: boolean | null
}

export interface MarketingData {
  /**
   * Object ID. The expected value is marketingData
   */
  id: string
  /**
   * Value of the utm_source parameter of the URL that led to the request
   */
  utmSource: string | null
  /**
   * UTM Source Parameters
   */
  utmPartner: string | null
  /**
   * Value of the utm_medium parameter of the URL that led to the request
   */
  utmMedium: string | null
  /**
   * Value of the utm_campaign parameter of the URL that led to the request
   */
  utmCampaign: string | null
  /**
   * Coupon code
   */
  coupon: string
  /**
   * Internal UTM value utmi_cp
   */
  utmiCampaign: string | null
  /**
   * Internal UTM value utmi_p
   */
  utmipage: string | null
  /**
   * Internal UTM value utmi_pc
   */
  utmiPart: string | null
  /**
   * Marketing tags information.
   * This field can be used to register campaign data or informative tags regarding promotions
   */
  marketingTags: string[]
}

export interface OrderTotals {
  /**
   * Total ID, which defines what the total is about.
   * Allowed: Items | Discounts | Shipping | Tax
   */
  id: 'Items' | 'Discounts' | 'Shipping' | 'Tax'
  name: string
  value: number
  /**
   * Provides details about alternative totals for the order, when applicable.
   * For example, if marketplace item discounts cause a difference in the Items total value,
   * this field contains information explaining the discrepancy.
   */
  alternativeTotals?: AlternativeTotals
}

export type AlternativeTotals = Omit<OrderTotals, 'alternativeTotals'>

export interface OrderSeller {
  id: string
  name: string
  /**
   * Seller logo URL
   */
  logo: string | null
  /**
   * URL of the endpoint for fulfillment of seller's orders, which the marketplace use to communicate with the seller
   */
  fulfillmentEndpoint: string
}

export interface ClientPreferencesData {
  /**
   * Language code of the customer preferred language while accessing the store
   */
  locale: string
  /**
   * Defines if the customer receives the store's newsletter (true) or not (false).
   */
  optinNewsLetter: boolean
}

export interface CancellationData {
  /**
   * Indicates if the order cancellation was requested by the customer (true) or not (false).
   */
  RequestedByUser: boolean | null
  /**
   * Indicates if the order cancellation was made by the system (true) or not (false).
   * This type of order cancellation happens in incomplete orders, for example.
   */
  RequestedBySystem: boolean | null
  /**
   * Indicates if the order cancellation was requested by the seller (true) or not (false).
   */
  RequestedBySellerNotification: boolean | null
  /**
   * Indicates if the order cancellation was requested by the payment gateway (true) or not (false).
   */
  RequestedByPaymentNotification: boolean | null
  /**
   * Reason why the order was canceled
   */
  Reason: string
  /**
   * Order cancellation date in UTC ISO 8601 format, as in YYYY-MM-DDThh:mm:ssZ.
   */
  CancellationDate: string
}

export interface ItemMetadata {
  Items: ItemMetadataItem[]
}

export interface ItemMetadataItem {
  Id: string
  Seller: string
  Name: string
  SkuName: string
  ProductId: string
  RefId: string | null
  Ean: string | null
  /**
   * SKU image URL
   */
  ImageUrl: string
  /**
   * SKU slug
   */
  DetailUrl: string
  /**
   * Assembly options information related to the item, if there are any
   * @link https://help.vtex.com/en/tutorial/assembly-options--5x5FhNr4f5RUGDEGWzV1nH
   */
  AssemblyOptions: unknown[]
}

export interface MarketplaceData {
  baseURL: string
  /**
   * Defines if the marketplace is a VTEX certified marketplace (true) or not (false).
   */
  isCertified: boolean | null
  name: string
}

export interface StorePreferencesData {
  /**
   * Country code in three-digit ISO 3166 ALPHA-3 format
   */
  countryCode: string
  /**
   * Currency code in ISO 4217 format
   */
  currencyCode: string
  /**
   * Currency format settings
   */
  currencyFormatInfo: CurrencyFormatInfo
  currencyLocale: number
  currencySymbol: string
  timeZone: string
}

export interface CurrencyFormatInfo {
  CurrencyDecimalDigits: number
  CurrencyDecimalSeparator: string
  CurrencyGroupSeparator: string
  CurrencyGroupSize: number
  StartsWithCurrencySymbol: boolean
}

export interface InvoiceData {
  userPaymentInfo: unknown | null
  address: Address | null
  invoiceSubject: string | null
}

export interface Address {
  postalCode: string
  city: string
  state: string
  country: string
  street: string
  number: string
  neighborhood: string
  complement: string
  reference: string | null
  geoCoordinates: [number, number]
}

export interface PaymentData {
  transactions: PaymentTransaction[]
  giftCards: PaymentGiftCard[]
}

export interface PaymentTransaction {
  isActive: boolean
  transactionId: string
  merchantName: string
  payments: Payment[]
}

export interface Payment {
  id: string
  paymentSystem: string
  paymentSystemName: string
  value: number
  installments: number
  referenceValue: number
  cardHolder: string | null
  cardNumber: string | null
  firstDigits: string | null
  lastDigits: string | null
  cvv2: string | null
  expireMonth: number | null
  expireYear: number | null
  url: string | null
  giftCardId: string | null
  giftCardName: string | null
  giftCardCaption: string | null
  redemptionCode: string | null
  group: string
  tid: string
  dueDate: string | null
  connectorResponses: Record<string, unknown>
  giftCardProvider: string | null
  giftCardAsDiscount: boolean | null
  koinUrl: string | null
  accountId: string | null
  parentAccountId: string | null
  bankIssuedInvoiceIdentificationNumber: string | null
  bankIssuedInvoiceIdentificationNumberFormatted: string | null
  bankIssuedInvoiceBarCodeNumber: string | null
  bankIssuedInvoiceBarCodeType: string | null
  billingAddress: unknown | null
  paymentOrigin: string | null
}

export interface PaymentGiftCard {
  id: string
  redemptionCode: string
  name: string | null
  caption: string | null
  value: number
  balance: number
  provider: string
  groupName: string | null
  inUse: boolean
  isSpecialCard: boolean
}

export interface TrackingHints {
  trackingId: string
  courierName: string
  trackingUrl: string
  trackingLabel: string
}

export interface ShippingData {
  id: string
  address: ShippingAddress
  logisticsInfo: LogisticsInfo[]
  trackingHints: TrackingHints[] | null
  selectedAddresses: ShippingAddress[]
  availableAddresses: ShippingAddress[]
  contactInformation: unknown[]
}

export interface ShippingAddress {
  addressType: string
  receiverName: string
  addressId: string
  versionId: string | null
  entityId: string | null
  postalCode: string
  city: string
  state: string
  country: string
  street: string
  number: string
  neighborhood: string
  complement: string
  reference: string | null
  geoCoordinates: [number, number]
}

export interface LogisticsInfo {
  itemIndex: number
  itemId: string
  selectedSla: string
  selectedDeliveryChannel: string
  lockTTL: string
  price: number
  listPrice: number
  sellingPrice: number
  deliveryWindow: unknown | null
  deliveryCompany: string
  shippingEstimate: string
  shippingEstimateDate: string | null
  slas: SLA[]
  shipsTo: string[]
  deliveryIds: DeliveryId[]
  deliveryChannels: DeliveryChannel[]
  deliveryChannel: string
  pickupStoreInfo: PickupStoreInfo
  addressId: string
  versionId: string | null
  entityId: string | null
  polygonName: string
  pickupPointId: string | null
  transitTime: string
}

export interface SLA {
  id: string
  name: string
  shippingEstimate: string
  deliveryWindow: unknown | null
  availableDeliveryWindows: unknown[]
  price: number
  listPrice: number
  deliveryChannel: string
  pickupStoreInfo: PickupStoreInfo
  polygonName: string
  lockTTL: string
  pickupPointId: string | null
  transitTime: string
  pickupDistance: number
  deliveryIds: DeliveryId[]
  shippingEstimateDate: string | null
}

export interface PickupStoreInfo {
  additionalInfo: string | null
  address: ShippingAddress | null
  dockId: string | null
  friendlyName: string | null
  isPickupStore: boolean
}

export interface DeliveryId {
  courierId: string
  courierName: string
  dockId: string
  quantity: number
  warehouseId: string
  accountCarrierName: string
  kitItemDetails: unknown[]
}

export interface DeliveryChannel {
  id: string
  stockBalance: number
}

export interface RatesAndBenefitsData {
  id: string
  rateAndBenefitsIdentifiers: unknown[]
}

export interface ClientProfileData {
  id: string
  email: string
  firstName: string
  lastName: string
  documentType: string
  document: string
  phone: string
  corporateName: string | null
  tradeName: string | null
  corporateDocument: string | null
  stateInscription: string | null
  corporatePhone: string | null
  isCorporate: boolean
  userProfileId: string
  userProfileVersion: string | null
  customerClass: string | null
  customerCode: string | null
}

export interface OrderItem {
  uniqueId: string
  id: string
  productId: string
  ean: string | null
  lockId: string
  itemAttachment: {
    content: Record<string, unknown>
    name: string | null
  }
  attachments: unknown[]
  quantity: number
  seller: string
  name: string
  refId: string | null
  price: number
  listPrice: number
  manualPrice: number | null
  manualPriceAppliedBy: string | null
  priceTags: unknown[]
  imageUrl: string
  detailUrl: string
  components: unknown[]
  bundleItems: unknown[]
  params: unknown[]
  offerings: unknown[]
  attachmentOfferings: unknown[]
  sellerSku: string
  priceValidUntil: string
  commission: number
  tax: number
  preSaleDate: string | null
  additionalInfo: AdditionalInfo
  measurementUnit: string
  unitMultiplier: number
  sellingPrice: number
  isGift: boolean
  shippingPrice: number | null
  rewardValue: number
  freightCommission: number
  priceDefinition: PriceDefinition
  taxCode: string | null
  parentItemIndex: number | null
  parentAssemblyBinding: string | null
  callCenterOperator: string | null
  serialNumbers: string | null
  assemblies: unknown[]
  costPrice: number
}

export interface AdditionalInfo {
  brandName: string
  brandId: string
  categoriesIds: string
  categories: Category[]
  productClusterId: string
  commercialConditionId: string
  dimension: Dimension
  offeringInfo: unknown | null
  offeringType: unknown | null
  offeringTypeId: unknown | null
}

export interface Category {
  id: number
  name: string
}

export interface Dimension {
  cubicweight: number
  height: number
  length: number
  weight: number
  width: number
}

export interface PriceDefinition {
  sellingPrices: SellingPrice[]
  calculatedSellingPrice: number
  total: number
  reason: string | null
}

export interface SellingPrice {
  value: number
  quantity: number
}

export interface CancellationRequest {
  id: string
  reason: string
  cancellationRequestDate: string
  requestedByUser: boolean
  deniedBySeller: boolean
  deniedBySellerReason: string | null
  cancellationRequestDenyDate: string | null
}
