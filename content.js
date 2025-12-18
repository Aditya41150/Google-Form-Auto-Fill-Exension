console.log("✅ Google Forms Autofill content script loaded");

const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === "fill_form") {
    fillForm().then(
      (count) => sendResponse({ ok: true, filled: count }),
      (err) => sendResponse({ ok: false, error: String(err) })
    );
    return true; // async response
  }
});

// Auto-fill on load if enabled
chrome.storage.sync.get(["autoFillOnLoad"], ({ autoFillOnLoad }) => {
  if (autoFillOnLoad) {
    setTimeout(() => fillForm().catch(() => {}), 700);
  }
});

// Main logic: match by aria-label and question blocks
async function fillForm() {
  const { mappings = {} } = await new Promise((resolve) =>
    chrome.storage.sync.get(["mappings"], resolve)
  );

  if (!mappings || !Object.keys(mappings).length) {
    alert("No mappings saved yet.");
    return 0;
  }

  const normMap = new Map();
  Object.entries(mappings).forEach(([k, v]) => {
    normMap.set(normalize(k), v);
  });

  let filledCount = 0;

  // 1) Direct inputs by aria-label
  const directInputs = document.querySelectorAll(
    'input[aria-label], textarea[aria-label], select[aria-label]'
  );
  directInputs.forEach((el) => {
    const key = normalize(el.getAttribute("aria-label"));
    if (!key) return;
    if (!normMap.has(key)) return;
    const val = normMap.get(key);
    const tag = el.tagName.toLowerCase();
    if (tag === "select") {
      setSelectValue(el, val) && filledCount++;
    } else {
      setNativeValue(el, val);
      filledCount++;
    }
  });

  // 2) Per question block fallback (handles radios/checkboxes and headings)
  const questionBlocks = document.querySelectorAll("div[role='listitem']");
  questionBlocks.forEach((block) => {
    const heading = block.querySelector("div[role='heading']");
    const qText = normalize(heading ? heading.innerText : "");
    if (!qText) return;

    let answer;
    // Exact normalized match first
    if (normMap.has(qText)) {
      answer = normMap.get(qText);
    } else {
      // Partial: pick the first mapping whose key is included in question
      for (const [k, v] of normMap.entries()) {
        if (qText.includes(k)) {
          answer = v;
          break;
        }
      }
    }
    if (answer == null) return;

    // Text inputs/textarea inside the block
    const textInput =
      block.querySelector("input[type='text']") ||
      block.querySelector("input[type='email']") ||
      block.querySelector("input[type='url']") ||
      block.querySelector("textarea");
    if (textInput) {
      setNativeValue(textInput, String(answer));
      filledCount++;
      return;
    }

    // Date/time inputs
    const dateInput = block.querySelector("input[type='date']");
    if (dateInput) {
      setNativeValue(dateInput, String(answer));
      filledCount++;
    }

    const timeInput = block.querySelector("input[type='time']");
    if (timeInput) {
      setNativeValue(timeInput, String(answer));
      filledCount++;
    }

    // Radios / Checkboxes
    const options = block.querySelectorAll(
      "div[role='radio'], div[role='checkbox']"
    );
    if (options && options.length) {
      const ansNorm = normalize(String(answer));
      options.forEach((opt) => {
        const txt = normalize(opt.innerText || opt.getAttribute("aria-label"));
        if (txt && (txt === ansNorm || txt.includes(ansNorm))) {
          opt.click();
          filledCount++;
        }
      });
    }

    // Selects (some forms render custom selects; try native first)
    const select = block.querySelector("select");
    if (select) {
      setSelectValue(select, String(answer)) && filledCount++;
    }
  });

  if (filledCount > 0) {
    toast(`Autofilled ${filledCount} field${filledCount > 1 ? "s" : ""}.`);
  } else {
    alert("No matching fields found to fill.");
  }
  return filledCount;
}

// Helper to simulate real typing so Forms detects the change
function setNativeValue(element, value) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function setSelectValue(select, value) {
  const valNorm = normalize(String(value));
  let matched = false;
  for (const opt of Array.from(select.options)) {
    const optNorm = normalize(opt.textContent || opt.value);
    if (optNorm === valNorm || optNorm.includes(valNorm)) {
      select.value = opt.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      matched = true;
      break;
    }
  }
  return matched;
}

// Lightweight toast (non-blocking)
function toast(message) {
  try {
    const div = document.createElement("div");
    div.textContent = message;
    div.style.cssText =
      "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1a73e8;color:#fff;padding:8px 12px;border-radius:6px;font:13px/1.2 Arial, sans-serif;z-index:2147483647;box-shadow:0 2px 8px rgba(0,0,0,.2)";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2200);
  } catch (_) {
    // ignore
  }
}
