
from playwright.sync_api import sync_playwright
import time

def verify_auth_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Login
        print("Navigating to auth page...")
        page.goto("http://localhost:5000/auth")

        print("Filling login form...")
        # Assuming we seeded 'dist_g_ast' / 'A_s6-fKkh' (from script/seed_users.ts output or file)
        # Wait, the seed script hashes passwords. I need to know the plain text password from the file image.
        # The file content I pasted into server/seed.ts had:
        # DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast A_s6-fKkh

        page.fill("input[name='username']", "dist_g_ast")
        page.fill("input[name='password']", "A_s6-fKkh")

        print("Submitting login...")
        page.click("button[type='submit']")

        # 2. Verify redirect to Editor
        print("Waiting for redirect...")
        page.wait_for_url("http://localhost:5000/", timeout=10000)

        # 3. Check for User Info in Header
        print("Checking for user info...")
        # I added UserIcon and username in the header
        page.wait_for_selector("text=dist_g_ast", timeout=5000)

        # 4. Take screenshot of Editor with User logged in
        print("Taking screenshot...")
        page.screenshot(path="verification/auth_editor.png")

        browser.close()

if __name__ == "__main__":
    verify_auth_editor()
