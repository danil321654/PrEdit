import { FieldAttributes } from 'formik'
import { FilterFieldRecord } from '../fields'
import { FormControlProps } from '@material-ui/core'

export interface FormFilterFieldProps {
  field: FilterFieldRecord
  fieldAttributes?: FieldAttributes<any>
  formControlAttributes?: FormControlProps
}

export interface FilterFieldProps {
  operation?: string
}
