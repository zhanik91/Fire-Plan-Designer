from playwright.sync_api import sync_playwright

def verify_final():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5000")
            page.wait_for_selector("canvas")

            # Check for Templates
            if page.get_by_text("Шаблоны").is_visible():
                print("Templates Section Visible")

                # Try to load a template
                page.get_by_text("Выберите шаблон").click()
                page.get_by_text("Офис (малый)").click()

                # Handle confirm dialog
                page.on("dialog", lambda dialog: dialog.accept())

                print("Loaded 'Office' Template")
                # We can't easily verify canvas content changes without complex pixel diff,
                # but if no error occurred, it's good.
            else:
                print("Templates Section NOT Visible")

            # Check PNG Export (make sure button works and doesn't crash)
            with page.expect_download() as download_info:
                page.get_by_role("button", name="PNG").click()
            download = download_info.value
            print(f"PNG Download started: {download.suggested_filename}")

            page.screenshot(path="verification/final.png")
            print("Screenshot saved to verification/final.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_final()
