import { List, Record } from 'immutable'
import { imagesPerPage } from '../constants'
import { PrintFormsImageParams, PrintFormsImageRecord } from './PrintFormImage'

const defaultValue = {
  images: List<PrintFormsImageRecord>(),
  allImagesLoaded: false,
}

export type PrintFormsImageDataParams = ReturnType<
  PrintFormsImageDataRecord['toParams']
>
export class PrintFormsImageDataRecord extends Record(defaultValue) {
  public toParams() {
    return this.toJSON()
  }

  public static create(params: PrintFormsImageDataParams) {
    return new PrintFormsImageDataRecord(params)
  }

  public addImage(img: Partial<PrintFormsImageParams>) {
    return this.fillAllImages(
      this.images.push(PrintFormsImageRecord.create(img)),
    )
  }

  public setImage(image: Partial<PrintFormsImageParams>) {
    const index = this.images.findIndex(img => img.id === image.id)
    const oldItem = this.images.get(index)

    if (oldItem) {
      return this.fillImages(
        this.images.remove(index).unshift(
          PrintFormsImageRecord.create({
            ...oldItem.toParams(),
            ...image,
          }),
        ),
      )
    }

    return this
  }

  public deleteImageById(id: string) {
    return this.update('images', items =>
      items.filterNot(item => item.id === id),
    )
  }

  public fillImages(
    imgs: PrintFormsImageRecord[] | List<PrintFormsImageRecord>,
  ) {
    if (this.get('allImagesLoaded')) {
      return this
    }
    const imgList = List(imgs)
    const oldImages = this.get('images')
    const newUniqueImages = imgList.filter(img => !oldImages.includes(img))

    return this.merge({
      allImagesLoaded: imgList.size < imagesPerPage,
      images: oldImages.push(...newUniqueImages.toArray()),
    })
  }

  public fillAllImages(
    imgs: PrintFormsImageRecord[] | List<PrintFormsImageRecord>,
  ) {
    const images = List(imgs)
    return this.merge({
      allImagesLoaded: images.size < imagesPerPage,
      images,
    })
  }

  public incrementUsed(src: string) {
    return this.update('images', items =>
      items.map(item =>
        item.src === src
          ? item.update('timesUsed', timesUsed => timesUsed + 1)
          : item,
      ),
    )
  }

  public decrementUsed(src: string) {
    return this.update('images', items =>
      items.map(item =>
        item.src === src
          ? item.update('timesUsed', timesUsed => timesUsed - 1)
          : item,
      ),
    )
  }
}
