import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="rounded-3xl border border-border bg-card/60 p-10 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground">
              Page Not Found
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                We could not find that page
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                The link may be broken or the page may have been moved. You can
                head back to the dashboard or return to the homepage.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Go To Login</Link>
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6">
              <div className="text-sm text-muted-foreground">
                Tip: If you think this is a mistake, check the URL or contact
                support.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
