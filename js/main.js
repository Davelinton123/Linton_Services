/* ==========================================================================
   Linton Services — behaviour
   Edit CONFIG and APPLIANCES below; everything else is wired up for you.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Configuration ---------- */
  const CONFIG = {
    businessName: "Linton Services",
    whatsappNumber: "2349033880869", // international format, no "+" or spaces
    email: "toludav2015@gmail.com",
    panelWatts: 400,        // size of one solar panel
    peakSunHours: 4.5,      // average usable sun hours per day
    depthOfDischarge: 0.8,  // usable share of battery capacity
    systemEfficiency: 0.85, // inverter + wiring losses
    powerFactor: 0.8,       // converts watts to kVA
    surgeMargin: 1.25       // headroom for start-up surges
  };

  // name, running watts, hint, default quantity
  const APPLIANCES = [
    { id: "bulb",  name: "LED bulbs",        watts: 10,   hint: "10 W each",        qty: 8 },
    { id: "fan",   name: "Ceiling / standing fans", watts: 60, hint: "60 W each",   qty: 2 },
    { id: "tv",    name: "Television",       watts: 100,  hint: "100 W each",       qty: 1 },
    { id: "pc",    name: "Laptop / desktop", watts: 80,   hint: "80 W each",        qty: 1 },
    { id: "fridge",name: "Refrigerator",     watts: 150,  hint: "150 W average",    qty: 1 },
    { id: "freezer",name: "Chest freezer",   watts: 200,  hint: "200 W average",    qty: 0 },
    { id: "ac",    name: "Air conditioner (1 hp)", watts: 900, hint: "900 W each",  qty: 0 },
    { id: "pump",  name: "Water pump (0.5 hp)", watts: 370, hint: "370 W each",    qty: 0 }
  ];

  const INVERTER_SIZES_KVA = [1, 1.5, 2.5, 3.5, 5, 7.5, 10, 15, 20];

  /* ---------- Tiny helpers ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const safeStorage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  };
  const fmt = (n, d = 0) => n.toLocaleString("en-NG", { maximumFractionDigits: d, minimumFractionDigits: d });

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  function applyTheme(t) {
    root.dataset.theme = t;
    themeBtn.setAttribute("aria-pressed", String(t === "dark"));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === "dark" ? "#141a2b" : "#fbf6ee";
  }
  applyTheme(safeStorage.get("ls-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    safeStorage.set("ls-theme", next);
  });

  /* ---------- Header: scroll state, mobile menu, scroll-spy ---------- */
  const header = $(".site-header");
  const toTop = $("#toTop");
  const nav = $("#nav");
  const menuBtn = $("#menuBtn");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    toTop.classList.toggle("is-visible", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  const navLinks = $$(".nav a");
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(a => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });

  /* ---------- Reveal on scroll (with gentle stagger) ---------- */
  const revealEls = $$(".reveal");
  revealEls.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.max(0, siblings.indexOf(el)) * 90}ms`);
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-in"));
  }

  /* ---------- Service filter ---------- */
  const filterBtns = $$(".service-filters .chip");
  const serviceCards = $$(".service");
  filterBtns.forEach(btn => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach(b => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    serviceCards.forEach(card => {
      const show = f === "all" || card.dataset.group === f;
      card.classList.toggle("is-hidden", !show);
      if (show) card.classList.add("is-in");
    });
  }));

  /* ---------- Contact form helpers (declared early; used by calculator) ---------- */
  const form = $("#quoteForm");
  const serviceBoxes = $$('input[name="service"]', form);
  const note = $("#formNote");

  function selectServices(names) {
    serviceBoxes.forEach(b => { b.checked = names.includes(b.value); });
  }
  function goToContact(names) {
    if (names) selectServices(names);
    $("#contact").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#name").focus({ preventScroll: true }), 650);
  }
  $$("[data-pick]").forEach(btn => btn.addEventListener("click", () => goToContact([btn.dataset.pick])));

  /* ---------- Solar planner ---------- */
  const list = $("#appliances");
  const state = Object.fromEntries(APPLIANCES.map(a => [a.id, a.qty]));
  const backup = $("#backup");
  const out = { load: $("#rLoad"), inv: $("#rInv"), bat: $("#rBat"), pan: $("#rPan") };
  let lastCalc = null;

  list.innerHTML = APPLIANCES.map(a => `
    <li class="appliance">
      <span class="appliance-name">${a.name}<small>${a.hint}</small></span>
      <span class="stepper" role="group" aria-label="${a.name} quantity">
        <button type="button" data-id="${a.id}" data-d="-1" aria-label="Decrease ${a.name}">−</button>
        <output id="q-${a.id}" aria-live="polite">${a.qty}</output>
        <button type="button" data-id="${a.id}" data-d="1" aria-label="Increase ${a.name}">+</button>
      </span>
    </li>`).join("");

  list.addEventListener("click", e => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    state[id] = Math.min(20, Math.max(0, state[id] + Number(btn.dataset.d)));
    $(`#q-${id}`).textContent = state[id];
    calculate();
  });
  backup.addEventListener("input", calculate);

  function bump(el) { const p = el.parentElement; p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump"); }
  function setOut(el, text) { if (el.textContent !== text) { el.textContent = text; bump(el); } }

  function calculate() {
    const hours = Number(backup.value);
    backup.style.setProperty("--fill", `${((hours - backup.min) / (backup.max - backup.min)) * 100}%`);
    $("#backupOut").textContent = `${hours} hour${hours === 1 ? "" : "s"}`;

    const watts = APPLIANCES.reduce((sum, a) => sum + a.watts * state[a.id], 0);
    if (watts === 0) {
      lastCalc = null;
      setOut(out.load, "0 W"); setOut(out.inv, "—"); setOut(out.bat, "—"); setOut(out.pan, "—");
      return;
    }
    const kva = (watts * CONFIG.surgeMargin) / CONFIG.powerFactor / 1000;
    const inverter = INVERTER_SIZES_KVA.find(s => s >= kva) ?? Math.ceil(kva);
    const dailyWh = watts * hours;
    const batteryKWh = dailyWh / CONFIG.depthOfDischarge / 1000;
    const panels = Math.ceil(dailyWh / CONFIG.systemEfficiency / CONFIG.peakSunHours / CONFIG.panelWatts);

    setOut(out.load, `${fmt(watts)} W`);
    setOut(out.inv, `${fmt(inverter, inverter % 1 ? 1 : 0)} kVA`);
    setOut(out.bat, `${fmt(batteryKWh, 1)} kWh`);
    setOut(out.pan, `${panels} panel${panels === 1 ? "" : "s"}`);
    lastCalc = { watts, hours, inverter, batteryKWh, panels };
  }
  calculate();

  $("#calcQuote").addEventListener("click", () => {
    goToContact(["Solar & Inverter"]);
    const msg = $("#message");
    if (lastCalc && !msg.value.trim()) {
      msg.value = `Solar planner estimate: ~${fmt(lastCalc.watts)} W load, ${lastCalc.hours} h backup → about ${fmt(lastCalc.inverter, lastCalc.inverter % 1 ? 1 : 0)} kVA inverter, ${fmt(lastCalc.batteryKWh, 1)} kWh battery, ${lastCalc.panels} × ${CONFIG.panelWatts} W panels. Please advise.`;
      $("#msgCount").textContent = msg.value.length;
    }
  });

  /* ---------- Quote form ---------- */
  const fields = {
    service: { box: $("#err-service") },
    name:    { el: $("#name"),  box: $("#err-name") },
    phone:   { el: $("#phone"), box: $("#err-phone") },
    email:   { el: $("#email"), box: $("#err-email") }
  };
  const msgEl = $("#message");
  msgEl.addEventListener("input", () => { $("#msgCount").textContent = msgEl.value.length; });

  function setError(key, text) {
    const f = fields[key];
    f.box.textContent = text;
    const wrap = (f.el ?? f.box).closest(".field");
    wrap.classList.toggle("has-error", Boolean(text));
    if (f.el) f.el.setAttribute("aria-invalid", text ? "true" : "false");
  }
  function validate() {
    const errors = {};
    const services = serviceBoxes.filter(b => b.checked).map(b => b.value);
    if (!services.length) errors.service = "Please choose at least one service.";
    if (fields.name.el.value.trim().length < 2) errors.name = "Please tell us your name.";
    const digits = fields.phone.el.value.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) errors.phone = "Enter a valid phone number (at least 10 digits).";
    const mail = fields.email.el.value.trim();
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) errors.email = "That email doesn't look right.";
    Object.keys(fields).forEach(k => setError(k, errors[k] || ""));
    const firstBad = Object.keys(errors)[0];
    if (firstBad) (fields[firstBad].el ?? serviceBoxes[0]).focus();
    return { ok: !firstBad, services };
  }
  function buildMessage(services) {
    const lines = [
      `Hello ${CONFIG.businessName}, I'd like a quote.`,
      `Service(s): ${services.join(", ")}`,
      `Name: ${fields.name.el.value.trim()}`,
      `Phone: ${fields.phone.el.value.trim()}`
    ];
    if (fields.email.el.value.trim()) lines.push(`Email: ${fields.email.el.value.trim()}`);
    if (msgEl.value.trim()) lines.push("", msgEl.value.trim());
    return lines.join("\n");
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const { ok, services } = validate();
    if (!ok) { note.textContent = ""; return; }
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildMessage(services))}`;
    window.open(url, "_blank", "noopener");
    note.textContent = "Opening WhatsApp… if nothing happens, please allow pop-ups or use the email option.";
  });
  $("#emailInstead").addEventListener("click", () => {
    const { ok, services } = validate();
    if (!ok) return;
    const subject = encodeURIComponent(`Quote request — ${services.join(", ")}`);
    location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${encodeURIComponent(buildMessage(services))}`;
    note.textContent = "Opening your email app…";
  });
  [fields.name.el, fields.phone.el, fields.email.el].forEach(el =>
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") setError(el.id, ""); }));
  serviceBoxes.forEach(b => b.addEventListener("change", () => setError("service", "")));

  /* ---------- Footer year + header CTA ---------- */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-service]").forEach(a => a.addEventListener("click", () => selectServices([])));
})();
