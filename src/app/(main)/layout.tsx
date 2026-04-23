import BottomNav from '@/components/ui/BottomNav'

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-michelin-cream">
      {children}
      <BottomNav />
    </div>
  )
}
