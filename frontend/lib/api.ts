/**
 * API Client for ChinaTravel Backend
 */
import axios, { AxiosError, AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

// Types
export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  country?: string
  is_local_guide: boolean
  is_active: boolean
  created_at: string
}

export interface Destination {
  id: string
  slug: string
  name_en: string
  name_zh?: string
  country?: string
  region?: string
  description?: string
  cover_image?: string
  tags: string[]
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
}

// Nested destination (in PostResponse) - different structure
export interface NestedDestination {
  id: string
  slug: string
  name_en: string
  name_zh?: string
  region?: string
  cover_image?: string
  view_count: number
}

// Author info returned in posts/questions
export interface AuthorInfo {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
}

// Nested destination (in PostResponse)
export interface NestedDestination {
  id: string
  slug: string
  name_en: string
  name_zh?: string
  region?: string
  cover_image?: string
  view_count: number
}

export interface Post {
  id: string
  author_id: string
  author: AuthorInfo
  destination_id?: string
  destination?: NestedDestination
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  status: string
  view_count: number
  like_count: number
  comment_count: number
  tags: string[]
  published_at?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  author: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
  }
  parent_id?: string
  content: string
  like_count: number
  created_at: string
  updated_at: string
  replies: Comment[]
}

export interface Question {
  id: string
  author_id: string
  author: User
  destination_id?: string
  title: string
  content: string
  status: string
  view_count: number
  answer_count: number
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  question_id: string
  author_id: string
  author: User
  content: string
  is_accepted: boolean
  like_count: number
  created_at: string
  updated_at: string
}

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    const response = await apiClient.post<{ access_token: string }>('/auth/register', {
      email,
      username,
      password,
    })
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ access_token: string }>('/auth/login', {
      email,
      password,
    })
    return response.data
  },
}

export interface UserProfile {
  id: string
  email: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  country?: string
  is_local_guide: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  post_count: number
  question_count: number
  posts: Post[]
}

// Users API
export const usersAPI = {
  getMe: async () => {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  updateMe: async (data: Partial<User>) => {
    const response = await apiClient.put<User>('/users/me', data)
    return response.data
  },

  getUser: async (userId: string) => {
    const response = await apiClient.get<User>(`/users/${userId}`)
    return response.data
  },

  getUserByUsername: async (username: string) => {
    const response = await apiClient.get<User>(`/users/username/${username}`)
    return response.data
  },

  getUserProfile: async (userId: string, skip = 0, limit = 10) => {
    const response = await apiClient.get<UserProfile>(`/users/${userId}/profile`, {
      params: { skip, limit }
    })
    return response.data
  },

  getUserPosts: async (userId: string, skip = 0, limit = 20) => {
    const response = await apiClient.get<Post[]>(`/users/${userId}/posts`, {
      params: { skip, limit }
    })
    return response.data
  },

  getMyCollections: async (skip = 0, limit = 20) => {
    const response = await apiClient.get<Post[]>('/users/me/collections', {
      params: { skip, limit }
    })
    return response.data
  },

  getUserCollections: async (userId: string, skip = 0, limit = 20) => {
    const response = await apiClient.get<Post[]>(`/users/${userId}/collections`, {
      params: { skip, limit }
    })
    return response.data
  },
}

// Destinations API
export const destinationsAPI = {
  list: async (params?: { skip?: number; limit?: number; region?: string; featured?: boolean }) => {
    const response = await apiClient.get<Destination[]>('/destinations/', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<Destination>(`/destinations/${id}`)
    return response.data
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Destination>(`/destinations/slug/${slug}`)
    return response.data
  },

  getRegions: async () => {
    const response = await apiClient.get<string[]>('/destinations/regions')
    return response.data
  },
}

// Posts API
export const postsAPI = {
  list: async (params?: { skip?: number; limit?: number; destination_id?: string; author_id?: string; tag?: string }) => {
    const response = await apiClient.get<Post[]>('/posts/', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<Post>(`/posts/${id}`)
    return response.data
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Post>(`/posts/slug/${slug}`)
    return response.data
  },

  create: async (data: Partial<Post>) => {
    const response = await apiClient.post<Post>('/posts/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Post>) => {
    const response = await apiClient.put<Post>(`/posts/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/posts/${id}`)
  },

  toggleLike: async (id: string) => {
    const response = await apiClient.post<{ liked: boolean; like_count: number }>(`/posts/${id}/like`)
    return response.data
  },

  toggleCollect: async (id: string) => {
    const response = await apiClient.post<{ collected: boolean }>(`/posts/${id}/collect`)
    return response.data
  },
}

// Comments API
export const commentsAPI = {
  getByPost: async (postId: string) => {
    const response = await apiClient.get<Comment[]>(`/comments/post/${postId}`)
    return response.data
  },

  create: async (data: { post_id: string; content: string; parent_id?: string }) => {
    const response = await apiClient.post<Comment>('/comments/', data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/comments/${id}`)
  },
}

// Questions API
export const questionsAPI = {
  list: async (params?: { skip?: number; limit?: number; destination_id?: string; status?: string }) => {
    const response = await apiClient.get<Question[]>('/questions/', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<Question>(`/questions/${id}`)
    return response.data
  },

  create: async (data: { title: string; content: string; destination_id?: string }) => {
    const response = await apiClient.post<Question>('/questions/', data)
    return response.data
  },

  getAnswers: async (questionId: string) => {
    const response = await apiClient.get<Answer[]>(`/questions/${questionId}/answers`)
    return response.data
  },

  createAnswer: async (questionId: string, content: string) => {
    const response = await apiClient.post<Answer>(`/questions/${questionId}/answers`, { content })
    return response.data
  },
}

// Topics API
export interface Topic {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  post_count: number
  created_at: string
  updated_at: string
}

export const topicsAPI = {
  list: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get<Topic[]>('/topics/', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<Topic>(`/topics/${id}`)
    return response.data
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Topic>(`/topics/slug/${slug}`)
    return response.data
  },
}

// Search API
export interface SearchResults {
  posts: Post[]
  destinations: Destination[]
  users: User[]
  questions: Question[]
}

export const searchAPI = {
  search: async (q: string, type?: string, limit = 10) => {
    const response = await apiClient.get<SearchResults>('/search/', {
      params: { q, type, limit }
    })
    return response.data
  },

  searchPosts: async (q: string, skip = 0, limit = 20) => {
    const response = await apiClient.get<Post[]>('/search/posts', {
      params: { q, skip, limit }
    })
    return response.data
  },

  searchDestinations: async (q: string, limit = 10) => {
    const response = await apiClient.get<Destination[]>('/search/destinations', {
      params: { q, limit }
    })
    return response.data
  },

  searchUsers: async (q: string, limit = 10) => {
    const response = await apiClient.get<User[]>('/search/users', {
      params: { q, limit }
    })
    return response.data
  },

  searchQuestions: async (q: string, skip = 0, limit = 20) => {
    const response = await apiClient.get<Question[]>('/search/questions', {
      params: { q, skip, limit }
    })
    return response.data
  },
}

// Home API
export interface HomeData {
  destinations: Destination[]
  latest_posts: Post[]
  popular_posts: Post[]
  latest_questions: Question[]
  active_users: Array<{
    id: string
    username: string
    display_name?: string
    avatar_url?: string
  }>
}

export const homeAPI = {
  getHomeData: async (limit = 10) => {
    const response = await apiClient.get<HomeData>('/home/', { params: { limit } })
    return response.data
  },

  getFeaturedDestinations: async (limit = 6) => {
    const response = await apiClient.get<Destination[]>('/home/destinations', { params: { limit } })
    return response.data
  },

  getLatestPosts: async (limit = 10) => {
    const response = await apiClient.get<Post[]>('/home/posts/latest', { params: { limit } })
    return response.data
  },

  getPopularPosts: async (limit = 10) => {
    const response = await apiClient.get<Post[]>('/home/posts/popular', { params: { limit } })
    return response.data
  },

  getLatestQuestions: async (limit = 10) => {
    const response = await apiClient.get<Question[]>('/home/questions/latest', { params: { limit } })
    return response.data
  },
}
