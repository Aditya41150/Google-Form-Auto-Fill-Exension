# Google Forms Autofill 

Chrome extension to auto-fill Google Forms from your saved answers.
## JUST DOWNLOAD THIS REPOSITORY , Code->download ZIP follow following steps

# IMPORTANT STEPS: 
## Load Unpacked (Install in Developer Mode)
1. Download or clone this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Turn on "Developer mode" (switch in the top-right corner).
4. Click "Load unpacked" and select the downloaded folder.
5. The extension should appear in your list. Optionally click the puzzle icon in the toolbar and pin the extension for quick access.

## Update / Reload After Making Changes
- When you edit files in this folder, go to `chrome://extensions/` and click the "Reload" button on the extension card to apply changes.
- If a Google Form tab is already open, refresh that tab so the updated content script runs.

## Disable or Remove (Uninstall)
- Disable: toggle off the switch on the extension card in `chrome://extensions/`.
- Remove: click "Remove" on the extension card to uninstall it.

## Usage: Filling a Google Form
1. Open a Google Form (`https://docs.google.com/forms/...`).
2. Click the extension icon to open the popup.
3. Add a mapping:
  - Question Keyword: a word or short phrase from the question text or label (e.g., `Name`, `Email`).
  - Answer: your desired answer.
  - Click "Save Pair". Repeat for as many fields as you like.
4. (Optional) Bulk import mappings: paste a JSON object and click "Import JSON". Example:
  ```json
  {
    "Name": "Jane Doe",
    "Email": "jane@example.com",
    "Role": "Student"
  }
  ```
5. Click "Fill Form". A toast appears with how many fields were filled. You can also enable "Auto-fill when a form loads".

### How Matching Works
- Matching is case-insensitive and accent-insensitive. The extension normalizes text before matching.
- It first tries exact matches between your key and the question/label. If none, it tries partial matches (key contained in question text).
- For options (radio/checkbox/select), it matches by the visible option text.

### Tips for Good Matches
- Use concise keywords (e.g., `Phone`, `Department`, `Email`).
- If a field doesn't fill, try simplifying the key or confirming the question text on the page.
- For selects or multiple-choice, ensure your answer text closely matches the visible option.

## Privacy
- Your mappings are stored locally using Chrome `storage.sync`. If you're signed into Chrome, they may sync across your devices with the same profile.
- No data is sent to any server by this extension.

## For Microsoft Edge or Other Chromium Browsers
- Edge: use `edge://extensions/` for load, reload, and removal; steps are the same.
- Brave/Vivaldi: use their `chrome://extensions/` equivalent pages.

## Files
- `manifest.json`: Chrome Manifest V3 configuration.
- `content.js`: autofill logic injected into Google Forms pages.
- `popup.html`, `popup.js`, `style.css`: popup UI to manage mappings and trigger fill.

