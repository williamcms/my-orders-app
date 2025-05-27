export const getPaymentMethodName = (paymentSystemName?: string | null, group?: string | null): string => {
  if (!paymentSystemName) return ''

  if (group === 'giftCard') {
    return `Cartão de Presente`
  }
  if (group === 'creditCard') {
    return `Cartão de Crédito ${paymentSystemName}`
  }
  if (group === 'debitCard') {
    return `Cartão de Débito ${paymentSystemName}`
  }
  if (group === 'bankInvoice') {
    return 'Boleto Bancário'
  }
  if (group === 'pix') {
    return 'PIX'
  }

  return paymentSystemName
}
