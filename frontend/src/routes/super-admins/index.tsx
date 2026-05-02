import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/super-admins/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/super-admins/"!</div>
}
