/* =========================
   Thesis Help Pakistan
   Single-page site logic
   ========================= */

// --- CONFIG (edit these) ---
const CONFIG = {
  whatsappNumber: "923000000000", // format: countrycode + number (no +, no spaces)
  whatsappDisplay: "+92 300 0000000",
  email: "info@thesishelppakistan.com",
  currency: "PKR"
};

// --- DOM Helpers ---
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function formatPKR(amount) {
  const n = Math.round(amount);
  return `${CONFIG.currency} ${n.toLocaleString("en-PK")}`;
}

function makeWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`;
}

// --- NAV (mobile) ---
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // close on click
  $$("#navMenu a").forEach(a => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// --- Footer year + contact info ---
$("#year").textContent = new Date().getFullYear();
$("#waDisplay").textContent = CONFIG.whatsappDisplay;
$("#emailDisplay").textContent = CONFIG.email;

// WhatsApp floating link
const waFloat = $("#waFloat");
if (waFloat) {
  waFloat.href = makeWhatsAppLink("Hello Thesis Help Pakistan! I want a quote for academic help.");
}

// --- Samples modal ---
const modal = $("#sampleModal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");

const SAMPLE_CONTENT = {
  sample1: {
    title: "Literature Review (Excerpt) — Sample",
    body: `
      <p><strong>Scope:</strong> The literature review synthesizes key themes, identifies gaps, and builds a logical foundation for the research problem.</p>
      <p><strong>What a professional excerpt looks like:</strong></p>
      <ul>
        <li>Clear thematic headings and transitions</li>
        <li>Consistent citation style (APA/MLA/Chicago)</li>
        <li>Balanced critical analysis (not only summaries)</li>
        <li>Gap identification leading into research questions</li>
      </ul>
      <p class="muted">Replace this demo text with your anonymized sample pages (PDF screenshots or plain text snippets).</p>
    `
  },
  sample2: {
    title: "Data Analysis + Interpretation — Sample",
    body: `
      <p><strong>Scope:</strong> Cleaning, descriptive statistics, reliability checks, correlation/regression (as relevant), and interpretation aligned to research objectives.</p>
      <ul>
        <li>Tables: descriptive statistics (mean, SD), reliability (Cronbach’s alpha)</li>
        <li>Inferential: correlation/regression/ANOVA where appropriate</li>
        <li>Write-up: results + interpretation in academic style</li>
      </ul>
      <p class="muted">Tip: Add a screenshot of a sample table and short interpretation to boost trust.</p>
    `
  },
  sample3: {
    title: "Methodology Section — Sample",
    body: `
      <p><strong>Scope:</strong> Research design, sampling, instruments, procedure, validity/reliability, and ethical considerations.</p>
      <ul>
        <li>Clear alignment with research questions</li>
        <li>Operational definitions and variables</li>
        <li>Data collection and analysis plan</li>
      </ul>
      <p class="muted">Replace with your real anonymized methodology pages.</p>
    `
  }
};

function openModal(key) {
  if (!modal) return;
  const content = SAMPLE_CONTENT[key];
  if (!content) return;

  modalTitle.textContent = content.title;
  modalBody.innerHTML = content.body;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$$(".sample").forEach(btn => {
  btn.addEventListener("click", () => openModal(btn.dataset.sample));
});

$("#modalClose")?.addEventListener("click", closeModal);
$("#modalClose2")?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target && e.target.dataset && e.target.dataset.close) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("open")) closeModal();
});

// --- Reviews slider ---
const REVIEWS = [
  {
    name: "Ayesha K.",
    city: "Lahore",
    rating: 5,
    text: "Very professional formatting and proofreading. My document looked clean and submission-ready. Excellent communication."
  },
  {
    name: "Bilal S.",
    city: "Islamabad",
    rating: 5,
    text: "Helped me structure my proposal and synopsis properly. Clear methodology plan and strong references."
  },
  {
    name: "Hira M.",
    city: "Karachi",
    rating: 4,
    text: "Data analysis support was solid and the results section was written in an academic tone. Delivered on time."
  }
];

let reviewIndex = 0;
function renderReview(i) {
  const card = $("#reviewCard");
  if (!card) return;
  const r = REVIEWS[i];
  const stars = "★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating);

  card.innerHTML = `
    <div class="review-meta">
      <div>
        <div style="font-weight:900">${r.name} <span class="muted" style="font-weight:700">• ${r.city}</span></div>
        <div class="stars muted" aria-label="${r.rating} out of 5 stars">${stars}</div>
      </div>
      <div class="pill pill--ghost">Verified Client</div>
    </div>
    <p style="margin:0;color:rgba(234,240,255,.92);line-height:1.75">${r.text}</p>
  `;
}
renderReview(reviewIndex);

$("#reviewPrev")?.addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + REVIEWS.length) % REVIEWS.length;
  renderReview(reviewIndex);
});
$("#reviewNext")?.addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % REVIEWS.length;
  renderReview(reviewIndex);
});

// --- Pricing Calculator Logic ---
// Base rates per page (PKR) by service.
// These are sample rates; adjust to your business.
const BASE = {
  writing: 1200,
  rewriting: 900,
  assignment: 1100,
  research: 1400,
  thesis: 1600,
  analysis: 1800,
  formatting: 650,
  plag: 500,     // for reports: treat as per page estimate or minimum
  removal: 1300
};

// Multipliers
const LEVEL_MULT = { ug: 1.0, ms: 1.2, phd: 1.45 };
const DEADLINE_MULT = { standard: 1.0, urgent: 1.25, express: 1.45 };
const COMPLEX_MULT = { normal: 1.0, technical: 1.18, highlyTechnical: 1.35 };

// Add-ons as percentage or flat
function addonsCost(pages, opts) {
  let add = 0;
  if (opts.formatting) add += pages * 180;
  if (opts.proof) add += pages * 160;
  if (opts.charts) add += Math.max(800, pages * 90);   // minimum to make it worthwhile
  if (opts.report) add += Math.max(900, pages * 70);   // minimum
  return add;
}

function calcTotal(service, level, deadline, pages, complexity, opts) {
  const base = (BASE[service] || 0) * pages;
  const mult = (LEVEL_MULT[level] || 1) * (DEADLINE_MULT[deadline] || 1) * (COMPLEX_MULT[complexity] || 1);
  const add = addonsCost(pages, opts);

  // For plag report / single-task services, enforce a minimum
  const minForService = (service === "plag") ? 1500 : 0;
  const minForRemoval = (service === "removal") ? 3500 : 0;

  const total = Math.max(base * mult + add, minForService, minForRemoval);
  return { total, base, mult, add };
}

// Mini quote (hero card)
function updateMini() {
  const service = $("#miniService").value;
  const pages = Math.max(1, parseInt($("#miniPages").value || "1", 10));
  const deadline = $("#miniDeadline").value;

  // mini uses UG + normal complexity
  const res = calcTotal(service, "ug", deadline, pages, "normal", {
    formatting: false, proof: false, charts: false, report: false
  });

  $("#miniTotal").textContent = formatPKR(res.total);
}
["miniService","miniPages","miniDeadline"].forEach(id => {
  const el = $("#" + id);
  el?.addEventListener("input", updateMini);
  el?.addEventListener("change", updateMini);
});
updateMini();

$("#miniWhatsApp")?.addEventListener("click", () => {
  const service = $("#miniService").value;
  const pages = Math.max(1, parseInt($("#miniPages").value || "1", 10));
  const deadline = $("#miniDeadline").value;
  const estimate = $("#miniTotal").textContent;

  const msg =
`Hello Thesis Help Pakistan!
I need a quote.

Service: ${service}
Pages: ${pages}
Deadline: ${deadline}
Estimated: ${estimate}

Please share final price and timeline.`;

  window.open(makeWhatsAppLink(msg), "_blank");
});

// Full calculator
function updateCalc() {
  const service = $("#service").value;
  const level = $("#level").value;
  const deadline = $("#deadline").value;
  const pages = Math.max(1, parseInt($("#pages").value || "1", 10));
  const complexity = $("#complexity").value;

  const opts = {
    formatting: $("#addonFormatting").checked,
    proof: $("#addonProof").checked,
    charts: $("#addonCharts").checked,
    report: $("#addonReport").checked
  };

  const res = calcTotal(service, level, deadline, pages, complexity, opts);

  $("#totalPrice").textContent = formatPKR(res.total);

  // breakdown text
  const breakdownLines = [
    `Base: ${formatPKR((BASE[service] || 0) * pages)}`,
    `Multipliers: level × deadline × complexity = ${res.mult.toFixed(2)}x`,
    `Add-ons: ${formatPKR(res.add)}`,
    `Pages: ${pages}`
  ];
  $("#breakdown").innerHTML = breakdownLines.map(x => `• ${x}`).join("<br/>");
}
["service","level","deadline","pages","complexity","addonFormatting","addonProof","addonCharts","addonReport","notes"]
  .forEach(id => {
    const el = $("#" + id);
    el?.addEventListener("input", updateCalc);
    el?.addEventListener("change", updateCalc);
  });
updateCalc();

$("#calcWhatsApp")?.addEventListener("click", () => {
  const service = $("#service").value;
  const level = $("#level").value;
  const deadline = $("#deadline").value;
  const pages = Math.max(1, parseInt($("#pages").value || "1", 10));
  const complexity = $("#complexity").value;

  const opts = {
    formatting: $("#addonFormatting").checked,
    proof: $("#addonProof").checked,
    charts: $("#addonCharts").checked,
    report: $("#addonReport").checked
  };

  const notes = ($("#notes").value || "").trim();
  const estimate = $("#totalPrice").textContent;

  const addons = Object.entries(opts).filter(([k,v]) => v).map(([k]) => k).join(", ") || "None";

  const msg =
`Hello Thesis Help Pakistan!
I need a quote.

Service: ${service}
Level: ${level}
Deadline: ${deadline}
Pages: ${pages}
Complexity: ${complexity}
Add-ons: ${addons}
Estimated: ${estimate}

Notes: ${notes || "N/A"}

Please confirm final price & delivery time.`;

  window.open(makeWhatsAppLink(msg), "_blank");
});

// Contact form (client-side only demo)
$("#contactWhatsApp")?.addEventListener("click", () => {
  const name = ($("#cName").value || "").trim();
  const phone = ($("#cPhone").value || "").trim();
  const email = ($("#cEmail").value || "").trim();
  const service = $("#cService").value;
  const message = ($("#cMessage").value || "").trim();

  const msg =
`Hello Thesis Help Pakistan!
Contact request:

Name: ${name || "N/A"}
Phone/WhatsApp: ${phone || "N/A"}
Email: ${email || "N/A"}
Service: ${service}

Message: ${message || "N/A"}`;

  window.open(makeWhatsAppLink(msg), "_blank");
});

$("#contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = ($("#cName").value || "").trim();
  const phone = ($("#cPhone").value || "").trim();
  const message = ($("#cMessage").value || "").trim();

  const msgEl = $("#formMsg");

  if (!name || !phone || !message) {
    msgEl.textContent = "Please fill Name, Phone/WhatsApp, and Message.";
    return;
  }

  // This is a static-site demo:
  // Option A: send via WhatsApp
  // Option B: connect to your backend (PHP/Node) to email/store leads
  msgEl.textContent = "Thanks! For fastest response, click “WhatsApp Instead” or we can integrate email submission with a backend.";

  // Optional: auto-open WhatsApp
  // $("#contactWhatsApp").click();
});
