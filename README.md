# Google Forms Autofill (MV3)

A Chrome extension to quickly auto-fill Google Forms with your saved answers.

## Features
- Save key → answer pairs (e.g., "Name" → "Jane Doe").
- Match by question text or the input's aria-label.
- Supports text, textarea, select, radios, and checkboxes.
- Bulk import/export your mappings as JSON.
- Optional: auto-fill as soon as a form loads.

## Install (Developer Mode)
1. Download/clone this folder.
2. Open Chrome → More Tools → Extensions.
3. Enable Developer mode (top-right).
4. Click "Load unpacked" and select this folder.

## Usage
1. Open a Google Form in a tab.
2. Click the extension icon to open the popup.
3. Add mappings or import JSON like:
   ```json
   {
     "Name": "Jane Doe",
     "Email": "jane@example.com",
     "Role": "Student"
   }
   ```
4. Click "Fill Form". The content script will map your keys to questions/labels and fill fields. You can enable auto-fill on load if you prefer.

## Notes
- Matching is case-insensitive and accent-insensitive. It tries exact matches first, then partial matches.
- For selects and options, matching uses visible option text.
- If nothing fills, check the exact question text or try enabling partial keywords (e.g., use "Phone" instead of the entire question).

## Privacy
All data is stored locally using Chrome `storage.sync` (synchronized to your Chrome profile if signed in).

## Troubleshooting
- If the popup says the content script can't be reached, refresh the Google Form tab and try again.
- If some fields don't fill, try simplifying the key to the main keyword of the question.

