// NEST_WIDGET core. Loaded by the small Nest script in Scriptable, so it can update without re-pasting.
// Shows Hilal's one quest for today, the pillar colour and the next prayer. No scores, no counts.
const DATA = "https://raw.githubusercontent.com/ndurrr/ndurrr/refs/heads/claude/project-thread-46cnd6/nest/today.json";
const NEST = "https://claude.ai/artifact/WJKYr1n46wUmV1EmSx25Ln";
const PILLARS = {
  build:  { name: "Build",  c: "#6ea8ff" },
  sell:   { name: "Free",   c: "#e6a740" },
  body:   { name: "Body",   c: "#6fcf97" },
  mind:   { name: "Mind",   c: "#b49cff" },
  wealth: { name: "Wealth", c: "#4fd1c5" },
  roam:   { name: "Roam",   c: "#ff8a6b" }
};
const GOLD = "#e6a740";
const LONDON = { lat: 51.5074, lng: -0.1278 };

// Same day themes the Nest uses: Mon/Wed/Fri sales, Tue/Thu Pulse Wrld build, weekend body and rest.
function fallback(d) {
  const w = d.getDay();
  if (w === 1 || w === 3 || w === 5) return { quest: "Call one warm Grey Hawk lead and just listen.", pillar: "sell", line: "sales day." };
  if (w === 2 || w === 4) return { quest: "Unblock one thing for the Pulse Wrld team.", pillar: "build", line: "build day." };
  return { quest: "Train first, then be with your people.", pillar: "body", line: "rest is part of the work." };
}

// Prayer times, Muslim World League (Fajr 18°, Isha 17°), ported from the Nest's five anchors.
const RAD = Math.PI / 180, dsin = x => Math.sin(x * RAD), dcos = x => Math.cos(x * RAD), dtan = x => Math.tan(x * RAD),
  dasin = x => Math.asin(x) / RAD, dacos = x => Math.acos(x) / RAD, datan2 = (y, x) => Math.atan2(y, x) / RAD, dacot = x => Math.atan(1 / x) / RAD;
const fixA = a => a - 360 * Math.floor(a / 360), fixH = a => a - 24 * Math.floor(a / 24);
function prayerTimes(date, c) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  let Y = y, M = m; if (M <= 2) { Y--; M += 12; } const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 - c.lng / (15 * 24);
  const sun = j => { const D = j - 2451545, g = fixA(357.529 + .98560028 * D), q = fixA(280.459 + .98564736 * D), L = fixA(q + 1.915 * dsin(g) + .020 * dsin(2 * g)), e = 23.439 - .00000036 * D; const RA = fixH(datan2(dcos(e) * dsin(L), dcos(L)) / 15); return { decl: dasin(dsin(e) * dsin(L)), eqt: q / 15 - RA }; };
  const mid = t => fixH(12 - sun(jd + t).eqt);
  const ang = (a, t, ccw) => { const dc = sun(jd + t).decl, n = mid(t); const T = dacos((-dsin(a) - dsin(dc) * dsin(c.lat)) / (dcos(dc) * dcos(c.lat))) / 15; return n + (ccw ? -T : T); };
  const asr = (f, t) => { const dc = sun(jd + t).decl; return ang(-dacot(f + dtan(Math.abs(c.lat - dc))), t); };
  const T = { Fajr: ang(18, 5 / 24, true), sunrise: ang(.833, 6 / 24, true), Dhuhr: mid(12 / 24), Asr: asr(1, 13 / 24), Maghrib: ang(.833, 18 / 24), Isha: ang(17, 18 / 24) };
  const night = 24 - (T.Maghrib - T.sunrise);
  if (isNaN(T.Fajr) || T.sunrise - T.Fajr > 18 / 60 * night) T.Fajr = T.sunrise - 18 / 60 * night;
  if (isNaN(T.Isha) || T.Isha - T.Maghrib > 17 / 60 * night) T.Isha = T.Maghrib + 17 / 60 * night;
  const base = Date.UTC(y, m - 1, d), out = {};
  for (const k of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) out[k] = new Date(base + (T[k] - c.lng / 15) * 3600e3);
  return out;
}
function nextPrayer(now) {
  const t = prayerTimes(now, LONDON);
  for (const k of Object.keys(t)) if (t[k] > now) return { name: k, at: t[k] };
  const tm = prayerTimes(new Date(now.getTime() + 864e5), LONDON);
  return { name: "Fajr", at: tm.Fajr };
}
const hhmm = d => { const f = new DateFormatter(); f.dateFormat = "HH:mm"; return f.string(d); };
const ymd = d => { const f = new DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f.string(d); };

async function loadToday(now) {
  const fm = FileManager.local(), cache = fm.joinPath(fm.cacheDirectory(), "nest-today.json");
  let data = null;
  try { const r = new Request(DATA + "?t=" + Math.floor(now.getTime() / 6e5)); r.timeoutInterval = 8; data = await r.loadJSON(); fm.writeString(cache, JSON.stringify(data)); }
  catch (e) { try { data = JSON.parse(fm.readString(cache)); } catch (e2) {} }
  // Yesterday's quest is not today's. Fall back to the day theme until Hilal writes.
  if (!data || data.date !== ymd(now) || !data.quest) return Object.assign(fallback(now), { stale: true });
  return data;
}

const mono = (s, w) => Font.regularMonospacedSystemFont(s);
const monoB = s => Font.semiboldMonospacedSystemFont(s);
function bgGradient() {
  const g = new LinearGradient();
  g.colors = [Color.dynamic(new Color("#f7f5ef"), new Color("#17140d")), Color.dynamic(new Color("#efece4"), new Color("#0b0b0c"))];
  g.locations = [0, 1];
  return g;
}
const ink = Color.dynamic(new Color("#191917"), new Color("#ecebe6"));
const dim = Color.dynamic(new Color("#6f6e69"), new Color("#8b8a86"));

async function build() {
  const now = new Date();
  const fam = config.widgetFamily || "medium";
  const t = await loadToday(now);
  const p = PILLARS[t.pillar] || { name: "", c: GOLD };
  const pc = new Color(p.c);
  const np = nextPrayer(now);
  const w = new ListWidget();
  w.url = NEST;
  // Refresh soon after the next prayer so the anchor line stays true.
  w.refreshAfterDate = new Date(Math.min(np.at.getTime() + 60e3, now.getTime() + 30 * 60e3));

  if (fam === "accessoryInline") { w.addText("🪶 " + t.quest); return w; }
  if (fam === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true;
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const a = s.addText(np.name); a.font = monoB(10); a.centerAlignText();
    const b = s.addText(hhmm(np.at)); b.font = mono(12); b.centerAlignText();
    return w;
  }
  if (fam === "accessoryRectangular") {
    const h = w.addText("HILAL"); h.font = monoB(10);
    const q = w.addText(t.quest); q.font = mono(12); q.lineLimit = 3; q.minimumScaleFactor = .8;
    return w;
  }

  w.backgroundGradient = bgGradient();
  const pad = fam === "small" ? 14 : 16;
  w.setPadding(pad, pad, pad, pad);

  const top = w.addStack(); top.centerAlignContent();
  const dot = top.addText("●"); dot.font = mono(9); dot.textColor = pc;
  top.addSpacer(6);
  const lab = top.addText(fam === "small" ? "HILAL" : "HILAL SAYS"); lab.font = monoB(10); lab.textColor = new Color(GOLD);
  top.addSpacer();
  if (fam !== "small" && p.name) { const pn = top.addText(p.name.toUpperCase()); pn.font = mono(9); pn.textColor = pc; }

  w.addSpacer(fam === "small" ? 8 : 10);
  const q = w.addText(t.quest);
  q.font = Font.mediumMonospacedSystemFont(fam === "large" ? 20 : fam === "small" ? 13 : 15);
  q.textColor = ink; q.lineLimit = fam === "small" ? 5 : 4; q.minimumScaleFactor = .7;

  if (fam !== "small" && t.line) {
    w.addSpacer(6);
    const l = w.addText(t.line); l.font = mono(11); l.textColor = dim; l.lineLimit = fam === "large" ? 4 : 2;
  }

  w.addSpacer();
  const bot = w.addStack(); bot.centerAlignContent();
  const pr = bot.addText(np.name + " " + hhmm(np.at)); pr.font = mono(10); pr.textColor = dim;
  bot.addSpacer();
  if (fam !== "small") { const go = bot.addText("open the nest →"); go.font = mono(10); go.textColor = new Color(GOLD); }
  return w;
}

module.exports.run = async () => {
  const w = await build();
  if (config.runsInWidget || config.runsInAccessoryWidget) Script.setWidget(w);
  else { await w.presentMedium(); }
  Script.complete();
};
