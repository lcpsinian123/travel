'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { questionsAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Question, Answer } from '@/lib/api'
import { HelpCircle, Check, Loader2, Send, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function QuestionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { isAuthenticated } = useAuth()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [newAnswer, setNewAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qData, aData] = await Promise.all([
          questionsAPI.get(id),
          questionsAPI.getAnswers(id),
        ])
        setQuestion(qData)
        setAnswers(aData)
      } catch (error) {
        console.error('Failed to fetch question:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswer.trim() || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      const answer = await questionsAPI.createAnswer(id, newAnswer)
      setAnswers([...answers, answer])
      setNewAnswer('')
    } catch (err) {
      console.error('Failed to submit answer:', err)
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

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
        <Link href="/questions" className="text-primary-600 hover:underline">Back to questions</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/questions" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </Link>

        {/* Question */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{question.content}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {(question.author.display_name || question.author.username).charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{question.author.display_name || question.author.username}</span>
            </div>
            <span>Asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Answers */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">{answers.length} Answers</h2>
        <div className="space-y-6 mb-8">
          {answers.map((answer) => (
            <div key={answer.id} className={`bg-white rounded-xl p-6 shadow-sm ${answer.is_accepted ? 'border-2 border-green-500' : ''}`}>
              {answer.is_accepted && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
                  <Check className="w-4 h-4" />
                  Accepted Answer
                </div>
              )}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{answer.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{answer.author.display_name || answer.author.username}</span>
                <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitAnswer} className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Your Answer</h3>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
            />
            <button
              type="submit"
              disabled={!newAnswer.trim() || isSubmitting}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Post Answer
            </button>
          </form>
        ) : (
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <p className="text-gray-600">
              <Link href="/login" className="text-primary-600 font-medium">Sign in</Link> to answer this question
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
