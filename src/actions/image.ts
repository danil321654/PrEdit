import { ImageParams } from '../records'
import { createAsyncAction } from 'typesafe-actions'

export const imagesFetchAction = createAsyncAction(
  'FETCH_IMAGE_REQUEST',
  'FETCH_IMAGE_SUCCESS',
  'FETCH_IMAGE_FAILURE'
)<undefined, Partial<ImageParams>[], Error>()

export const imagesDeleteAction = createAsyncAction(
  'DELETE_IMAGE_REQUEST',
  'DELETE_IMAGE_SUCCESS',
  'DELETE_IMAGE_FAILURE'
)<string, string, Error>()

export const imagesCreateAction = createAsyncAction(
  'CREATE_IMAGE_REQUEST',
  'CREATE_IMAGE_SUCCESS',
  'CREATE_IMAGE_FAILURE'
)<
  {
    name: string
    file: FormData
    onUploadProgress?: (progressEvent: ProgressEvent) => void
    markIsCompleted?: () => void
    markIsError?: (key: string) => void
  },
  Partial<ImageParams>,
  Error
>()
