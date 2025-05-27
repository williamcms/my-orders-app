import React from 'react'

type Props = {
  render: ([{ name, path }]: { name: string; path: string }[]) => React.ReactNode
}

const Link = ({ render }: Props) => {
  return render([
    {
      name: 'Meus Pedidos',
      path: '/myOrders',
    },
  ])
}

export default Link
