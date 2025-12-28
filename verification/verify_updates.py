from playwright.sync_api import sync_playwright

def verify_updates():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5000")
            page.wait_for_selector("canvas")

            # Check for new tools in Sidebar
            # "Текст / Надпись"
            if page.get_by_role("button", name="Текст / Надпись").is_visible():
                print("Text Tool Visible")
            else:
                print("Text Tool NOT Visible")

            # "Основной (Сплошной)"
            if page.get_by_role("button", name="Основной (Сплошной)").is_visible():
                print("Main Route Tool Visible")
            else:
                print("Main Route Tool NOT Visible")

            # "Запасной (Пунктир)"
            if page.get_by_role("button", name="Запасной (Пунктир)").is_visible():
                print("Backup Route Tool Visible")
            else:
                print("Backup Route Tool NOT Visible")

            # Test drawing a text element
            page.get_by_role("button", name="Текст / Надпись").click()
            page.mouse.click(400, 400)
            page.wait_for_timeout(500)

            # Verify text element exists (visual check via screenshot)
            page.screenshot(path="verification/updates.png")
            print("Screenshot saved to verification/updates.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_updates()
