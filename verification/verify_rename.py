from playwright.sync_api import sync_playwright

def verify_rename():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5000")
            page.wait_for_selector("canvas")

            # Check for new text
            if page.get_by_text("План Эвакуации").is_visible():
                print("New Title Visible")
            else:
                print("New Title NOT Visible")

            page.screenshot(path="verification/rename.png")
            print("Screenshot saved to verification/rename.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_rename()
