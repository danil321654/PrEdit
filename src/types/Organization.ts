import { PagingResponse } from './Common'
import { OrganizationAddressParams } from '../records'

export interface OrganizationMainData {
  id: string
  entityId: string
  name: string
}

export interface OrganizationAddressDto extends OrganizationAddressParams {
  organization: OrganizationMainData
}

export interface OrganizationAddressesRes {
  data: OrganizationAddressDto[]
  commonErrors: []
  errors: []
  paging: PagingResponse
}
