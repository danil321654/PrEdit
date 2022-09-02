import { List, Record } from 'immutable'
import { imagesPerPage } from '../constants'
import { ImageParams, ImageRecord } from './Image'

const defaultValue = {
  images: List<ImageRecord>(),
  allImagesLoaded: false,
}

export type PrintFormsImageDataParams = ReturnType<ImageDataRecord['toParams']>
export class ImageDataRecord extends Record(defaultValue) {
  public toParams() {
    return this.toJSON()
  }

  public static create(params: PrintFormsImageDataParams) {
    return new ImageDataRecord(params)
  }

  public addImage(img: Partial<ImageParams>) {
    return this.fillAllImages(this.images.push(ImageRecord.create(img)))
  }

  public setImage(image: Partial<ImageParams>) {
    const index = this.images.findIndex((img) => img.id === image.id)
    const oldItem = this.images.get(index)

    if (oldItem) {
      return this.fillImages(
        this.images.remove(index).unshift(
          ImageRecord.create({
            ...oldItem.toParams(),
            ...image,
          })
        )
      )
    }

    return this
  }

  public deleteImageById(id: string) {
    return this.update('images', (items) =>
      items.filterNot((item) => item.id === id)
    )
  }

  public fillImages(imgs: ImageRecord[] | List<ImageRecord>) {
    if (this.get('allImagesLoaded')) {
      return this
    }
    const imgList = List(imgs)
    const oldImages = this.get('images')
    const newUniqueImages = imgList.filter((img) => !oldImages.includes(img))

    return this.merge({
      allImagesLoaded: imgList.size < imagesPerPage,
      images: oldImages.push(...newUniqueImages.toArray()),
    })
  }

  public fillAllImages(imgs: ImageRecord[] | List<ImageRecord>) {
    const images = List(imgs)
    return this.merge({
      allImagesLoaded: images.size < imagesPerPage,
      images,
    })
  }

  public incrementUsed(src: string) {
    return this.update('images', (items) =>
      items.map((item) =>
        item.src === src
          ? item.update('timesUsed', (timesUsed) => timesUsed + 1)
          : item
      )
    )
  }

  public decrementUsed(src: string) {
    return this.update('images', (items) =>
      items.map((item) =>
        item.src === src
          ? item.update('timesUsed', (timesUsed) => timesUsed - 1)
          : item
      )
    )
  }
}
