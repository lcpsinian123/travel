'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { postsAPI, commentsAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Post, Comment } from '@/lib/api'
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, Loader2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function PostDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { isAuthenticated } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          postsAPI.getBySlug(slug),
          postsAPI.get(slug).then(() => []).catch(() => []), // Comments need post_id
        ])
        setPost(postData)
        // Try to get comments if post is loaded
        try {
          const commentsData = await commentsAPI.getByPost(postData.id)
          setComments(commentsData)
        } catch {
          // Comments might not exist yet
        }
      } catch (err) {
        setError('Post not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      const comment = await commentsAPI.create({
        post_id: post.id,
        content: newComment,
      })
      setComments([...comments, comment])
      setNewComment('')
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <Link href="/posts" className="text-primary-600 hover:underline">
          ← Back to posts
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Article */}
      <article className="bg-white">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="h-96 bg-gray-100">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to posts
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b">
              <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-600">
                    {(post.author.display_name || post.author.username).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {post.author.display_name || post.author.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/topics/${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between py-4 border-t border-b mb-8">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition">
                  <Heart className="w-5 h-5" />
                  <span>{post.like_count}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
              <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition">
                <Bookmark className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Post Comment
              </button>
            </form>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 mb-8 text-center">
              <p className="text-gray-600">
                <Link href="/login" className="text-primary-600 font-medium">Sign in</Link>
                {' '}to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {(comment.author?.display_name || comment.author?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.author?.display_name || comment.author?.username}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
