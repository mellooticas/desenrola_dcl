import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pedido - Desenrola DCL',
  description: 'Detalhes e gerenciamento de pedido',
}

export default function PedidoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}