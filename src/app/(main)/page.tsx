import HomePage from '@/components/HomePage'
import HomeRestaurantList from '@/components/HomeRestaurantList'
import PageTransition from '@/components/PageTransition'

export default function Home() {
  return (
    <PageTransition>
      <HomePage restaurantList={<HomeRestaurantList />} />
    </PageTransition>
  )
}
