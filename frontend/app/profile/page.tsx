'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { usersAPI } from '@/lib/api'
import type { Post } from '@/lib/api'
import { User, MapPin, Calendar, BookOpen, Heart, Settings, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function MyProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [myCollections, setMyCollections] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'collections'>('posts')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const [posts, collections] = await Promise.all([
          usersAPI.getUserPosts(user.id, 0, 20),
          usersAPI.getMyCollections(0, 20),
        ])
        setMyPosts(posts)
        setMyCollections(collections)
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const displayPosts = activeTab === 'posts' ? myPosts : myCollections

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-5xl font-bold text-primary-600">
                {(user.display_name || user.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.display_name || user.username}
              </h1>
              <p className="text-gray-500 mb-4">@{user.username}</p>
              {user.bio && <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                {user.country && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.country}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {format(new Date(user.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>
            <Link href="/settings" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'posts' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Posts ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'collections' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Collections ({myCollections.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {activeTab === 'posts' ? 'You haven\'t posted anything yet.' : 'You haven\'t saved any posts yet.'}
            </p>
            {activeTab === 'posts' && (
              <Link href="/posts/create" className="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
                {post.cover_image && (
                  <div className="h-40 bg-gray-100">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
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
