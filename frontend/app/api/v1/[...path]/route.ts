// Simple in-memory data for demo (replace with database calls in production)
const destinations = [
  { id: "1", slug: "beijing", name_en: "Beijing", name_zh: "北京", region: "North China", description: "The capital of China", is_featured: true, view_count: 1000 },
  { id: "2", slug: "shanghai", name_en: "Shanghai", name_zh: "上海", region: "East China", description: "China's largest city", is_featured: true, view_count: 950 },
  { id: "3", slug: "xian", name_en: "Xi'an", name_zh: "西安", region: "Northwest China", description: "Ancient capital with Terracotta Army", is_featured: true, view_count: 800 },
  { id: "4", slug: "chengdu", name_en: "Chengdu", name_zh: "成都", region: "Southwest China", description: "Home of Giant Pandas", is_featured: false, view_count: 600 },
  { id: "5", slug: "guangzhou", name_en: "Guangzhou", name_zh: "广州", region: "South China", description: "Cantonese cuisine hub", is_featured: false, view_count: 500 },
];

const posts = [
  { id: "1", slug: "first-week-beijing", title: "My First Week in Beijing", excerpt: "A comprehensive guide...", author: { username: "demo", display_name: "Demo User" }, view_count: 500, like_count: 45 },
  { id: "2", slug: "eating-shanghai", title: "Eating Your Way Through Shanghai", excerpt: "Best food spots...", author: { username: "demo", display_name: "Demo User" }, view_count: 300, like_count: 28 },
  { id: "3", slug: "visa-tips-us", title: "Visa Application Tips for US Citizens", excerpt: "Essential visa tips...", author: { username: "demo", display_name: "Demo User" }, view_count: 800, like_count: 120 },
];

const questions = [
  { id: "1", title: "Best time to visit China?", content: "I'm planning a trip and wondering when the best time...", answer_count: 2, view_count: 200, status: "open" },
  { id: "2", title: "How to use WeChat Pay?", content: "Can foreigners use WeChat Pay?", answer_count: 1, view_count: 350, status: "answered" },
];

const topics = [
  { id: "1", name: "Food & Dining", slug: "food-dining", description: "Chinese cuisine recommendations", post_count: 5 },
  { id: "2", name: "Budget Travel", slug: "budget-travel", description: "Travel China on a budget", post_count: 3 },
  { id: "3", name: "Visa & Immigration", slug: "visa-immigration", description: "Visa requirements", post_count: 8 },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // Destinations list
    if (path === '/api/v1/destinations/' || path === '/api/v1/destinations') {
      return new Response(JSON.stringify(destinations), { headers });
    }

    // Single destination by slug
    const destMatch = path.match(/^\/api\/v1\/destinations\/([^\/]+)$/);
    if (destMatch) {
      const slug = destMatch[1];
      const dest = destinations.find(d => d.slug === slug);
      if (!dest) {
        return new Response(JSON.stringify({ detail: 'Not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify(dest), { headers });
    }

    // Posts list
    if (path === '/api/v1/posts/' || path === '/api/v1/posts') {
      return new Response(JSON.stringify(posts), { headers });
    }

    // Questions list
    if (path === '/api/v1/questions/' || path === '/api/v1/questions') {
      return new Response(JSON.stringify(questions), { headers });
    }

    // Topics list
    if (path === '/api/v1/topics/' || path === '/api/v1/topics') {
      return new Response(JSON.stringify(topics), { headers });
    }

    // Home data
    if (path === '/api/v1/home/' || path === '/api/v1/home') {
      return new Response(JSON.stringify({
        destinations: destinations.filter(d => d.is_featured).slice(0, 6),
        latest_posts: posts,
        latest_questions: questions,
        active_users: [{ username: 'demo', display_name: 'Demo User' }],
      }), { headers });
    }

    // Search
    if (path === '/api/v1/search/' || path === '/api/v1/search') {
      const q = url.searchParams.get('q') || '';
      const q_lower = q.toLowerCase();
      return new Response(JSON.stringify({
        destinations: destinations.filter(d => d.name_en.toLowerCase().includes(q_lower) || d.name_zh?.includes(q)),
        posts: posts.filter(p => p.title.toLowerCase().includes(q_lower)),
        questions: questions.filter(q => q.title.toLowerCase().includes(q_lower)),
        users: [],
      }), { headers });
    }

    // Health check
    if (path === '/api/v1/health' || path === '/health') {
      return new Response(JSON.stringify({ status: 'healthy' }), { headers });
    }

    return new Response(JSON.stringify({ detail: 'Not found' }), { status: 404, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
