'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { topicsAPI, postsAPI } from '@/lib/api'
import type { Topic, Post } from '@/lib/api'
import { Tag, Loader2, ArrowLeft, Eye, Heart, BookOpen } from 'lucide-react'

export default function TopicDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicData = await topicsAPI.getBySlug(slug)
        setTopic(topicData)
        // Fetch posts with this topic tag
        const postsData = await postsAPI.list({ tag: slug, limit: 20 })
        setPosts(postsData)
      } catch (err) {
        setError('Topic not found')
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

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h1>
        <Link href="/topics" className="text-primary-600 hover:underline">Back to topics</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <Link href="/topics" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to topics
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
              <Tag className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{topic.name}</h1>
              <p className="text-gray-500">{topic.post_count} posts</p>
            </div>
          </div>
          {topic.description && (
            <p className="mt-6 text-gray-600 max-w-2xl">{topic.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No posts in this topic yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                {post.cover_image && (
                  <div className="h-40 bg-gray-100">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.view_count}</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.like_count}</span>
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
