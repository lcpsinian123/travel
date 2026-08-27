"""
Test database connection using pymysql
"""
import sys
sys.path.insert(0, '/Users/liuchengping/Desktop/qt/doc/china-travel/backend')

from app.config import settings
import pymysql


def test_connection():
    print("=" * 50)
    print("Database Connection Test (using pymysql)")
    print("=" * 50)

    # Print connection info (mask password)
    db_url_masked = settings.DATABASE_URL.replace(settings.DB_PASSWORD, '****')
    print(f"\n[INFO] Database URL: {db_url_masked}")
    print(f"[INFO] Host: {settings.DB_HOST}")
    print(f"[INFO] Port: {settings.DB_PORT}")
    print(f"[INFO] User: {settings.DB_USER}")
    print(f"[INFO] Database: {settings.DB_NAME}")

    try:
        print("\n[STEP 1] Connecting to database...")
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("[OK] Connected successfully!")

        print("\n[STEP 2] Checking existing tables...")
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            table_names = [list(t.values())[0] for t in tables]
            print(f"[INFO] Found {len(table_names)} tables:")
            for table in table_names:
                print(f"  - {table}")

        print("\n[STEP 3] Testing basic query...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 as test")
            result = cursor.fetchone()
            print(f"[OK] Query test passed: {result}")

        connection.close()

        print("\n" + "=" * 50)
        print("RESULT: Database connection successful!")
        print("=" * 50)
        return True

    except pymysql.err.OperationalError as e:
        print(f"\n[ERROR] Connection failed: {e}")
        if "Can't connect" in str(e) or "Lost connection" in str(e):
            print("\n[HELP] Please check:")
            print("  1. Is the MySQL server running?")
            print("  2. Is the host/port correct?")
            print("  3. Is the firewall allowing connection?")
            print("  4. Is the database 'chinatravel' created?")
        elif "Access denied" in str(e):
            print("\n[HELP] Please check:")
            print("  1. Is the username correct?")
            print("  2. Is the password correct?")
        elif "Unknown database" in str(e):
            print("\n[HELP] The database 'chinatravel' does not exist.")
            print("  Please create it first:")
            print("  CREATE DATABASE chinatravel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")

        print("\n" + "=" * 50)
        print("RESULT: Connection failed!")
        print("=" * 50)
        return False
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        print("\n" + "=" * 50)
        print("RESULT: Connection failed!")
        print("=" * 50)
        return False


if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
