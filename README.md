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

## Development

### Vendor setup (runs automatically on `yarn start`)

`yarn start` runs `scripts/setup-vendor.js` before linking. It checks `manifest.json`'s `vendor` field and the vendor prefix in `node/clients/index.ts`'s masterdata typings import (`import type { PickupCodeSchemaV1 } from '{{account}}.my-orders-app'`), plus scans the rest of the repo (excluding `node_modules`, `.git`, `dist`/`build`, `*.md`, `*.lock`) for any other leftover `{{account}}` placeholder.

- If everything is already configured: it writes a local `.env` flag (`VENDOR_SETUP_DONE=true`, gitignored) and exits immediately on future runs. The `manifest.json`/import check still always runs even when that flag is set, since a `git stash`/`reset`/`checkout` can revert those tracked files without touching the local flag.
- If a placeholder is found anywhere: it prompts you for the real vendor name, updates `manifest.json`'s `vendor` and any other file it found, then runs `vtex setup --typings` for you.
- `vtex setup --typings` needs an active vtex session. On a first-ever run there isn't one yet, so this step is best-effort: it prints a warning and continues instead of failing `yarn start` if it can't run yet.

### Generating Master Data typings manually

The `pickupCode` Master Data entity's TypeScript type (`PickupCodeSchemaV1`) is generated from `masterdata/pickupCode/schema.json`, not hand-written. After linking the app, run this at the project root to regenerate it:

```sh
vtex link
vtex setup --typings
```

This writes the typings package to `node/node_modules/{{vendor}}.my-orders-app`, re-exporting types for the masterdata, graphql, and react builders. Regenerate it after every change to `masterdata/pickupCode/schema.json`, and again before releasing so the typings aren't tied to your dev workspace.

If the generated type isn't picked up, delete `node/node_modules`, run `yarn`, then `vtex setup --typings` and `vtex link` again.

## Support

For issues and feature requests, please open an issue in this repository.
