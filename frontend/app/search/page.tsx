'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { searchAPI } from '@/lib/api'
import type { SearchResults } from '@/lib/api'
import { Search, Loader2, MapPin, BookOpen, User, HelpCircle } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q') || ''
    setQuery(q)
    if (q) {
      performSearch(q)
    }
  }, [])

  const performSearch = async (q: string) => {
    setIsLoading(true)
    try {
      const data = await searchAPI.search(q)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.history.pushState({}, '', `?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  const totalResults = results
    ? results.posts.length + results.destinations.length + results.users.length + results.questions.length
    : 0

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>
          <form onSubmit={handleSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, posts, users, questions..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : results ? (
          <>
            <p className="text-gray-600 mb-8">Found {totalResults} results for &ldquo;{query}&rdquo;</p>

            {/* Destinations */}
            {results.destinations.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Destinations
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.destinations.map((d) => (
                    <Link key={d.id} href={`/destinations/${d.slug}`} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <h3 className="font-semibold text-gray-900">{d.name_en}</h3>
                      {d.name_zh && <p className="text-sm text-gray-500">{d.name_zh}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  Travel Guides
                </h2>
                <div className="space-y-4">
                  {results.posts.map((p) => (
                    <Link key={p.id} href={`/posts/${p.slug}`} className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{p.excerpt || p.content}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Users */}
            {results.users.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Users
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.users.map((u) => (
                    <Link key={u.id} href={`/profile/${u.username}`} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="font-medium text-primary-600">{(u.display_name || u.username).charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-900">{u.display_name || u.username}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Questions */}
            {results.questions.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-600" />
                  Questions
                </h2>
                <div className="space-y-4">
                  {results.questions.map((q) => (
                    <Link key={q.id} href={`/questions/${q.id}`} className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <h3 className="font-semibold text-gray-900">{q.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{q.content}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No results found for &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            Enter a search term to find destinations, posts, users, and questions.
          </div>
        )}
      </div>
    </div>
  )
}
