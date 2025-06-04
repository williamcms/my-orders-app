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

export interface ErrorResponse {
  message: string
  name: string
  stack: string
  config: {
    transitional: {
      silentJSONParsing: boolean
      forcedJSONParsing: boolean
      clarifyTimeoutError: boolean
    }
    adapter: string[]
    transformRequest: unknown[]
    transformResponse: unknown[]
    timeout: 0
    xsrfCookieName: string
    xsrfHeaderName: string
    maxContentLength: number
    maxBodyLength: number
    env: Record<string, unknown>
    headers: Record<string, string>
    method: string
    url: string
    allowAbsoluteUrls: boolean
  }
  code: string
  status: number
}
