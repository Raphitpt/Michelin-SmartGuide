import RestaurantDetailPage from '@/components/RestaurantDetailPage'

export default async function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RestaurantDetailPage id={id} />
}
