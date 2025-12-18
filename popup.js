const els = {
  key: document.getElementById("questionKey"),
  val: document.getElementById("answerText"),
  save: document.getElementById("saveBtn"),
  fill: document.getElementById("fillBtn"),
  list: document.getElementById("savedList"),
  bulkJson: document.getElementById("bulkJson"),
  importBtn: document.getElementById("importBtn"),
  exportBtn: document.getElementById("exportBtn"),
  clearAll: document.getElementById("clearAllBtn"),
  autoFillOnLoad: document.getElementById("autoFillOnLoad"),
};

const normalize = (s) =>
  (s || "")
    .toString()
    .trim();

document.addEventListener("DOMContentLoaded", () => {
  refreshUI();
});

els.save.addEventListener("click", async () => {
  const key = normalize(els.key.value);
  const value = normalize(els.val.value);
  if (!key) return alert("Please enter a question keyword.");
  const { mappings = {} } = await storageGet(["mappings"]);
  mappings[key] = value;
  await storageSet({ mappings });
  els.key.value = "";
  els.val.value = "";
  refreshUI();
});

els.fill.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return alert("No active tab found.");
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, { action: "fill_form" }, (response) => {
      if (chrome.runtime.lastError) {
        return alert(
          "Could not reach the content script. Refresh the Google Form tab and try again."
        );
      }
      if (response && response.ok) {
        // no-op; content shows a toast
      }
    });
  });
});

els.importBtn?.addEventListener("click", async () => {
  const text = els.bulkJson.value.trim();
  if (!text) return alert("Paste a JSON object first.");
  try {
    const obj = JSON.parse(text);
    if (typeof obj !== "object" || Array.isArray(obj))
      throw new Error("Expected a JSON object of key-value pairs.");
    const { mappings = {} } = await storageGet(["mappings"]);
    Object.assign(mappings, obj);
    await storageSet({ mappings });
    els.bulkJson.value = "";
    refreshUI();
  } catch (e) {
    alert("Invalid JSON: " + e.message);
  }
});

els.exportBtn?.addEventListener("click", async () => {
  const { mappings = {} } = await storageGet(["mappings"]);
  els.bulkJson.value = JSON.stringify(mappings, null, 2);
});

els.clearAll?.addEventListener("click", async () => {
  if (!confirm("Clear all saved mappings?")) return;
  await storageSet({ mappings: {} });
  refreshUI();
});

els.autoFillOnLoad?.addEventListener("change", async (e) => {
  await storageSet({ autoFillOnLoad: !!e.target.checked });
});

async function refreshUI() {
  const { mappings = {}, autoFillOnLoad = false } = await storageGet([
    "mappings",
    "autoFillOnLoad",
  ]);
  els.autoFillOnLoad.checked = !!autoFillOnLoad;
  renderList(mappings);
}

function renderList(mappings) {
  els.list.innerHTML = "";
  const keys = Object.keys(mappings);
  if (!keys.length) {
    els.list.innerHTML = '<div class="empty">No mappings yet.</div>';
    return;
  }
  keys.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  for (const k of keys) {
    const item = document.createElement("div");
    item.className = "mapping";
    item.innerHTML = `
      <div class="kv"><strong>${escapeHTML(k)}</strong><span>${escapeHTML(
      String(mappings[k])
    )}</span></div>
      <button class="icon danger" title="Delete">✕</button>
    `;
    const delBtn = item.querySelector("button");
    delBtn.addEventListener("click", async () => {
      const { mappings: current = {} } = await storageGet(["mappings"]);
      delete current[k];
      await storageSet({ mappings: current });
      refreshUI();
    });
    els.list.appendChild(item);
  }
}

function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.sync.get(keys, resolve));
}

function storageSet(obj) {
  return new Promise((resolve) => chrome.storage.sync.set(obj, resolve));
}

function escapeHTML(s) {
  return (s || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
