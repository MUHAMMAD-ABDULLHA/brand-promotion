"""
Instagram Public Profile Scraper — FYP Brand Promotion Platform

Fetches REAL public post data from Instagram profiles using Playwright
browser automation with stealth enhancements. Falls back to HTTP-based
public data sources, then to curated data only as last resort.

Output: backend/data/posts.json, backend/data/users.json
         (read by the Go recommendation system instead of the database)

Usage:
    pip install playwright         # first-time setup
    playwright install chromium    # first-time setup
    python scraper/scrape_instagram.py
"""

import json
import os
import re
import sys
import time
import random
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = DATA_DIR / "posts.json"
USER_FILE = DATA_DIR / "users.json"

TARGET_PROFILES = [
    {"username": "techcrunch", "niche": "Technology"},
    {"username": "natgeo", "niche": "Travel"},
    {"username": "foodnetwork", "niche": "Food"},
    {"username": "nike", "niche": "Fitness"},
    {"username": "voguemagazine", "niche": "Fashion"},
    {"username": "forbes", "niche": "Finance"},
    {"username": "artsy", "niche": "Art"},
    {"username": "pitchfork", "niche": "Music"},
]

CURATED_POSTS = [
    {"caption": "Just got my hands on the new M4 MacBook Air — the performance per watt is absolutely insane. Full review dropping this weekend.", "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "category": "Technology", "likes": 2847, "comments": 89, "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()},
    {"caption": "Built a Raspberry Pi home server that runs my entire smart home. Total cost? Under $150. Here is the complete guide.", "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800", "category": "Technology", "likes": 1523, "comments": 67, "timestamp": (datetime.now() - timedelta(hours=8)).isoformat()},
    {"caption": "The state of AI coding assistants in 2026 — we tested GitHub Copilot, Cursor, and Codeium on real production bugs. The results might surprise you.", "image_url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800", "category": "Technology", "likes": 3401, "comments": 156, "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
    {"caption": "Open source alternative to Notion that runs on your own server. Self-hosting your productivity stack has never been easier.", "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", "category": "Technology", "likes": 2134, "comments": 78, "timestamp": (datetime.now() - timedelta(days=1, hours=6)).isoformat()},
    {"caption": "Why I switched from TypeScript to Go for my backend services after 5 years. The tooling gap is closing fast.", "image_url": "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800", "category": "Technology", "likes": 1892, "comments": 134, "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
    {"caption": "Sunrise over the temples of Bagan, Myanmar — 2,000 ancient stupas stretching across the misty plains. A sight that changes you.", "image_url": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", "category": "Travel", "likes": 5621, "comments": 203, "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()},
    {"caption": "Found a hidden beach in Sardinia with water so clear you can see the fish from 30 feet above. No crowds, just pure Mediterranean magic.", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "category": "Travel", "likes": 4238, "comments": 167, "timestamp": (datetime.now() - timedelta(days=1, hours=3)).isoformat()},
    {"caption": "Three weeks backpacking through the Scottish Highlands. The most underrated hiking destination in Europe. Here are my top 5 trails.", "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "category": "Travel", "likes": 3891, "comments": 145, "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
    {"caption": "Tokyo at night is a different world. These neon-lit alleyways in Shibuya hide the best ramen shops in the city.", "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", "category": "Travel", "likes": 6734, "comments": 289, "timestamp": (datetime.now() - timedelta(days=3)).isoformat()},
    {"caption": "Homemade sourdough that took three years to perfect. The secret is a 15-year-old starter my grandmother passed down.", "image_url": "https://images.unsplash.com/photo-1585478259715-8d0e7c0c5f1a?w=800", "category": "Food", "likes": 4521, "comments": 198, "timestamp": (datetime.now() - timedelta(hours=12)).isoformat()},
    {"caption": "Street food tour in Bangkok: 8 dishes, $12 total, zero regrets. The mango sticky rice alone is worth the flight.", "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", "category": "Food", "likes": 3890, "comments": 156, "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
    {"caption": "Perfecting the art of French omelette — 30 seconds on heat, 30 seconds off, repeat. Silky, creamy, and worth every second.", "image_url": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800", "category": "Food", "likes": 2341, "comments": 87, "timestamp": (datetime.now() - timedelta(days=2, hours=4)).isoformat()},
    {"caption": "Fermentation station: homemade kimchi, kombucha, and kefir all bubbling away. Gut health has never tasted this good.", "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", "category": "Food", "likes": 1876, "comments": 92, "timestamp": (datetime.now() - timedelta(days=3)).isoformat()},
    {"caption": "Consistency over intensity. 500 days of daily movement and the transformation is not just physical — it is mental resilience.", "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", "category": "Fitness", "likes": 7834, "comments": 312, "timestamp": (datetime.now() - timedelta(hours=6)).isoformat()},
    {"caption": "Calisthenics park workout: pull-ups, dips, and pistols squats. No gym membership needed for a full-body transformation.", "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", "category": "Fitness", "likes": 5231, "comments": 204, "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
    {"caption": "Morning yoga routine that fixed my chronic back pain in 6 weeks. Here is the exact sequence I follow daily.", "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", "category": "Fitness", "likes": 9123, "comments": 445, "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
    {"caption": "Nutrition myth busting: why eating 6 small meals a day is not better than 3 balanced ones. The science explained simply.", "image_url": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800", "category": "Fitness", "likes": 4567, "comments": 234, "timestamp": (datetime.now() - timedelta(days=4)).isoformat()},
    {"caption": "Trail running at sunrise changed my relationship with exercise. Nature is the ultimate personal trainer.", "image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800", "category": "Fitness", "likes": 3456, "comments": 123, "timestamp": (datetime.now() - timedelta(days=5)).isoformat()},
    {"caption": "Capsule wardrobe update: 33 items for every season. Sustainable fashion does not mean sacrificing style.", "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800", "category": "Fashion", "likes": 6789, "comments": 267, "timestamp": (datetime.now() - timedelta(hours=10)).isoformat()},
    {"caption": "Thrift flip of the week: turned a $5 oversized blazer into a custom corset top. Thrifting is the future of fashion.", "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800", "category": "Fashion", "likes": 5432, "comments": 198, "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
    {"caption": "The tailoring revolution: why spending $30 on alterations makes a $50 suit look like $500. Fit is everything.", "image_url": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800", "category": "Fashion", "likes": 3210, "comments": 145, "timestamp": (datetime.now() - timedelta(days=3)).isoformat()},
    {"caption": "Slow fashion brands that are actually worth the investment. These 5 labels combine ethics with exceptional design.", "image_url": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800", "category": "Fashion", "likes": 4567, "comments": 189, "timestamp": (datetime.now() - timedelta(days=5)).isoformat()},
    {"caption": "The 50-30-20 budget rule is outdated. Here is the modern alternative that actually works for freelancers and gig workers.", "image_url": "https://images.unsplash.com/photo-1565514020179-026b5a1da3f0?w=800", "category": "Finance", "likes": 2345, "comments": 167, "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
    {"caption": "Compound interest explained with a story: two friends, one starts investing at 25, the other at 35. The gap is 600k at retirement.", "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800", "category": "Finance", "likes": 6789, "comments": 345, "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
    {"caption": "Real estate investing for beginners: how to analyze a rental property in 10 minutes flat. No spreadsheet required.", "image_url": "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800", "category": "Finance", "likes": 4567, "comments": 234, "timestamp": (datetime.now() - timedelta(days=3)).isoformat()},
    {"caption": "Why I moved 30 percent of my portfolio into emerging market ETFs. Diversification beyond the S&P 500 is not optional anymore.", "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800", "category": "Finance", "likes": 3456, "comments": 156, "timestamp": (datetime.now() - timedelta(days=4)).isoformat()},
    {"caption": "Negotiating your salary: a 5-step framework that got me a 40 percent raise. The key is timing and data.", "image_url": "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800", "category": "Finance", "likes": 8912, "comments": 423, "timestamp": (datetime.now() - timedelta(days=6)).isoformat()},
    {"caption": "Digital painting process video — 12 hours compressed into 60 seconds. This piece explores the intersection of nature and technology.", "image_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800", "category": "Art", "likes": 3210, "comments": 145, "timestamp": (datetime.now() - timedelta(hours=15)).isoformat()},
    {"caption": "Ink and watercolor study of morning light through stained glass. There is something meditative about letting the water guide the pigment.", "image_url": "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800", "category": "Art", "likes": 2345, "comments": 98, "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
    {"caption": "Generative art piece created with p5.js — every frame is unique. Code is my new paintbrush.", "image_url": "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800", "category": "Art", "likes": 5678, "comments": 234, "timestamp": (datetime.now() - timedelta(days=4)).isoformat()},
    {"caption": "Street art walking tour in Berlin: the city that turns every wall into a canvas. Politics, beauty, and rebellion in spray paint.", "image_url": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", "category": "Art", "likes": 4567, "comments": 189, "timestamp": (datetime.now() - timedelta(days=7)).isoformat()},
    {"caption": "New track drop! Lo-fi hip hop beat with live-recorded jazz saxophone. Link in bio to stream on all platforms.", "image_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800", "category": "Music", "likes": 3456, "comments": 178, "timestamp": (datetime.now() - timedelta(hours=4)).isoformat()},
    {"caption": "Building a modular synthesizer from scratch — the oscillator is done and it sounds absolutely massive. Full build diary coming soon.", "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", "category": "Music", "likes": 2123, "comments": 89, "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
    {"caption": "Vinyl collection milestone: hit 500 records today. Here are my top 10 finds from this year including a rare first pressing of Kind of Blue.", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", "category": "Music", "likes": 6789, "comments": 345, "timestamp": (datetime.now() - timedelta(days=3)).isoformat()},
    {"caption": "Home studio upgrade: treated my room with acoustic panels and the difference is night and day. Before and after frequency response graphs.", "image_url": "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800", "category": "Music", "likes": 4567, "comments": 201, "timestamp": (datetime.now() - timedelta(days=5)).isoformat()},
    {"caption": "Guitar cover of a classic Fleetwood Mac riff — learning the nuances of Buckingham fingerpicking style has been a game changer.", "image_url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800", "category": "Music", "likes": 2345, "comments": 123, "timestamp": (datetime.now() - timedelta(days=7)).isoformat()},
]

CURATED_USERS = [
    {"id": 1, "username": "alexchen_tech", "full_name": "Alex Chen", "bio": "Tech reviewer & software engineer. Breaking down complex tech into simple stories.", "niche": "Technology", "followers": 45200, "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"},
    {"id": 2, "username": "sarah_wanders", "full_name": "Sarah Williams", "bio": "Travel photographer exploring hidden gems worldwide. 30 countries and counting.", "niche": "Travel", "followers": 82300, "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"},
    {"id": 3, "username": "marco_eats", "full_name": "Marco Rossi", "bio": "Chef & food storyteller. Italian at heart, global on the plate.", "niche": "Food", "followers": 34100, "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"},
    {"id": 4, "username": "jennyfit", "full_name": "Jenny Park", "bio": "Certified trainer helping you build strength from the inside out.", "niche": "Fitness", "followers": 67500, "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"},
    {"id": 5, "username": "olivia_styles", "full_name": "Olivia Brooks", "bio": "Sustainable fashion advocate. Minimal wardrobe, maximum impact.", "niche": "Fashion", "followers": 56400, "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"},
    {"id": 6, "username": "david_finance", "full_name": "David Kim", "bio": "Financial analyst sharing practical wealth-building strategies for everyday people.", "niche": "Finance", "followers": 28900, "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"},
    {"id": 7, "username": "maya_art", "full_name": "Maya Patel", "bio": "Digital artist blending tradition with technology. Illustrating the future.", "niche": "Art", "followers": 41200, "image_url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400"},
    {"id": 8, "username": "james_music", "full_name": "James Wilson", "bio": "Guitarist and producer sharing daily riffs and music production tips.", "niche": "Music", "followers": 37800, "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"},
]


def ensure_playwright():
    """Check if playwright is available without auto-installing."""
    try:
        import playwright
        return True
    except ImportError:
        print("[scraper] playwright not available. Install it for live Instagram data:")
        print("        pip install playwright && playwright install chromium")
        return False


def try_playwright_scrape():
    """Scrape public Instagram profile pages using Playwright.

    Uses a real browser with stealth techniques to avoid detection.
    Does NOT log in — only accesses public pages.
    """
    if not ensure_playwright():
        return None

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None

    agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )

    scraped = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        )
        context = browser.new_context(
            user_agent=agent,
            viewport={"width": 1280, "height": 800},
            locale="en-US",
        )
        page = context.new_page()

        for profile in TARGET_PROFILES:
            url = f"https://www.instagram.com/{profile['username']}/"
            print(f"[scraper] Fetching {url} ...")
            try:
                page.goto(url, timeout=20000, wait_until="domcontentloaded")
                time.sleep(random.uniform(3, 5))

                # Instagram embeds initial state JSON in a script tag
                data = page.evaluate("""() => {
                    const shared = document.querySelector('script[type="text/javascript"]');
                    if (!shared) return null;
                    const txt = shared.textContent || '';
                    const match = txt.match(/window\\.__INITIAL_STATE__\\s*=\\s*({.+?});/);
                    if (!match) return null;
                    try {
                        const state = JSON.parse(match[1]);
                        const user = state?.items?.user || {};
                        const edges = user?.edge_owner_to_timeline_media?.edges || [];
                        return edges.slice(0, 8).map(e => ({
                            shortcode: e.node.shortcode,
                            caption: e.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                            display_url: e.node.display_url || e.node.thumbnail_src || '',
                            likes: e.node.edge_liked_by?.count || e.node.edge_media_preview_like?.count || 0,
                            comments: e.node.edge_media_to_comment?.count || 0,
                            taken_at: e.node.taken_at_timestamp || 0
                        }));
                    } catch { return null; }
                }""")

                if data and len(data) > 0:
                    for post in data:
                        ts = datetime.fromtimestamp(post["taken_at"]).isoformat() if post.get("taken_at") else datetime.now().isoformat()
                        scraped.append({
                            "caption": post["caption"][:500] if post["caption"] else "",
                            "image_url": post["display_url"],
                            "category": profile["niche"],
                            "likes": post["likes"],
                            "comments": post["comments"],
                            "timestamp": ts,
                        })
                    print(f"[scraper] Got {len(data)} real posts from @{profile['username']}")
                else:
                    print(f"[scraper] No posts found for @{profile['username']} (page structure may have changed)")

            except Exception as e:
                print(f"[scraper] Failed to scrape @{profile['username']}: {e}")

            delay = random.uniform(4, 7)
            print(f"[scraper] Waiting {delay:.0f}s before next profile...")
            time.sleep(delay)

        browser.close()

    if scraped:
        print(f"[scraper] Scraped {len(scraped)} posts total from Instagram")
    return scraped if scraped else None


def try_http_scrape():
    """Fallback: fetch public Instagram data via unofficial HTTP API.

    Uses the instagram.com API endpoint that serves public profile data
    without requiring authentication for public profiles.
    """
    scraped = []

    for profile in TARGET_PROFILES:
        url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={profile['username']}"
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
            "Referer": f"https://www.instagram.com/{profile['username']}/",
            "X-Requested-With": "XMLHttpRequest",
        }
        print(f"[scraper] HTTP fetching @{profile['username']} ...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = json.loads(resp.read().decode())
                user = body.get("data", {}).get("user", {})
                edges = user.get("edge_owner_to_timeline_media", {}).get("edges", [])
                for e in edges[:8]:
                    node = e.get("node", {})
                    caption = ""
                    cap_edges = node.get("edge_media_to_caption", {}).get("edges", [])
                    if cap_edges:
                        caption = cap_edges[0].get("node", {}).get("text", "")[:500]
                    ts = datetime.fromtimestamp(node.get("taken_at_timestamp", 0)).isoformat() if node.get("taken_at_timestamp") else datetime.now().isoformat()
                    scraped.append({
                        "caption": caption,
                        "image_url": node.get("display_url", ""),
                        "category": profile["niche"],
                        "likes": node.get("edge_liked_by", {}).get("count", 0) or node.get("edge_media_preview_like", {}).get("count", 0) or 0,
                        "comments": node.get("edge_media_to_comment", {}).get("count", 0) or 0,
                        "timestamp": ts,
                    })
                print(f"[scraper] HTTP got {len(edges)} posts from @{profile['username']}")
        except Exception as e:
            print(f"[scraper] HTTP failed for @{profile['username']}: {e}")

        time.sleep(random.uniform(1, 2))

    return scraped if scraped else None


def save_data(posts_list, users_list, source="curated"):
    """Save posts and users to JSON files."""
    output = []
    for idx, post in enumerate(posts_list):
        cat = post.get("category", "Technology")
        user_id = next((u["id"] for u in CURATED_USERS if u["niche"] == cat), 1)
        impressions = post.get("likes", 1) * (8 + random.randint(2, 12))
        rate = round(
            (post.get("likes", 1) + post.get("comments", 0)) / max(impressions, 1), 4
        )
        output.append({
            "id": idx + 1,
            "user_id": user_id,
            "caption": post["caption"],
            "image_url": post.get("image_url", ""),
            "likes": post.get("likes", 0),
            "comments_count": post.get("comments", 0),
            "impressions": impressions,
            "engagement_rate": min(rate, 0.25),
            "is_sponsored": False,
            "created_at": post.get("timestamp", datetime.now().isoformat()),
        })

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    with open(USER_FILE, "w", encoding="utf-8") as f:
        json.dump(users_list, f, indent=2, ensure_ascii=False)

    print(f"[scraper] Saved {len(output)} posts ({source}) -> {OUTPUT_FILE}")
    print(f"[scraper] Saved {len(users_list)} users -> {USER_FILE}")


def main():
    print("=" * 60)
    print("Instagram Public Profile Scraper")
    print("FYP Brand Promotion Platform")
    print("=" * 60)

    scraped = None

    # Source 1: Playwright browser automation (most reliable for real data)
    print("\n[1/3] Trying Playwright browser automation...")
    try:
        scraped = try_playwright_scrape()
    except Exception as e:
        print(f"[scraper] Playwright failed: {e}")

    # Source 2: HTTP-based API scrape (fallback)
    if not scraped:
        print("\n[2/3] Trying HTTP API scrape...")
        try:
            scraped = try_http_scrape()
        except Exception as e:
            print(f"[scraper] HTTP scrape failed: {e}")

    # Source 3: Curated dataset (last resort)
    if not scraped:
        print("\n[3/3] No live data sources available — using curated dataset")
        print("    Install Playwright for live Instagram data:")
        print("    pip install playwright && playwright install chromium")
        save_data(CURATED_POSTS, CURATED_USERS, source="curated")
    else:
        print(f"\nUsing live scraped data ({len(scraped)} posts)")
        save_data(scraped, CURATED_USERS, source=f"live_scrape_{len(scraped)}_posts")

    print("\n[scraper] Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
