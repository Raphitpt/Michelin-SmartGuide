import RestaurantDetailPage from '@/components/RestaurantDetailPage'
import PageTransition from '@/components/PageTransition'

export default async function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PageTransition>
      <RestaurantDetailPage id={id} />
    </PageTransition>
  )
}
