import React from 'react'
import { Grid } from '@material-ui/core'
import { renderWithStore } from '../../testUtils'
import { fireEvent } from '@testing-library/react'
import { CustomAccordion } from '../CustomAccordion'

describe('CustomAccordion', () => {
  it('shows children on click', () => {
    const title = 'Variables'
    const data = [
      {
        name: 'variable',
        label: 'label',
        value: 'value',
      },
    ]

    const { queryByText } = renderWithStore(
      <CustomAccordion summary={title}>
        <Grid container wrap="nowrap" direction="column">
          {data.map((el, i) => (
            <Grid item key={i}>
              {el.label}
            </Grid>
          ))}
        </Grid>
      </CustomAccordion>,
    )

    const titleElement = queryByText(title)
    const accordionChild = queryByText(data[0].label)

    expect(titleElement).toBeInTheDocument()
    expect(accordionChild).toBeInTheDocument()

    expect(accordionChild).not.toBeVisible()
    fireEvent.click(titleElement!)
    expect(accordionChild).toBeVisible()
  })
})
