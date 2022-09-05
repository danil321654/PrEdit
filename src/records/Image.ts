import { Record } from 'immutable'

const defaultValue = {
  id: '',
  name: '',
  src: undefined as string | undefined,
  timesUsed: 0,
}

export type ImageParams = ReturnType<ImageRecord['toParams']>

export class ImageRecord extends Record(defaultValue) {
  public toParams() {
    return this.toJSON()
  }

  public static create(params: Partial<ImageParams>) {
    return new ImageRecord({
      id: params.id,
      name: params.name,
      src: `/file/${params.id}`,
    })
  }
}
