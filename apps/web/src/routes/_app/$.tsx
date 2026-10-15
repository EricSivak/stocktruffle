import { createFileRoute, notFound } from "@tanstack/react-router"

// Any path the app does not know lands here, inside the frame and behind the sign-in check.
export const Route = createFileRoute("/_app/$")({
  loader: () => {
    throw notFound()
  },
})
