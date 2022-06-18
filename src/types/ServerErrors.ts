// TODO: скопировано из SAAS-CORE-PL
export interface ItemServerErrors {
  index?: number
  message: string
  errors: { fieldName: string; message: string }[]
}

export interface TableServerErrors {
  message: string
  details: ItemServerErrors[]
}
