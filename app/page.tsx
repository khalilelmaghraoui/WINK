import Link from "next/link";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wink-focus";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-wink-background text-wink-text">
      <header className="mx-auto flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-10">
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
          Create an invite
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-[960px] gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-center lg:px-10 lg:pt-16">
        <div className="min-w-0 space-y-7">
          <div className="max-w-[680px] space-y-4">
            <p className="text-sm font-semibold uppercase text-wink-primary">
              Private playful invitations
            </p>
            <h1 className="break-words font-display text-4xl font-semibold leading-[1.06] text-wink-text sm:text-6xl">
              Make the ask unforgettable.
            </h1>
            <p className="text-base leading-7 text-wink-text-secondary sm:text-lg sm:leading-8">
              Create a playful invite link, share it privately, and keep your
              own private status link to see their response.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className={`inline-flex min-h-11 items-center justify-center rounded-md bg-wink-primary px-5 py-3 text-sm font-semibold text-wink-surface transition-colors duration-200 hover:bg-wink-primary-hover ${focusRing}`}
              href="/create"
            >
              Create an invite
            </Link>
            <p className="flex min-h-11 items-center text-sm text-wink-text-secondary">
              No account required. Alpha-stage, not user-validated yet.
            </p>
          </div>
        </div>

        <SampleInvitePreview />
      </section>

      <section
        aria-labelledby="how-it-works-heading"
        className="mx-auto w-full max-w-[960px] px-5 py-10 sm:px-8 lg:px-10"
      >
        <div className="space-y-6 border-y border-wink-border py-8">
          <div className="max-w-[680px] space-y-2">
            <h2
              className="font-display text-3xl font-semibold text-wink-text"
              id="how-it-works-heading"
            >
              How it works
            </h2>
            <p className="text-base leading-7 text-wink-text-secondary">
              One private link for them. One private link for you. No account
              required, and WINK does not send notifications yet.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            <Step
              body="Write the invite and choose the vibe."
              number="01"
              title="Create"
            />
            <Step
              body="Send the recipient link and keep your private sender link."
              number="02"
              title="Share"
            />
            <Step
              body="They can say Yes, Raincheck, or No. If they decline, they may leave one optional message."
              number="03"
              title="See the answer"
            />
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="trust-heading"
        className="mx-auto grid w-full max-w-[960px] gap-4 px-5 py-10 sm:px-8 md:grid-cols-2 lg:px-10"
      >
        <h2 className="sr-only" id="trust-heading">
          Consent and private sender link notes
        </h2>
        <InfoNote
          body="WINK can be playful, but it should never trap someone into saying yes. Declining remains clear, simple, and complete."
          eyebrow="Consent stays visible"
          headingId="no-stays-easy-heading"
          title="No stays easy."
        />
        <InfoNote
          body="After creating an invite, WINK gives you a private link to check the response. Anyone with that link can view the sender status page, so keep it private."
          eyebrow="Sender status"
          headingId="private-sender-link-heading"
          title="Keep your private sender link."
        />
      </section>

      <section
        aria-labelledby="modes-heading"
        className="mx-auto w-full max-w-[960px] px-5 py-10 sm:px-8 lg:px-10"
      >
        <div className="space-y-6">
          <div className="max-w-[680px] space-y-2">
            <h2
              className="font-display text-3xl font-semibold text-wink-text"
              id="modes-heading"
            >
              Two ways to make the ask
            </h2>
            <p className="text-base leading-7 text-wink-text-secondary">
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

      <section className="mx-auto w-full max-w-[960px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="space-y-5 border-t border-wink-border pt-8">
          <h2 className="max-w-[680px] font-display text-3xl font-semibold text-wink-text">
            Send one invite. Keep one private status link.
          </h2>
          <p className="max-w-[680px] text-base leading-7 text-wink-text-secondary">
            WINK is an alpha for private invitations: playful enough to feel
            memorable, clear enough that Yes, Raincheck, and No all stay easy.
            It does not send notifications yet.
          </p>
          <Link
            className={`inline-flex min-h-11 items-center justify-center rounded-md bg-wink-primary px-5 py-3 text-sm font-semibold text-wink-surface transition-colors duration-200 hover:bg-wink-primary-hover ${focusRing}`}
            href="/create"
          >
            Create an invite
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-[960px] px-5 pb-8 text-sm text-wink-text-secondary sm:px-8 lg:px-10">
        WINK / DateCard. A playful private invitation link, not a dating app.
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
          <PreviewDetail label="Sender" value="Alex" />
          <PreviewDetail label="Recipient" value="Sam" />
          <PreviewDetail label="Place" value="A quiet coffee spot" />
          <PreviewDetail label="When" value="Friday evening" />
        </dl>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-wink-text-secondary">
            Demo-only response choices
          </p>
          <div aria-hidden="true" className="grid gap-2 sm:grid-cols-3">
            <span className="rounded-md bg-wink-primary/70 px-3 py-2 text-center text-sm font-semibold text-wink-surface">
              Yes
            </span>
            <span className="rounded-md border border-wink-border bg-wink-surface-muted px-3 py-2 text-center text-sm font-semibold text-wink-text">
              Raincheck
            </span>
            <span className="rounded-md border border-wink-border bg-wink-surface-muted px-3 py-2 text-center text-sm font-semibold text-wink-text">
              No
            </span>
          </div>
        </div>
        <p className="text-xs leading-5 text-wink-text-secondary">
          Static preview only. These are not live buttons, no invite is created,
          and no route is opened from this card.
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

function InfoNote({
  body,
  eyebrow,
  headingId,
  title
}: {
  body: string;
  eyebrow: string;
  headingId: string;
  title: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="space-y-3 rounded-lg border border-wink-border bg-wink-surface p-5"
    >
      <p className="text-xs font-semibold uppercase text-wink-primary">
        {eyebrow}
      </p>
      <h2
        className="font-display text-2xl font-semibold text-wink-text"
        id={headingId}
      >
        {title}
      </h2>
      <p className="leading-7 text-wink-text-secondary">{body}</p>
    </section>
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
