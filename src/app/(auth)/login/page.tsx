import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Mini header */}
      <header className="bg-white px-4 py-3 flex items-center shrink-0">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-michelin-black">SmartGuide</span>
        </Link>
      </header>

      {/* Dark section */}
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8" style={{ backgroundColor: '#1C0907' }}>

        {/* Logo centré */}
        <div className="flex justify-center mb-12">
          <Image
            src="/michelin_star_login.svg"
            alt="Michelin"
            width={90}
            height={98}
            priority
          />
        </div>

        {/* Spacer pousse le contenu vers le bas */}
        <div className="flex-1" />

        {/* Titre */}
        <h1 className="text-white font-bold text-3xl leading-tight mb-8">
          Prêt à decouvrir<br />le guide Michelin<br />autrement&nbsp;?
        </h1>

        {/* Boutons */}
        <div className="flex flex-col gap-3 mb-8">
          <Link
            href="/login/client"
            className="w-full bg-michelin-red text-white text-sm font-medium text-center py-4 transition-opacity hover:opacity-90"
          >
            Je suis un client
          </Link>
          <Link
            href="/login/restaurant"
            className="w-full bg-white text-michelin-black text-sm font-medium text-center py-4 transition-opacity hover:opacity-90"
          >
            Je suis un restaurant
          </Link>
        </div>

        {/* Skip */}
        <Link
          href="/"
          className="text-center text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Passer l&apos;étape de connexion
        </Link>

      </div>
    </div>
  )
}
