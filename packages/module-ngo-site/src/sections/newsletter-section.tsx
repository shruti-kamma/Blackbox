import { NewsletterForm } from "./newsletter-form";

export function NewsletterSection() {
  return (
    <section className="border-b border-border py-16 md:py-20">
      <div className="mx-auto w-full max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Stay informed. Stay inclusive.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Get research, opportunities, data and developments from India&rsquo;s disability ecosystem.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-md text-left">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
