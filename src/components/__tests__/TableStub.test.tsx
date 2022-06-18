import React from 'react'
import { TableStub } from '../TableStub'
import { renderWithStore } from '../../testUtils'
import { PrintFormContext } from '../PrintFormContext'

describe('TableStub', () => {
  const entityName = 'Шаблоны'
  it('does not show label on deal products load', () => {
    const { queryByText, container } = renderWithStore(
      <PrintFormContext.Provider value={{ isDealProductLoading: true } as any}>
        <TableStub entityName={entityName} label={entityName} />,
      </PrintFormContext.Provider>,
    )
    const loader = container.querySelector('.MuiCircularProgress-root')
    const titleElement = queryByText(entityName)
    const image = container.querySelector('img')

    expect(loader).toBeInTheDocument()
    expect(titleElement).not.toBeInTheDocument()
    expect(image).not.toBeInTheDocument()
  })
  it('shows label and image after deal products load', () => {
    const { queryByText, container } = renderWithStore(
      <PrintFormContext.Provider value={{ isDealProductLoading: false } as any}>
        <TableStub
          entityName={entityName}
          image="some image"
          label={entityName}
        />
        ,
      </PrintFormContext.Provider>,
    )

    const titleElement = queryByText(entityName)
    const image = container.querySelector('img')
    expect(titleElement).toBeInTheDocument()
    expect(image).toBeInTheDocument()
  })
  it('shows default label when label is not passed', () => {
    const { queryByText } = renderWithStore(
      <PrintFormContext.Provider value={{ isDealProductLoading: false } as any}>
        <TableStub entityName={entityName} image="some image" />,
      </PrintFormContext.Provider>,
    )

    const defaultLabel = `В данный момент у вас отсутствуют записи в объекте ${entityName}`
    const titleElement = queryByText(defaultLabel)
    expect(titleElement).toBeInTheDocument()
  })
})
