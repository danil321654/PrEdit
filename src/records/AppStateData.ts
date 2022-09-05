import { Record as ImmutableRecord } from 'immutable'

const defaultValues = {
  templatesListIsOpen: false,
  documentsListIsOpen: false,
}

export type AppStateDataParams = ReturnType<AppStateDataRecord['toParams']>

export class AppStateDataRecord extends ImmutableRecord(defaultValues) {
  public toParams() {
    return this.toJSON()
  }

  public setTemplatesListIsOpen(isOpen: boolean) {
    return this.set('templatesListIsOpen', isOpen)
  }

  public setDocumentsListIsOpen(isOpen: boolean) {
    return this.set('documentsListIsOpen', isOpen)
  }

  public mergeAppState(params: Partial<AppStateDataParams>) {
    return this.merge(params)
  }
}
