import Link from "next/link";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wink-focus";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-wink-background text-wink-text">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-12">
        <Link
          className={`font-display text-xl font-semibold text-wink-text ${focusRing}`}
          href="/"
        >
          WINK
        </Link>
        <Link
          className={`inline-flex min-h-11 items-center justify-center rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text transition-colors duration-200 hover:border-wink-primary hover:text-wink-primary ${focusRing}`}
          href="/create"
        >
          Create an invitation
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] lg:items-center lg:px-12 lg:pt-16">
        <div className="min-w-0 space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-wink-primary">
              WINK private invitations
            </p>
            <h1 className="max-w-3xl break-words font-display text-4xl font-semibold leading-[1.06] text-wink-text sm:text-6xl lg:text-7xl">
              Make the ask memorable.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-wink-text-secondary sm:text-lg sm:leading-8">
              Turn an awkward message into a playful private invitation they
              will actually remember.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className={`inline-flex min-h-11 items-center justify-center rounded-md bg-wink-primary px-5 py-3 text-sm font-semibold text-wink-surface transition-colors duration-200 hover:bg-wink-primary-hover ${focusRing}`}
              href="/create"
            >
              Create an invitation
            </Link>
            <p className="flex min-h-11 items-center text-sm text-wink-text-secondary">
              Act I is technically verified. User validation is still ahead.
            </p>
          </div>
        </div>

        <SampleInvitePreview />
      </section>

      <section
        aria-labelledby="how-it-works-heading"
        className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="space-y-6 border-y border-wink-border py-8">
          <div className="space-y-2">
            <h2
              className="font-display text-3xl font-semibold text-wink-text"
              id="how-it-works-heading"
            >
              How it works
            </h2>
            <p className="max-w-2xl text-base leading-7 text-wink-text-secondary">
              Three small steps. No accounts or sender surveillance.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            <Step
              body="Choose a mode and add the invitation details."
              number="01"
              title="Create"
            />
            <Step body="Send one private link." number="02" title="Share" />
            <Step
              body="The recipient chooses Yes, Raincheck, or No."
              number="03"
              title="Answer"
            />
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="modes-heading"
        className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h2
              className="font-display text-3xl font-semibold text-wink-text"
              id="modes-heading"
            >
              Two ways to make the ask
            </h2>
            <p className="max-w-2xl text-base leading-7 text-wink-text-secondary">
              The alpha keeps the mode set intentionally small: Lawyer and
              Unbothered.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ModePreview
              accent="border-wink-accent"
              description="A charming mock case with typed approval for Yes."
              sample="The evidence strongly supports coffee."
              title="Lawyer"
            />
            <ModePreview
              accent="border-wink-counter-accent"
              description="Dry reverse psychology with the answer always left to the recipient."
              sample="Coffee. Or whatever. No pressure."
              title="Unbothered"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="space-y-5 border-t border-wink-border pt-8">
          <h2 className="max-w-2xl font-display text-3xl font-semibold text-wink-text">
            Start with one invitation.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-wink-text-secondary">
            WINK is an alpha candidate for the existing Act I loop: create,
            share, and let the recipient answer clearly.
          </p>
          <Link
            className={`inline-flex min-h-11 items-center justify-center rounded-md bg-wink-primary px-5 py-3 text-sm font-semibold text-wink-surface transition-colors duration-200 hover:bg-wink-primary-hover ${focusRing}`}
            href="/create"
          >
            Create your invitation
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-8 text-sm text-wink-text-secondary sm:px-8 lg:px-12">
        WINK / DateCard. Private invitations, not a dating app.
      </footer>
    </main>
  );
}

function SampleInvitePreview() {
  return (
    <aside
      aria-labelledby="sample-invitation-heading"
      className="w-full min-w-0 rounded-lg border border-wink-border bg-wink-surface p-5 shadow-[0_18px_50px_rgba(24,21,18,0.08)]"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-wink-text-secondary">
            Sample invitation
          </p>
          <p className="rounded-full border border-wink-accent px-3 py-1 text-xs font-semibold text-wink-text">
            Lawyer mode
          </p>
        </div>

        <div className="space-y-3">
          <h2
            className="break-words font-display text-2xl font-semibold leading-tight text-wink-text sm:text-3xl"
            id="sample-invitation-heading"
          >
            Sam, Alex has a small case to make.
          </h2>
          <p className="leading-7 text-wink-text-secondary">
            I have a small case to make for coffee this Friday.
          </p>
        </div>

        <dl className="grid gap-3 border-y border-wink-border py-4 text-sm sm:grid-cols-2">
          <PreviewDetail label="Date type" value="Coffee date" />
          <PreviewDetail label="When" value="Friday - 7:00 PM" />
          <PreviewDetail label="Place" value="The Corner Cafe" />
          <PreviewDetail label="Tone" value="Funny, lightly formal" />
        </dl>

        <div aria-hidden="true" className="grid gap-2 sm:grid-cols-3">
          <span className="rounded-md bg-wink-primary px-3 py-2 text-center text-sm font-semibold text-wink-surface">
            Yes
          </span>
          <span className="rounded-md border border-wink-border px-3 py-2 text-center text-sm font-semibold text-wink-text">
            Raincheck
          </span>
          <span className="rounded-md border border-wink-border px-3 py-2 text-center text-sm font-semibold text-wink-text">
            No
          </span>
        </div>
        <p className="text-xs leading-5 text-wink-text-secondary">
          Static preview only. Real invites stay private and answerable on their
          own link.
        </p>
      </div>
    </aside>
  );
}

function PreviewDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="font-semibold text-wink-text-secondary">{label}</dt>
      <dd className="break-words text-base text-wink-text">{value}</dd>
    </div>
  );
}

function Step({
  body,
  number,
  title
}: {
  body: string;
  number: string;
  title: string;
}) {
  return (
    <li className="min-h-40 rounded-lg border border-wink-border bg-wink-surface p-5">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-wink-primary">{number}</p>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold text-wink-text">
            {title}
          </h3>
          <p className="leading-7 text-wink-text-secondary">{body}</p>
        </div>
      </div>
    </li>
  );
}

function ModePreview({
  accent,
  description,
  sample,
  title
}: {
  accent: string;
  description: string;
  sample: string;
  title: string;
}) {
  return (
    <article
      className={`min-h-52 rounded-lg border border-l-4 ${accent} bg-wink-surface p-5`}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-semibold text-wink-text">
            {title}
          </h3>
          <p className="text-sm font-semibold text-wink-primary">
            Existing mode
          </p>
        </div>
        <p className="text-lg leading-8 text-wink-text">{sample}</p>
        <p className="leading-7 text-wink-text-secondary">{description}</p>
      </div>
    </article>
  );
}
