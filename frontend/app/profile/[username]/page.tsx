'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usersAPI } from '@/lib/api'
import type { UserProfile } from '@/lib/api'
import { User, MapPin, Calendar, BookOpen, HelpCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await usersAPI.getUserProfile(username)
        setProfile(data)
      } catch (err) {
        setError('User not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
        <Link href="/" className="text-primary-600 hover:underline">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-5xl font-bold text-primary-600">
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-gray-500 mb-4">@{profile.username}</p>
              {profile.bio && <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                {profile.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-8 mt-8 pt-8 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.post_count}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.question_count}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            {profile.is_local_guide && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Local Guide
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
        {profile.posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.posts.map((post) => (
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
                    <span>{post.view_count} views</span>
                    <span>{post.like_count} likes</span>
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
