import { AppEpic } from '../types'
import { IMAGES_KEY } from '../constants'
import { isActionOf } from 'typesafe-actions'
import { imagesSelector } from '../selectors'
import { from, asyncScheduler, scheduled, of } from 'rxjs'
import {
  filter,
  mergeMap,
  map,
  catchError,
  withLatestFrom,
} from 'rxjs/operators'
import {
  imagesFetchAction,
  imagesCreateAction,
  // imagesDeleteAction,
} from '../actions'

export const imageRequestEpic: AppEpic = (
  action$,
  _state$,
  { apiClient: _apiClient }
) =>
  action$.pipe(
    filter(isActionOf(imagesFetchAction.request)),
    mergeMap(() =>
      from(
        (async () => JSON.parse(localStorage.getItem(IMAGES_KEY) ?? '[]'))()
        // {
        // const { data } = await apiClient.get<ArrayBuffer>(`/file/${payload}`)
        // const blob = new Blob([data])

        // const reader = new FileReader()

        // const promise = new Promise<string>(
        //   (resolve) =>
        //     (reader.onload = (e) =>
        //       e.target ? resolve(e.target.result as string) : '')
        // )

        // reader.readAsDataURL(blob)

        // return await promise
        // }
      ).pipe(
        mergeMap((id) => of(imagesFetchAction.success(id))),
        catchError((error) =>
          scheduled([imagesFetchAction.failure(error)], asyncScheduler)
        )
      )
    )
  )

export const printFormsImagesCreateEpic: AppEpic = (
  action$,
  state$,
  { apiClient }
) =>
  action$.pipe(
    filter(isActionOf(imagesCreateAction.request)),
    withLatestFrom(state$),
    mergeMap(([{ payload }, state]) =>
      from(
        apiClient.post<string>(`/file`, payload.file, {
          onUploadProgress: payload.onUploadProgress || undefined,
        })
      ).pipe(
        map(({ data }) => {
          if (payload.markIsCompleted) payload.markIsCompleted()
          const images = imagesSelector(state).toArray()
          const newImage = { id: data, name: payload.name }
          localStorage.setItem(
            IMAGES_KEY,
            JSON.stringify([...images, newImage])
          )
          return imagesCreateAction.success(newImage)
        }),
        catchError((error) => {
          if (payload.markIsError)
            payload.markIsError(error.response.data.message)
          return scheduled(
            [
              imagesCreateAction.failure(
                error.response
                  ? error.response.data?.message
                  : 'Возникла ошибка во время добавления изображения!'
              ),
            ],
            asyncScheduler
          )
        })
      )
    )
  )

// export const printFormsImagesDeleteEpic: AppEpic = (
//   action$,
//   state$,
//   { apiClient }
// ) =>
//   action$.pipe(
//     filter(isActionOf(printFormsImagesDeleteAction.request)),
//     withLatestFrom(state$),
//     mergeMap(([{ payload }, state]) =>
//       from(
//         !printFormImageUsed(payload.imageId)(state)
//           ? apiClient.delete(
//               `${printFormsApiServer}/image/${payload.imageId}`,
//               {
//                 withCredentials: true,
//               }
//             )
//           : (async () => {
//               throw new Error('Нельзя удалить используемый в формах рисунок')
//             })()
//       ).pipe(
//         map(() =>
//           printFormsImagesDeleteAction.success({ imageId: payload.imageId })
//         ),
//         catchError((error) => {
//           const serverErrorMessage =
//             error.response?.data?.message ?? error.message
//           return scheduled(
//             [
//               notificationsAddErrorAction(
//                 serverErrorMessage ??
//                   'Возникла ошибка во время удаления изображения!'
//               ),
//             ],
//             asyncScheduler
//           )
//         })
//       )
//     )
//   )
