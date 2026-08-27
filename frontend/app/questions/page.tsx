'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { questionsAPI } from '@/lib/api'
import type { Question } from '@/lib/api'
import { HelpCircle, Eye, MessageCircle, Loader2, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await questionsAPI.list({ limit: 50 })
        setQuestions(data)
      } catch (error) {
        console.error('Failed to fetch questions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
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
          <h1 className="text-4xl font-bold mb-4">Community Q&A</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Ask questions, get answers from locals and experienced travelers
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Questions ({questions.length})
          </h2>
          <Link
            href="/questions/create"
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5" />
            Ask Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Link
                key={question.id}
                href={`/questions/${question.id}`}
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">{question.answer_count}</span>
                    <span className="text-xs text-primary-600">answers</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition">
                      {question.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {question.view_count} views
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        question.status === 'open' ? 'bg-green-100 text-green-700' :
                        question.status === 'answered' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {question.status}
                      </span>
                      <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                    </div>
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
