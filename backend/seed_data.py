"""
Seed database with sample data for testing
"""
import asyncio
import sys
sys.path.insert(0, '/Users/liuchengping/Desktop/qt/doc/china-travel/backend')

from tortoise import Tortoise
from app.models.destination import Destination
from app.models.post import Post
from app.models.topic import Topic
from app.models.question import Question
from app.models.user import User
from app.services.auth import get_password_hash


async def seed_data():
    print("=" * 50)
    print("Seeding Database with Sample Data")
    print("=" * 50)

    print("\n[STEP 1] Initializing Tortoise ORM...")
    await Tortoise.init(
        db_url="mysql://root:zxcvbnm..123@120.77.36.1:3306/chinatravel",
        modules={"models": ["app.models.user", "app.models.destination", "app.models.post", "app.models.comment", "app.models.question", "app.models.topic"]},
        timezone="UTC",
    )
    print("[OK] Tortoise ORM initialized!")

    print("\n[STEP 2] Creating sample user...")
    existing_user = await User.filter(email="demo@chinatravel.com").first()
    if not existing_user:
        demo_user = await User.create(
            email="demo@chinatravel.com",
            username="demouser",
            password_hash=get_password_hash("demo123456"),
            display_name="Demo User",
            bio="A passionate traveler exploring China!",
            country="United States",
            is_local_guide=True,
        )
        print(f"[OK] Created demo user: demo@chinatravel.com / demo123456")
    else:
        print(f"[SKIP] Demo user already exists")
        demo_user = existing_user

    print("\n[STEP 3] Creating destinations...")
    destinations_data = [
        {
            "slug": "beijing",
            "name_en": "Beijing",
            "name_zh": "北京",
            "region": "North China",
            "description": "The capital city of China, home to the Forbidden City, Great Wall, and Temple of Heaven.",
            "is_featured": True,
            "view_count": 1000,
        },
        {
            "slug": "shanghai",
            "name_en": "Shanghai",
            "name_zh": "上海",
            "region": "East China",
            "description": "China's largest city and global financial hub, known for its modern skyline and historic waterfront.",
            "is_featured": True,
            "view_count": 950,
        },
        {
            "slug": "xian",
            "name_en": "Xi'an",
            "name_zh": "西安",
            "region": "Northwest China",
            "description": "Ancient capital of China, famous for the Terracotta Army and city walls.",
            "is_featured": True,
            "view_count": 800,
        },
        {
            "slug": "chengdu",
            "name_en": "Chengdu",
            "name_zh": "成都",
            "region": "Southwest China",
            "description": "Capital of Sichuan province, known for giant pandas and spicy Sichuan cuisine.",
            "is_featured": False,
            "view_count": 600,
        },
        {
            "slug": "guangzhou",
            "name_en": "Guangzhou",
            "name_zh": "广州",
            "region": "South China",
            "description": "Major port city in southern China, known for Cantonese cuisine and historic temples.",
            "is_featured": False,
            "view_count": 500,
        },
    ]

    for d_data in destinations_data:
        existing = await Destination.filter(slug=d_data["slug"]).first()
        if not existing:
            await Destination.create(**d_data)
            print(f"  Created destination: {d_data['name_en']}")
        else:
            print(f"  Skipped destination: {d_data['name_en']} (exists)")

    print("\n[STEP 4] Creating topics...")
    topics_data = [
        {"name": "Food & Dining", "slug": "food-dining", "description": "Chinese cuisine and restaurant recommendations"},
        {"name": "Budget Travel", "slug": "budget-travel", "description": "Tips for traveling China on a budget"},
        {"name": "Visa & Immigration", "slug": "visa-immigration", "description": "Visa requirements and immigration tips"},
        {"name": "Transportation", "slug": "transportation", "description": "Getting around China: trains, planes, and more"},
        {"name": "Culture & Customs", "slug": "culture-customs", "description": "Chinese culture, etiquette, and customs"},
    ]

    for t_data in topics_data:
        existing = await Topic.filter(slug=t_data["slug"]).first()
        if not existing:
            await Topic.create(**t_data)
            print(f"  Created topic: {t_data['name']}")
        else:
            print(f"  Skipped topic: {t_data['name']} (exists)")

    print("\n[STEP 5] Creating sample posts...")
    posts_data = [
        {
            "author_id": demo_user.id,
            "title": "My First Week in Beijing: A Traveler's Guide",
            "slug": "first-week-beijing-guide",
            "content": "Beijing, the capital of China, offers an incredible blend of ancient history and modern development. In this guide, I'll share my experiences from my first week exploring this magnificent city.\n\n**Day 1-2: The Forbidden City and Tiananmen Square**\nStart your journey at the heart of Chinese history. The Forbidden City is vast - plan at least half a day here.",
            "excerpt": "A comprehensive guide for first-time visitors to Beijing based on my personal experiences.",
            "status": "published",
            "view_count": 500,
            "like_count": 45,
            "tags": "beijing,guide,culture",
        },
        {
            "author_id": demo_user.id,
            "title": "Eating Your Way Through Shanghai",
            "slug": "eating-shanghai-guide",
            "content": "Shanghai is a food lover's paradise. From street food to Michelin-starred restaurants, this city has it all. Here are my top recommendations for authentic Shanghai cuisine.",
            "excerpt": "Discover the best local food spots in Shanghai from budget-friendly to fine dining.",
            "status": "published",
            "view_count": 300,
            "like_count": 28,
            "tags": "shanghai,food,guide",
        },
        {
            "author_id": demo_user.id,
            "title": "Visa Application Tips for US Citizens",
            "slug": "visa-tips-us-citizens",
            "content": "As a US citizen, you'll need a visa to visit China. Here's everything you need to know about the application process, required documents, and tips for a successful application.",
            "excerpt": "Essential visa application tips for American travelers visiting China.",
            "status": "published",
            "view_count": 800,
            "like_count": 120,
            "tags": "visa-immigration,usa,guide",
        },
    ]

    for p_data in posts_data:
        existing = await Post.filter(slug=p_data["slug"]).first()
        if not existing:
            await Post.create(**p_data)
            print(f"  Created post: {p_data['title'][:40]}...")
        else:
            print(f"  Skipped post: {p_data['title'][:40]}... (exists)")

    print("\n[STEP 6] Creating sample questions...")
    questions_data = [
        {
            "author_id": demo_user.id,
            "title": "What's the best time to visit China?",
            "content": "I'm planning a trip to China and wondering when the best time to visit would be. I want to avoid extreme weather and crowds if possible. Any recommendations?",
            "status": "open",
            "view_count": 200,
            "answer_count": 0,
        },
        {
            "author_id": demo_user.id,
            "title": "How to use WeChat Pay as a foreigner?",
            "content": "I heard WeChat Pay is essential for payments in China. How can I set it up as a foreign tourist? Do I need a Chinese bank account?",
            "status": "open",
            "view_count": 350,
            "answer_count": 0,
        },
    ]

    for q_data in questions_data:
        existing = await Question.filter(title=q_data["title"]).first()
        if not existing:
            await Question.create(**q_data)
            print(f"  Created question: {q_data['title'][:40]}...")
        else:
            print(f"  Skipped question: {q_data['title'][:40]}... (exists)")

    print("\n" + "=" * 50)
    print("Database seeding completed!")
    print("=" * 50)
    print("\nDemo account:")
    print("  Email: demo@chinatravel.com")
    print("  Password: demo123456")

    await Tortoise.close_connections()


if __name__ == "__main__":
    asyncio.run(seed_data())
