import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center shrink-0">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-michelin-black">SmartGuide</span>
        </Link>
      </header>

      {/* Dark section */}
      <div
        className="flex-1 flex flex-col px-6 pt-12 pb-10"
        style={{ background: 'linear-gradient(160deg, #2a1810 0%, #1C0907 45%, #110503 100%)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/michelin_star_login.svg"
            alt="Michelin"
            width={72}
            height={78}
            priority
          />
        </div>

        <div className="flex-1" />

        {/* Tagline */}
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-3">Guide Michelin</p>
          <h1 className="text-white font-bold text-3xl leading-tight">
            Prêt à découvrir<br />le guide autrement ?
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Link
            href="/login/client"
            className="w-full bg-michelin-red text-white text-sm font-semibold text-center py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150"
          >
            Je suis un client
          </Link>
          <Link
            href="/login/restaurant"
            className="w-full bg-white/10 border border-white/20 text-white text-sm font-medium text-center py-4 rounded-sm hover:bg-white/15 active:scale-[0.98] transition-all duration-150"
          >
            Je suis un restaurant
          </Link>
        </div>

        {/* Skip */}
        <Link
          href="/"
          className="text-center text-xs text-white/25 hover:text-white/50 transition-colors"
        >
          Passer l&apos;étape de connexion
        </Link>
      </div>
    </div>
  )
}
