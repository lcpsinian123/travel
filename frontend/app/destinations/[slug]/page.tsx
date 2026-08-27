'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { destinationsAPI, postsAPI } from '@/lib/api'
import type { Destination, Post } from '@/lib/api'
import { MapPin, Eye, ArrowLeft, Loader2, BookOpen } from 'lucide-react'

export default function DestinationDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [destination, setDestination] = useState<Destination | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destData, postsData] = await Promise.all([
          destinationsAPI.getBySlug(slug),
          postsAPI.list({ destination_id: '', limit: 10 }) // Will filter client-side
        ])
        setDestination(destData)
        // Filter posts by destination_id client-side
        const filtered = postsData.filter((p) => p.destination_id === destData.id)
        setPosts(filtered)
      } catch (err) {
        setError('Destination not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !destination) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
        <Link href="/destinations" className="text-primary-600 hover:underline">
          ← Back to destinations
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-80 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link
            href="/destinations"
            className="text-white/80 hover:text-white mb-4 flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to destinations
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {destination.name_en}
          </h1>
          {destination.name_zh && (
            <p className="text-2xl text-white/80">{destination.name_zh}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-white/80">
            {destination.region && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {destination.region}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {destination.view_count} views
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {destination.description || 'No description available.'}
              </p>
            </div>

            {/* Related Posts */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Guides</h2>
              {posts.length === 0 ? (
                <p className="text-gray-500">No travel guides yet for this destination.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-500">
                        By {post.author.display_name || post.author.username} • {post.view_count} views
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Country</dt>
                  <dd className="text-gray-900 font-medium">{destination.country}</dd>
                </div>
                {destination.region && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Region</dt>
                    <dd className="text-gray-900 font-medium">{destination.region}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Views</dt>
                  <dd className="text-gray-900 font-medium">{destination.view_count}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
