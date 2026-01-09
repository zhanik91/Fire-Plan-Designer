from playwright.sync_api import sync_playwright

def verify_full_suite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming default Vite port)
            page.goto("http://localhost:5000")
            page.wait_for_selector("canvas")

            # --- Quick Wins Verification ---
            # 1. Draw a Room
            page.get_by_role("button", name="Комната").click()
            page.mouse.move(100, 100)
            page.mouse.down()
            page.mouse.move(300, 300)
            page.mouse.up()

            # 2. Add an Exit Sign
            page.get_by_role("button", name="Эвакуационный выход").click()
            page.mouse.click(150, 150)

            # 3. Select Exit Sign
            page.get_by_role("button", name="Выбрать / Переместить").click()
            page.mouse.click(150, 150)
            page.wait_for_timeout(500)

            # --- Long Term / Scale Verification ---
            # 4. Calibration Dialog
            # Needs a selected WALL to be enabled.
            # Select the top wall of the room (200, 100)
            page.mouse.click(200, 100)
            page.wait_for_timeout(500)

            page.get_by_role("button", name="Калибровка").click()
            # Check if dialog opens
            if page.get_by_text("Калибровка масштаба").is_visible():
                print("Calibration Dialog Open")
                # Close it
                page.keyboard.press("Escape")
            else:
                print("Error: Calibration Dialog did not open")

            # 5. Check Measurement Label
            # We have a wall (from Room) and maybe the exit sign selected.
            # Select a wall to see the measurement
            # Room walls are around (100,100) to (300,300).
            # Top wall: (100,100) to (300,100). Click middle: 200, 100.
            page.mouse.click(200, 100)
            page.wait_for_timeout(500)

            # Check for text like "10.00 м" (default 20px=1m, 200px width = 10m)
            # Text is rendered on Canvas, so playwright get_by_text might not see it if it's Konva Text.
            # Konva Text is canvas paint.
            # However, we can screenshot to verify.

            # --- Vector Export Verification ---
            # 6. Click PDF export (Vector)
            # The button is "PDF (A4)".
            with page.expect_download() as download_info:
                page.get_by_role("button", name="PDF (A4)").click()
            download = download_info.value
            print(f"Vector PDF Download started: {download.suggested_filename}")

            # Take final screenshot
            page.screenshot(path="verification/full_suite.png")
            print("Screenshot saved to verification/full_suite.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_full.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_full_suite()
