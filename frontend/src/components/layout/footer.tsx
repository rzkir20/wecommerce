import { Link } from '@tanstack/react-router'

import dashboardData from '../../data/data.json'

export function Footer() {
  const { footer } = dashboardData

  return (
    <footer className="border-t border-border bg-muted/40 px-8 pt-20 pb-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff3f] text-sm font-black text-black">
                L
              </div>
              <span className="text-xl font-extrabold tracking-tighter text-foreground uppercase">
                LUXE
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold tracking-widest text-foreground uppercase">
              Collections
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {footer.collections.map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-[#d4ff3f]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold tracking-widest text-foreground uppercase">
              Company
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {footer.company.map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-[#d4ff3f]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold tracking-widest text-foreground uppercase">
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Subscribe to get early access.
            </p>
            <form className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-bold text-[#d4ff3f] uppercase"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-10 md:flex-row">
          <p className="text-xs text-muted-foreground">{footer.copyright}</p>
          <div className="flex gap-8">
            {footer.legal.map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
