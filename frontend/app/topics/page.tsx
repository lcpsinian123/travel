'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { topicsAPI, postsAPI } from '@/lib/api'
import type { Topic, Post } from '@/lib/api'
import { Tag, Loader2, Eye, Heart } from 'lucide-react'

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicsAPI.list({ limit: 50 })
        setTopics(data)
      } catch (error) {
        console.error('Failed to fetch topics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Topics</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Explore travel topics and find guides that match your interests
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {topics.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No topics yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Tag className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{topic.name}</h2>
                    <p className="text-sm text-gray-500">{topic.post_count} posts</p>
                  </div>
                </div>
                {topic.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{topic.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
