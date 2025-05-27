import React from 'react'
import { ContentWrapper } from 'vtex.my-account-commons'
import { Route } from 'vtex.my-account-commons/Router'
import { index as RichText } from 'vtex.rich-text'

import styles from './styles/index.module.css'
import type { MyPageProps, PageMessages } from './types'
import { Footer } from './components/Footer'
import { OrderList } from './components/OrderList'
import { Button } from './components/ui/button'
import { OrderDetails } from './components/OrderDetails'

const Content = ({ history }: MyPageProps, { header }: PageMessages) => {
  const defaultHeader = {
    text: header?.text ?? '',
    link: {
      url: header?.link.url ?? '',
      text: header?.link.text ?? '',
    },
  }

  const headerContent = (
    <div className={styles.headerStyles}>
      <div className={styles.textMuted}>
        <RichText text={defaultHeader.text} />
      </div>

      <Button variant="orange" to={defaultHeader.link.url} target="_blank" rel="noreferrer" isLink>
        Trocar Pedido
      </Button>
    </div>
  )

  const backButtonConfigs = {
    // title: intl.formatMessage({ id: 'commons.back' }),
    title: 'Voltar',
    path: '/',
  }

  return (
    <ContentWrapper
      title="Meus Pedidos"
      headerContent={headerContent}
      backButton={backButtonConfigs}
      hideBackButton={false}
      namespace="myOrders"
    >
      {() => (
        <div className={styles.container}>
          <OrderList history={history} />
          <Footer />
        </div>
      )}
    </ContentWrapper>
  )
}

const Details = ({ match }: MyPageProps) => {
  const {
    params: { orderId },
  } = match

  const backButtonConfigs = {
    title: 'Voltar para Meus Pedidos',
    path: '/myOrders',
  }

  return (
    <ContentWrapper
      title={`Pedido #${orderId}`}
      backButton={backButtonConfigs}
      hideBackButton={false}
      namespace="myOrdersDetails"
    >
      {() => (
        <div className={styles.container}>
          <OrderDetails match={match} />
        </div>
      )}
    </ContentWrapper>
  )
}

const Page = (props: PageMessages) => {
  return (
    <Route
      path="/myOrders/:orderId?"
      exact
      component={(route: MyPageProps) => {
        if (route.match.params.orderId) return Details(route)

        return Content(route, props)
      }}
    />
  )
}

export default Page
