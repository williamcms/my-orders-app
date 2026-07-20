import { csx } from '@vtex/admin-ui'

/** Secondary detail line rendered under a table cell's main text */
export const secondaryLine = csx({ color: '$secondary', text: '$detail' })

/** Search field sizing, matching the wallet report layout */
export const searchField = csx({
  input: {
    height: '2.25rem',
    width: '21rem',
    borderColor: '$gray30',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
})
