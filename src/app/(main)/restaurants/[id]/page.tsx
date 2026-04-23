import RestaurantDetailPage from '@/components/restaurant/RestaurantDetailPage'
import PageTransition from '@/components/ui/PageTransition'

export default async function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PageTransition>
      <RestaurantDetailPage id={id} />
    </PageTransition>
  )
}
