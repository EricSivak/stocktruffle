import { Link } from "@tanstack/react-router"

/** Shown for unknown paths and for stocks, screens or research the data doesn't have. */
export function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-8 pt-[18vh]">
      <h1 className="title">Not found</h1>
      <p className="mt-3 text-muted-foreground">
        This page doesn&apos;t exist, or the stock isn&apos;t in the data.
      </p>
      <Link
        to="/"
        className="mt-5 inline-block underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        Back to start
      </Link>
    </div>
  )
}
