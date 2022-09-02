import { AppActions } from '../types'
import { isActionOf } from 'typesafe-actions'
import { ImageRecord, ImageDataRecord } from '../records'
import {
  imagesCreateAction,
  imagesDeleteAction,
  imagesFetchAction,
} from '../actions'

const initialState = new ImageDataRecord()

export const imagesData = (state = initialState, action: AppActions) => {
  if (isActionOf(imagesFetchAction.success, action)) {
    const images = action.payload.map((item) => ImageRecord.create(item))

    return state.fillImages(images)
  }

  if (isActionOf(imagesDeleteAction.success, action)) {
    return state.deleteImageById(action.payload)
  }

  if (isActionOf(imagesCreateAction.success, action)) {
    const data = action.payload

    return state.addImage(ImageRecord.create(data))
  }

  //   if (isActionOf(printFormImageMount, action)) {
  //     return state.incrementUsed(action.payload)
  //   }

  //   if (isActionOf(printFormImageUnmount, action)) {
  //     return state.decrementUsed(action.payload)
  //   }

  //   if (isActionOf([printFormsClearStore], action)) {
  //     return new ImageDataRecord()
  //   }

  return state
}
