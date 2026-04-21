import HomePage from '@/components/HomePage'
import HomeRestaurantList from '@/components/HomeRestaurantList'

export default function Home() {
  return <HomePage restaurantList={<HomeRestaurantList />} />
}
