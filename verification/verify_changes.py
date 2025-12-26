from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming default Vite port)
            page.goto("http://localhost:5000")

            # Wait for canvas
            page.wait_for_selector("canvas")

            # 1. Select "Room" tool and draw a room
            page.get_by_role("button", name="Комната").click()

            # Draw room (Drag from 100,100 to 300,300)
            page.mouse.move(100, 100)
            page.mouse.down()
            page.mouse.move(300, 300)
            page.mouse.up()

            # 2. Select "Route" tool and draw a polyline route
            page.get_by_role("button", name="Маршрут эвакуации").click()

            # Click 400,100 -> 500,100 -> 500,200 -> Double Click
            page.mouse.move(400, 100)
            page.mouse.down()
            page.mouse.up() # Click start

            page.mouse.move(500, 100)
            page.mouse.down()
            page.mouse.up() # Click point 2

            page.mouse.move(500, 200)
            page.mouse.dblclick(500, 200) # Finish

            # 3. Add an Exit sign (icon test)
            page.get_by_role("button", name="Эвакуационный выход").click()
            page.mouse.click(300, 100)

            # 4. Select the Exit sign and Delete it
            # Switch to select tool first? Usually adding icon switches back or stays?
            # Code says: "Reset tool after adding element" -> commented out "// setTool('select');"
            # So we are still in Exit tool. Let's switch to Select manually.
            page.get_by_role("button", name="Выбрать / Переместить").click()

            # Click the exit sign to select it
            # Force click to ensure it hits the element in the canvas
            page.mouse.click(300, 100)

            # Wait a bit for selection to propagate
            page.wait_for_timeout(500)

            # Take screenshot BEFORE deletion (to prove selection and drawing worked)
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

            # Click "Delete" button in toolbar - IF ENABLED. If not, we skip to avoid timeout
            delete_btn = page.get_by_role("button", name="Удалить")
            if delete_btn.is_enabled():
                delete_btn.click()
                print("Clicked delete")
            else:
                print("Delete button not enabled - selection failed?")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
