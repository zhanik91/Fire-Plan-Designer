
from playwright.sync_api import sync_playwright

def verify_assistant_and_icons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the editor
        page.goto("http://localhost:5000/")

        # 1. Verify Assistant Button exists and toggle it
        assistant_btn = page.get_by_role("button", name="Ассистент")
        if assistant_btn.count() == 0:
            print("Assistant button not found")
            return

        assistant_btn.click()

        # Wait for assistant panel to appear
        page.wait_for_selector("text=Smart Assistant")

        # 2. Verify new icons in Sidebar
        # Look for "Лестница", "Аптечка", "Точка сбора"
        stairs_btn = page.get_by_text("Лестница")
        first_aid_btn = page.get_by_text("Аптечка")
        assembly_btn = page.get_by_text("Точка сбора")

        if stairs_btn.count() == 0 or first_aid_btn.count() == 0 or assembly_btn.count() == 0:
            print("New icons not found in sidebar")

        # 3. Take screenshot
        page.screenshot(path="/home/jules/verification/smart_assistant.png")
        print("Screenshot taken at /home/jules/verification/smart_assistant.png")

        browser.close()

if __name__ == "__main__":
    verify_assistant_and_icons()
