// The Nest widget. Paste this into a new Scriptable script called "Nest".
// It fetches the latest widget code each time, so it never needs pasting again.
const URL = "https://raw.githubusercontent.com/ndurrr/ndurrr/refs/heads/claude/project-thread-46cnd6/nest/widget.js";
const fm = FileManager.local();
const path = fm.joinPath(fm.documentsDirectory(), "nest-widget-core.js");
try { const s = await new Request(URL).loadString(); if (s.includes("NEST_WIDGET")) fm.writeString(path, s); } catch (e) {}
await importModule(path).run();
