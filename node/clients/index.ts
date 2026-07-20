import type { InstanceOptions, IOContext } from '@vtex/api'
import { IOClients } from '@vtex/api'
import { masterDataFor } from '@vtex/clients'
import type { PickupCodeSchemaV1 } from '{{account}}.my-orders-app'

import OMS from './oms'

const PickupCodesEntity = masterDataFor<PickupCodeSchemaV1>('pickupCode')

// @ts-expect-error TS2650: MasterDataEntity is abstract only by declared type, the runtime class is concrete
class PickupCodesAdmin extends PickupCodesEntity {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, { ...options, headers: { ...options?.headers, VtexIdclientAutCookie: ctx.adminUserAuthToken ?? '' } })
  }
}

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get oms() {
    return this.getOrSet('oms', OMS)
  }

  /** App-token access, used only by the storefront flow after OMS confirms order ownership */
  public get pickupCodes() {
    return this.getOrSet('pickupCodes', PickupCodesEntity)
  }

  /** Admin-token access for the admin CRUD routes */
  public get pickupCodesAdmin() {
    return this.getOrSet('pickupCodesAdmin', PickupCodesAdmin)
  }
}
