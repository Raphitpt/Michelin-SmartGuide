// src/app/(sensoriel)/layout.tsx
export default function SensorielLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#191919]">
      {children}
    </div>
  )
}
