import { AppState } from '../types'
import { createSelector } from 'reselect'

export const imagesSelector = createSelector(
  (state: AppState) => state.imagesData.images,
  (images) => images
)
