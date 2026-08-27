'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { homeAPI } from '@/lib/api'
import type { HomeData } from '@/lib/api'
import { Mountain, Compass, Users, BookOpen, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeData = await homeAPI.getHomeData(10)
        setData(homeData)
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Discover China Like a Local
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              A community-driven platform for international travelers
              exploring China. Real stories, authentic experiences.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/destinations"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Explore Destinations
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why ChinaTravel?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Mountain className="w-8 h-8" />} title="Curated Destinations" description="Hand-picked places beyond the tourist trail" />
            <FeatureCard icon={<Compass className="w-8 h-8" />} title="Local Insights" description="Tips from travelers who've been there" />
            <FeatureCard icon={<Users className="w-8 h-8" />} title="Community Q&A" description="Get answers from locals and experienced travelers" />
            <FeatureCard icon={<BookOpen className="w-8 h-8" />} title="Travel Guides" description="Comprehensive guides in English" />
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      {data?.destinations && data.destinations.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Popular Destinations</h2>
              <Link href="/destinations" className="text-primary-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {data.destinations.slice(0, 6).map((d) => (
                <DestinationCard key={d.id} name={d.name_en} nameZh={d.name_zh} slug={d.slug} coverImage={d.cover_image} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {data?.latest_posts && data.latest_posts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Latest Travel Guides</h2>
              <Link href="/posts" className="text-primary-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.latest_posts.slice(0, 6).map((post) => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
                  <div className="h-40 bg-primary-100">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                        <BookOpen className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-500">{post.author.display_name || post.author.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Questions */}
      {data?.latest_questions && data.latest_questions.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Recent Questions</h2>
              <Link href="/questions" className="text-primary-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="space-y-4">
              {data.latest_questions.slice(0, 5).map((q) => (
                <Link key={q.id} href={`/questions/${q.id}`} className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-900 mb-1">{q.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{q.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers discovering the real China.
            Share your experiences and help others.
          </p>
          <Link href="/register" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-white font-bold text-lg">ChinaTravel</span>
              <p className="text-sm mt-1">Discover China like a local</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="hover:text-white transition">About</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © {new Date().getFullYear()} ChinaTravel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function DestinationCard({ name, nameZh, slug, coverImage }: { name: string; nameZh?: string; slug: string; coverImage?: string }) {
  return (
    <Link href={`/destinations/${slug}`} className="group relative h-64 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
      {coverImage ? (
        <img src={coverImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      ) : (
        <div className="absolute inset-0 bg-primary-600 group-hover:scale-105 transition duration-300" />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
        {nameZh && <p className="text-white/80 text-sm">{nameZh}</p>}
        <p className="text-primary-100 text-sm mt-2">Explore destinations →</p>
      </div>
    </Link>
  )
}
