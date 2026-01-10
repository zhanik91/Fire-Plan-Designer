
from playwright.sync_api import sync_playwright

def verify_legend_and_shortcuts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the editor
        page.goto("http://localhost:5000/")

        # 1. Clear plan first
        page.get_by_role("button", name="Очистить всё").click()

        # 2. Check empty legend
        # The legend should say "Элементы не добавлены" or be empty except header
        # We need to check if standard icons are GONE.
        # "ВЫХОД" (Exit) is a good check.

        # Wait a bit for React to update
        page.wait_for_timeout(500)

        if page.get_by_text("ВЫХОД").count() > 0:
            # It might be in the sidebar, so we need to be careful with selectors.
            # Legend is in .bg-white.border.p-4.rounded-md.shadow-sm.w-full (Sidebar is separate)
            # Let's check specifically in Legend.
            # But the sidebar also has "ВЫХОД" (Exit button).
            # Legend text is "ВЫХОД" (inside the green box) AND "Эвакуационный выход" (label).
            # The sidebar button label is "Эвакуационный выход".
            # The legend label is "Эвакуационный выход".

            # Let's add an element and see if it APPEARS.
            pass

        print("Adding an Exit element...")
        # Click "Эвакуационный выход" in Sidebar to activate tool
        # Sidebar button text: "Эвакуационный выход"
        # We have multiple "Эвакуационный выход" texts on screen (Sidebar button, maybe Legend).
        # Use the button in sidebar specifically. Sidebar has buttons with text.
        page.get_by_role("button", name="Эвакуационный выход").click()

        # Click on canvas to add it
        canvas = page.locator("canvas").first
        canvas.click(position={"x": 300, "y": 300})

        # Now Legend should show "Эвакуационный выход"
        page.wait_for_timeout(500)

        # Verify "ВЫХОД" text exists in the DOM (the visual symbol in Legend)
        # Note: Konva canvas doesn't render DOM nodes for canvas elements, but Legend is DOM.
        legend_exit = page.get_by_text("ВЫХОД", exact=True)
        if legend_exit.count() == 0:
            print("FAILURE: Legend did not update to show Exit.")
        else:
            print("SUCCESS: Legend updated to show Exit.")

        # 3. Test Undo (Ctrl+Z)
        print("Testing Undo...")
        page.keyboard.press("Control+z")
        page.wait_for_timeout(500)

        # Exit should be gone from canvas (and Legend)
        # It's hard to check canvas content without visual regression or inspecting internal state.
        # But Legend should update!
        if legend_exit.count() > 0:
             # Wait, maybe it didn't update yet?
             page.wait_for_timeout(500)
             if legend_exit.count() > 0:
                 print("FAILURE: Undo did not remove Exit from Legend (or Model).")
             else:
                 print("SUCCESS: Undo removed Exit.")
        else:
             print("SUCCESS: Undo removed Exit.")

        # 4. Take screenshot
        page.screenshot(path="/home/jules/verification/smart_legend.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_legend_and_shortcuts()
