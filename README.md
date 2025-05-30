# Enhanced My Orders App

This application provides a revamped interface for the VTEX My Orders page, offering a more comprehensive and user-friendly experience for customers to track and manage their orders.

This application streamlines the order viewing process by providing detailed information about order status, tracking, package splits, and delivery estimates in an intuitive layout with modern styling.

## Features

- **Enhanced Order Cards**: Clear presentation of order information with expandable details
- **Package Tracking**: Detailed tracking information with current status and delivery estimates
- **Package Split Information**: View items grouped by packages with their respective shipping details
- **Payment Details**: Comprehensive payment information including installments and methods
- **Responsive Design**: Fully responsive layout that works across all devices
- **Status Badges**: Clear visual indicators of order status with tooltips for more information

| ![Orders List](https://github.com/user-attachments/assets/9f850b96-2955-4ed6-b8b6-93c3d7d55375) |
| :--------------------------------------------------------: |
|                       _Orders List View_                     |

| ![Order Details](https://github.com/user-attachments/assets/1674bb90-2b82-4a08-bec2-4c6b3acb2533) |
| :-----------------------------------------------------------: |
|                      _Order Details View_                       |

| ![Order Details](https://github.com/user-attachments/assets/18051309-5c05-4f30-927f-8b236f991098) |
| :-----------------------------------------------------------: |
|                      _Order Details View_                       |

## Installation

1. Install the app by running `vtex install {{vendor}}.my-orders-app` in your terminal.

2. Add the app to your store-theme's `manifest.json` dependencies:

```diff
  "dependencies": {
    ...
+   "{vendor}.my-orders-app": "1.x"
  },
```

> **Note:**  
> To authenticate API requests, ensure you set the `X-VTEX-API-AppKey` and `X-VTEX-API-AppToken` headers in the `getOrder` function located at `my-orders-app\node\clients\oms.ts`, this will help the app get more detailed information of the orders that the user has access to.

## How it Works

The app provides two main views:

### Orders List View

- Clear overview of all orders with essential information
- Expandable cards showing order details, items, and tracking
- Status badges with tooltips providing useful information

### Order Details View

- Comprehensive order information organized in cards
- Package tracking details with courier information
- Complete payment and some billing information
- Shipping address and delivery estimates
- Detailed price breakdown including discounts
- Courier status (if available in the order information)

## Technical Details

This app comes with the following dependencies:
- VTEX My Account
- VTEX Orders GraphQL
- VTEX Rich Text
- VTEX Order Items
- VTEX Pixel Manager

> **Important:**
> The app includes the `pixel` builder that is used solely to hide the previous native version of the My Orders app. This ensures that only the enhanced version provided by this app is visible to customers.

## Support

For issues and feature requests, please open an issue in this repository or contact our support team.

## ⚠️ Important Configuration Note: allowMultipleDeliveries

This application assumes that the **`allowMultipleDeliveries`** setting is **disabled** in your VTEX account's Checkout configuration.

If your store enables **multiple deliveries** (i.e., **`allowMultipleDeliveries` set to `true`**), **additional configuration may be required** to ensure proper functionality and display within this app. When multiple delivery options are available (e.g., pickup on store for one item and regular delivery for another), VTEX **automatically splits deliveries** for stores using **Checkout V6**.

The current layout of the Enhanced My Orders App **may not fully support** the complexities introduced by these automatic delivery splits, such as:

- Different delivery methods within a single order.
- Multiple packages created from a single cart.
- Diverging delivery estimates and tracking information per package.

Please review the official VTEX documentation for more details:  
👉 [VTEX - Order and Delivery Split](https://help.vtex.com/pt/tutorial/divisao-de-pedidos-e-divisao-de-entregas--jQvzA6QgSd51e2p6bthoV)

> **Recommendation:**  
> If your store has or plans to enable `allowMultipleDeliveries`, carefully test the app's behavior with complex orders involving multiple delivery methods. Depending on your findings, further customization or enhancements to this app's layout may be necessary to provide an optimal user experience.
