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
| :---------------------------------------------------------------------------------------------: |
|                                       _Orders List View_                                        |

| ![Order Details](https://github.com/user-attachments/assets/1674bb90-2b82-4a08-bec2-4c6b3acb2533) |
| :-----------------------------------------------------------------------------------------------: |
|                                       _Order Details View_                                        |

| ![Order Details](https://github.com/user-attachments/assets/18051309-5c05-4f30-927f-8b236f991098) |
| :-----------------------------------------------------------------------------------------------: |
|                                       _Order Details View_                                        |

## Installation

1. Install the app by running `vtex install {{vendor}}.my-orders-app` in your terminal.

2. Add the app to your store-theme's `manifest.json` dependencies:

```diff
  "dependencies": {
    ...
+   "{vendor}.my-orders-app": "1.x"
  },
```

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
- Cancellation modal with form to request cancellation
- Cancellation history with previous requests

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

For issues and feature requests, please open an issue in this repository.
