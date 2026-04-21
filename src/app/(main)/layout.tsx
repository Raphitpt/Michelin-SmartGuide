import BottomNav from '@/components/BottomNav'

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-michelin-cream">
      {children}
      <BottomNav />
    </div>
  )
}
