import RestaurantCard from '@/components/RestaurantCard'

const RESTAURANTS = [
  { id: 1, name: 'Le Grand Véfour', location: 'Paris, France', cuisine: 'Cuisine française', price: '€€€€', stars: 3 as const },
  { id: 2, name: 'Septime', location: 'Paris, France', cuisine: 'Cuisine moderne', price: '€€€', stars: 1 as const },
  { id: 3, name: 'Maison Lameloise', location: 'Chagny, France', cuisine: 'Cuisine bourguignonne', price: '€€€€', stars: 3 as const },
  { id: 4, name: 'Le Baratin', location: 'Paris, France', cuisine: 'Bistrot', price: '€€' },
  { id: 5, name: 'Mirazur', location: 'Menton, France', cuisine: 'Cuisine méditerranéenne', price: '€€€€', stars: 3 as const },
  { id: 6, name: 'Frenchie', location: 'Paris, France', cuisine: 'Cuisine moderne', price: '€€€', stars: 1 as const },
  { id: 7, name: 'Lasserre', location: 'Paris, France', cuisine: 'Cuisine classique', price: '€€€€', stars: 2 as const },
  { id: 8, name: 'Café de Flore', location: 'Paris, France', cuisine: 'Brasserie', price: '€€' },
]

export default function RestaurantList() {
  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8 md:px-8 lg:px-12">
      <h1 className="text-2xl font-bold text-michelin-black mb-6">Restaurants</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESTAURANTS.map((r) => (
          <RestaurantCard
            key={r.id}
            name={r.name}
            location={r.location}
            cuisine={r.cuisine}
            price={r.price}
            stars={r.stars}
            href={`/restaurants/${r.id}`}
          />
        ))}
      </div>
    </main>
  )
}
