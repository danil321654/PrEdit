import { Record } from "immutable"

const defaultValue = {
  id: "",
  name: "",
  src: undefined as string | undefined,
  timesUsed: 0,
}

export type PrintFormsImageParams = ReturnType<
  PrintFormsImageRecord["toParams"]
>

export class PrintFormsImageRecord extends Record(defaultValue) {
  public toParams() {
    return this.toJSON()
  }

  public static create(params: Partial<PrintFormsImageParams>) {
    return new PrintFormsImageRecord({
      id: params.id,
      name: params.name,
      src: `/print-form/image/${params.id}`,
    })
  }
}
