import type { RouteComponentProps } from 'react-router-dom'

export interface PageMessages {
  messages: {
    loading: string
    error: string
  }
  header?: {
    text: string
    link: Link
  }
}

interface Link {
  url: string
  text: string
}

export interface MyPageProps extends PageMessages {
  history: RouteComponentProps['history']
  match: RouteComponentProps<{ orderId?: string }>['match']
}
