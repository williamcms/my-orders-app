import { OrderItem } from '../../node/types/orderDetails'

export const adjustItemsForEvent = (selectedItem: OrderItem, quantity: number) => {
  // Changes this `/Apparel & Accessories/Clothing/Tops/`
  // to this `Apparel & Accessories/Clothing/Tops`
  const categories = selectedItem.additionalInfo.categories.reduce((acc: string[], v) => {
    acc.push(v.name)

    return acc
  }, [])

  const category = categories ? categories.slice(1, -1) : ''

  return {
    skuId: selectedItem.sellerSku,
    ean: selectedItem.ean,
    variant: selectedItem.sellerSku,
    price: selectedItem.price,
    sellingPrice: selectedItem.sellingPrice,
    priceIsInt: false,
    name: selectedItem.name,
    quantity,
    productId: selectedItem.productId,
    productRefId: selectedItem.refId,
    brand: '',
    category,
    detailUrl: selectedItem.detailUrl,
    imageUrl: selectedItem.imageUrl,
    referenceId: selectedItem.refId,
    seller: selectedItem.seller,
    sellerName: '',
  }
}
