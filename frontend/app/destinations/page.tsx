'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { destinationsAPI } from '@/lib/api'
import type { Destination } from '@/lib/api'
import { MapPin, Eye, Loader2 } from 'lucide-react'

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destinationsData, regionsData] = await Promise.all([
          destinationsAPI.list({ limit: 100 }),
          destinationsAPI.getRegions(),
        ])
        setDestinations(destinationsData)
        setRegions(regionsData)
      } catch (error) {
        console.error('Failed to fetch destinations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredDestinations = selectedRegion
    ? destinations.filter((d) => d.region === selectedRegion)
    : destinations

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Explore China</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Discover the most fascinating destinations across China, from ancient capitals
            to modern metropolises.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Region Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedRegion('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !selectedRegion
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Regions
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedRegion === region
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No destinations found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <div className="relative h-48 bg-primary-100">
                  {destination.cover_image ? (
                    <img
                      src={destination.cover_image}
                      alt={destination.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-primary-300" />
                    </div>
                  )}
                  {destination.is_featured && (
                    <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition">
                      {destination.name_en}
                    </h2>
                    {destination.name_zh && (
                      <span className="text-gray-400 text-sm">{destination.name_zh}</span>
                    )}
                  </div>
                  {destination.region && (
                    <p className="text-sm text-gray-500 mb-3">{destination.region}</p>
                  )}
                  {destination.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {destination.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {destination.view_count} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
