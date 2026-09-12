(function () {
  "use strict";

  var qs = function (selector, root) { return (root || document).querySelector(selector); };
  var qsa = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  var esc = function (value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  };

  var iconPaths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4M9 21v-3h2v3"/>',
    pulse: '<path d="M3 12h4l2.2-6 4.1 12 2.2-6H21"/>',
    invoice: '<path d="M6 2h9l4 4v16l-3-2-2 2-2-2-2 2-2-2-2 2V2Z"/><path d="M14 2v5h5M9 11h6M9 15h6"/>',
    alert: '<path d="M10.3 3.2 2.7 17a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 3.2a2 2 0 0 0-3.4 0Z"/><path d="M12 8v4M12 16h.01"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    spark: '<path d="m12 3-1.2 4.1a5.3 5.3 0 0 1-3.7 3.7L3 12l4.1 1.2a5.3 5.3 0 0 1 3.7 3.7L12 21l1.2-4.1a5.3 5.3 0 0 1 3.7-3.7L21 12l-4.1-1.2a5.3 5.3 0 0 1-3.7-3.7L12 3Z"/>',
    export: '<path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 17v3h14v-3"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>',
    euro: '<path d="M18 7.5a7 7 0 1 0 0 9M4 10h10M4 14h9"/>',
    leaf: '<path d="M20 4S8 4 5 11c-2 5 2 9 6 8 7-2 9-15 9-15Z"/><path d="M5 21c2-5 6-9 11-12"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    usercheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/>',
    download: '<path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 20h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    cloud: '<path d="M17.5 19H7a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 12a3.5 3.5 0 0 1-2.5 7Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    save: '<path d="M5 3h12l3 3v15H4V4a1 1 0 0 1 1-1Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    upload: '<path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 14v6h14v-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.5 13 7 22l5-3 5 3-1.5-9"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M15 8l3 3M18 5l3 3"/>',
    backup: '<path d="M20 7v5h-5"/><path d="M18.5 16a8 8 0 1 1 .9-8.8L20 12"/>',
    refresh: '<path d="M20 6v6h-6M4 18v-6h6"/><path d="M18.5 16a7 7 0 0 1-11.9 2L4 12M20 12l-2.6-6a7 7 0 0 0-11.9 2"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };

  function iconSvg(name) {
    var path = iconPaths[name] || iconPaths.info;
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function hydrateIcons(root) {
    qsa("[data-icon]", root || document).forEach(function (element) {
      if (element.dataset.hydrated) return;
      element.innerHTML = iconSvg(element.dataset.icon);
      element.dataset.hydrated = "true";
    });
  }

  var sites = [
    { id: "GEN-042", name: "Centre nautique", area: "Agnettes", category: "sport", icon: "pulse", energy: ["Élec.", "Gaz"], usage: "186,4 MWh", variance: 14.8, status: "Dérive", score: 88, points: "3 PDL · 28 capteurs", carbon: "21,4 tCO₂e", completeness: 98 },
    { id: "GEN-017", name: "Hôtel de Ville", area: "Village", category: "municipal", icon: "building", energy: ["Élec.", "RCU"], usage: "142,7 MWh", variance: 8.3, status: "À surveiller", score: 76, points: "4 PDL · 46 capteurs", carbon: "15,8 tCO₂e", completeness: 99 },
    { id: "GEN-088", name: "École des Grésillons", area: "Grésillons", category: "school", icon: "building", energy: ["Élec.", "Gaz"], usage: "94,2 MWh", variance: 5.9, status: "À surveiller", score: 69, points: "2 PDL · 18 capteurs", carbon: "12,1 tCO₂e", completeness: 95 },
    { id: "GEN-061", name: "Gymnase Jean Guimier", area: "Luth", category: "sport", icon: "pulse", energy: ["Élec.", "Gaz"], usage: "71,8 MWh", variance: -7.4, status: "Dans la cible", score: 38, points: "2 PDL · 21 capteurs", carbon: "8,7 tCO₂e", completeness: 97 },
    { id: "GEN-103", name: "Médiathèque François Rabelais", area: "Centre", category: "municipal", icon: "building", energy: ["Élec.", "RCU"], usage: "58,1 MWh", variance: -3.2, status: "Dans la cible", score: 31, points: "2 PDL · 16 capteurs", carbon: "4,2 tCO₂e", completeness: 100 },
    { id: "GEN-121", name: "Éclairage public — Agnettes", area: "Agnettes", category: "lighting", icon: "bolt", energy: ["Élec."], usage: "47,6 MWh", variance: 11.2, status: "Dérive", score: 81, points: "12 armoires · 74 points", carbon: "2,4 tCO₂e", completeness: 93 },
    { id: "GEN-076", name: "Groupe scolaire Anatole France", area: "Fossé-de-l’Aumône", category: "school", icon: "building", energy: ["Élec.", "Gaz"], usage: "82,3 MWh", variance: -4.7, status: "Dans la cible", score: 33, points: "3 PDL · 24 capteurs", carbon: "9,6 tCO₂e", completeness: 98 },
    { id: "GEN-009", name: "Centre administratif", area: "Village", category: "municipal", icon: "building", energy: ["Élec.", "RCU"], usage: "108,9 MWh", variance: 2.1, status: "Stable", score: 45, points: "3 PDL · 31 capteurs", carbon: "10,9 tCO₂e", completeness: 99 }
  ];

  var invoices = [
    { id: "EN-2608431", provider: "EDF Collectivités", site: "Centre nautique", period: "Août 2026", amount: 28471.20, match: 99, status: "paid" },
    { id: "GR-9430872", provider: "ENGIE", site: "École des Grésillons", period: "Août 2026", amount: 12845.70, match: 82, status: "anomaly" },
    { id: "RC-2209684", provider: "Gennevilliers Énergie", site: "Hôtel de Ville", period: "Août 2026", amount: 19630.40, match: 100, status: "pending" },
    { id: "EA-1703258", provider: "Suez", site: "Gymnase Jean Guimier", period: "Juil. 2026", amount: 3184.93, match: 97, status: "paid" },
    { id: "EN-2608104", provider: "EDF Collectivités", site: "Éclairage public — Agnettes", period: "Août 2026", amount: 15920.31, match: 91, status: "pending" },
    { id: "GR-9429740", provider: "ENGIE", site: "Groupe scolaire Anatole France", period: "Juil. 2026", amount: 9654.18, match: 100, status: "paid" },
    { id: "RC-2209171", provider: "Gennevilliers Énergie", site: "Médiathèque François Rabelais", period: "Août 2026", amount: 8018.80, match: 76, status: "anomaly" }
  ];

  var alerts = [
    { id: 1, level: "critical", title: "Puissance nocturne anormale", site: "Centre nautique", text: "Charge de base +42 % depuis 3 nuits", time: "Il y a 18 min", value: "286 kW", reference: "201 kW", source: "Enedis + GTB", analysis: "La dérive coïncide avec le maintien d’une consigne élevée après fermeture. Une vanne ou une programmation GTB peut être en cause.", acknowledged: false },
    { id: 2, level: "critical", title: "Écart facture / index", site: "École des Grésillons", text: "1 842 € non expliqués sur la période", time: "Il y a 1 h", value: "14 687 €", reference: "12 845 €", source: "Facture + GRDF", analysis: "Le volume facturé dépasse de 14,3 % la consommation reconstituée. Vérifier la période de relève et le coefficient de conversion.", acknowledged: false },
    { id: 3, level: "warning", title: "Consommation d’eau continue", site: "Gymnase Jean Guimier", text: "Débit de 0,31 m³/h hors occupation", time: "Il y a 2 h", value: "0,31 m³/h", reference: "< 0,05", source: "Suez", analysis: "Un débit stable est observé depuis 23 h 40. L’hypothèse d’une fuite lente doit être contrôlée sur site.", acknowledged: false },
    { id: 4, level: "warning", title: "Allumage anticipé", site: "Éclairage public — Agnettes", text: "22 minutes avant l’horaire calculé", time: "Hier, 18:42", value: "22 min", reference: "< 5 min", source: "Armoire EP", analysis: "Le calendrier astronomique et l’horloge locale présentent un décalage. Une resynchronisation est recommandée.", acknowledged: false },
    { id: 5, level: "warning", title: "Capteur intérieur silencieux", site: "Hôtel de Ville", text: "Aucune donnée depuis 7 heures", time: "Hier, 15:08", value: "7 h", reference: "< 1 h", source: "Orange Live Objects", analysis: "Le dernier niveau de batterie était de 18 %. Contrôler la pile et la couverture radio avant remplacement.", acknowledged: false }
  ];

  var state = {
    siteCategory: "all",
    siteSearch: "",
    invoiceStatus: "all",
    invoiceSearch: "",
    alertLevel: "all",
    selectedAlert: 1,
    forecastScenario: "central"
  };

  var labels = {
    overview: "Vue d’ensemble",
    sites: "Patrimoine",
    twin: "Jumeau énergétique",
    invoices: "Factures & comptabilité",
    alerts: "Centre d’alertes",
    forecast: "Prévisions",
    assistant: "Assistant & formation",
    reversibility: "Réversibilité",
    security: "Sécurité & continuité"
  };

  function showView(name) {
    if (!qs("#view-" + name)) return;
    qsa(".view").forEach(function (view) { view.classList.toggle("active", view.id === "view-" + name); });
    qsa(".nav-item").forEach(function (item) { item.classList.toggle("active", item.dataset.view === name); });
    qs("#currentViewLabel").textContent = labels[name] || "Gennevilliers Énergie";
    document.title = (labels[name] || "Pilotage") + " — Gennevilliers Énergie";
    qs("#sidebar").classList.remove("mobile-open");
    qs("#mobileMenu").setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "forecast") renderForecast();
    if (name === "twin") updateTwin();
  }

  qsa("[data-view]").forEach(function (element) {
    element.addEventListener("click", function () { showView(element.dataset.view); });
  });

  qs("#mobileMenu").addEventListener("click", function () {
    var open = qs("#sidebar").classList.toggle("mobile-open");
    this.setAttribute("aria-expanded", String(open));
  });

  qs("#presentationMode").addEventListener("click", function () {
    document.body.classList.toggle("presentation");
    toast(document.body.classList.contains("presentation") ? "Mode présentation activé" : "Mode présentation quitté", "La mise en page a été adaptée à l’écran.");
  });

  function linePath(values, width, height, max, min) {
    var valid = values.map(function (v, i) { return { v: v, i: i }; }).filter(function (p) { return p.v !== null; });
    return valid.map(function (p, index) {
      var x = 42 + p.i * ((width - 62) / (values.length - 1));
      var y = 16 + (max - p.v) * ((height - 47) / (max - min));
      return (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
  }

  function renderEnergyChart() {
    var period = qs("#periodFilter").value;
    var filter = qs("#siteFilter").value;
    var configs = {
      month: { labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "31"], actual: [81, 78, 88, 84, 79, 75, 73, 77, 72, null, null], ref: [91, 89, 94, 91, 88, 86, 84, 88, 86, 85, 83], forecast: [null, null, null, null, null, null, null, null, 72, 74, 71] },
      quarter: { labels: ["Juil. S1", "S2", "S3", "S4", "Août S1", "S2", "S3", "S4", "Sept. S1", "S2", "S3"], actual: [93, 89, 92, 84, 86, 82, 78, 77, 74, null, null], ref: [98, 97, 99, 94, 93, 91, 89, 88, 86, 85, 83], forecast: [null, null, null, null, null, null, null, null, 74, 72, 70] },
      year: { labels: ["Jan.", "Fév.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."], actual: [291, 263, 248, 207, 174, 151, 144, 139, 132, null, null, null], ref: [312, 287, 268, 225, 191, 166, 159, 153, 147, 179, 241, 298], forecast: [null, null, null, null, null, null, null, null, 132, 166, 221, 278] }
    };
    var config = configs[period];
    var factors = { all: 1, municipal: .61, schools: .19, sports: .14, lighting: .06 };
    var factor = factors[filter] || 1;
    var multiply = function (array) { return array.map(function (value) { return value === null ? null : Math.round(value * factor); }); };
    var actual = multiply(config.actual);
    var reference = multiply(config.ref);
    var forecast = multiply(config.forecast);
    var all = actual.concat(reference, forecast).filter(function (v) { return v !== null; });
    var max = Math.ceil(Math.max.apply(null, all) / 50) * 50;
    var min = Math.max(0, Math.floor(Math.min.apply(null, all) / 50) * 50 - (period === "year" ? 0 : 20));
    var w = 760, h = 238;
    var actualPath = linePath(actual, w, h, max, min);
    var refPath = linePath(reference, w, h, max, min);
    var forecastPath = linePath(forecast, w, h, max, min);
    var lastIndex = actual.reduce(function (acc, v, i) { return v !== null ? i : acc; }, 0);
    var lastX = 42 + lastIndex * ((w - 62) / (actual.length - 1));
    var lastY = 16 + (max - actual[lastIndex]) * ((h - 47) / (max - min));
    var areaPath = actualPath + " L" + lastX + " " + (h - 31) + " L42 " + (h - 31) + " Z";
    var grid = [0, 1, 2, 3, 4].map(function (i) {
      var y = 16 + i * ((h - 47) / 4);
      var value = Math.round(max - i * ((max - min) / 4));
      return '<line class="chart-grid" x1="42" y1="' + y + '" x2="' + (w - 20) + '" y2="' + y + '"/><text x="4" y="' + (y + 3) + '">' + value + '</text>';
    }).join("");
    var xLabels = config.labels.map(function (label, i) {
      var x = 42 + i * ((w - 62) / (config.labels.length - 1));
      return '<text text-anchor="middle" x="' + x + '" y="' + (h - 8) + '">' + esc(label) + '</text>';
    }).join("");
    var points = actual.map(function (value, i) {
      if (value === null) return "";
      var x = 42 + i * ((w - 62) / (actual.length - 1));
      var y = 16 + (max - value) * ((h - 47) / (max - min));
      return '<circle class="chart-point" cx="' + x + '" cy="' + y + '" r="3.2"/>';
    }).join("");
    qs("#energyChart").innerHTML =
      '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0cbca8" stop-opacity=".2"/><stop offset="1" stop-color="#0cbca8" stop-opacity="0"/></linearGradient></defs>' +
      grid + xLabels + '<path class="chart-area" d="' + areaPath + '"/><path class="chart-line-reference" d="' + refPath + '"/><path class="chart-line-actual" d="' + actualPath + '"/><path class="chart-line-forecast" d="' + forecastPath + '"/>' + points +
      '<g transform="translate(' + Math.max(45, lastX - 29) + " " + Math.max(5, lastY - 31) + ')"><rect class="chart-tooltip-box" width="58" height="22" rx="6"/><text class="chart-tooltip-text" x="29" y="14" text-anchor="middle">' + actual[lastIndex] + ' MWh</text></g></svg>';
  }

  function updateOverview() {
    var site = qs("#siteFilter").value;
    var period = qs("#periodFilter").value;
    var siteFactors = { all: 1, municipal: .61, schools: .19, sports: .14, lighting: .06 };
    var periodFactors = { month: 1, quarter: 2.86, year: 11.7 };
    var factor = siteFactors[site] * periodFactors[period];
    var energy = 2.48 * factor;
    var cost = 412680 * factor;
    var carbon = 286 * factor;
    var counts = { all: 169, municipal: 118, schools: 31, sports: 18, lighting: 51 };
    var count = counts[site];
    var within = Math.round(count * .83);
    qs('[data-kpi="energy"]').textContent = energy < 1 ? Math.round(energy * 1000) + " MWh" : energy.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " GWh";
    qs('[data-kpi="cost"]').textContent = Math.round(cost).toLocaleString("fr-FR") + " €";
    qs('[data-kpi="carbon"]').textContent = Math.round(carbon).toLocaleString("fr-FR") + " tCO₂e";
    qs('[data-kpi="sites"]').textContent = within + " / " + count;
    renderEnergyChart();
  }

  qs("#siteFilter").addEventListener("change", updateOverview);
  qs("#periodFilter").addEventListener("change", updateOverview);

  function scoreCircle(score) {
    var circumference = 100.5;
    return '<div class="score-mini"><svg viewBox="0 0 38 38"><circle cx="19" cy="19" r="16"/><circle cx="19" cy="19" r="16" stroke-dasharray="' + (score / 100 * circumference) + " " + circumference + '"/></svg><span>' + score + "</span></div>";
  }

  function renderOverviewLists() {
    qs("#priorityList").innerHTML = sites.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 4).map(function (site) {
      return '<div class="priority-item" tabindex="0" role="button" data-site-id="' + site.id + '"><div><strong>' + esc(site.name) + '</strong><small>' + esc(site.area) + " · " + (site.variance > 0 ? "+" : "") + site.variance.toLocaleString("fr-FR") + " % normalisé</small></div>" + scoreCircle(site.score) + "</div>";
    }).join("");
    qs("#overviewAlerts").innerHTML = alerts.slice(0, 3).map(function (alert) {
      return '<div class="compact-alert"><span class="alert-marker ' + alert.level + '"></span><div><strong>' + esc(alert.title) + '</strong><p>' + esc(alert.site) + " · " + esc(alert.text) + '</p></div><time>' + esc(alert.time) + "</time></div>";
    }).join("");
    qsa("[data-site-id]", qs("#priorityList")).forEach(function (item) {
      item.addEventListener("click", function () { openSite(item.dataset.siteId); });
      item.addEventListener("keydown", function (event) { if (event.key === "Enter") openSite(item.dataset.siteId); });
    });
  }

  function statusClass(status) {
    if (status === "Dérive") return "critical";
    if (status === "À surveiller") return "warning";
    if (status === "Dans la cible") return "success";
    return "neutral";
  }

  function renderSites() {
    var search = state.siteSearch.toLocaleLowerCase("fr");
    var filtered = sites.filter(function (site) {
      var categoryMatch = state.siteCategory === "all" || site.category === state.siteCategory;
      var searchMatch = !search || (site.name + " " + site.area + " " + site.id).toLocaleLowerCase("fr").includes(search);
      return categoryMatch && searchMatch;
    });
    qs("#sitesTableBody").innerHTML = filtered.length ? filtered.map(function (site) {
      return '<tr data-row-site="' + site.id + '"><td><div class="site-cell"><span>' + iconSvg(site.icon) + '</span><div><strong>' + esc(site.name) + '</strong><small>' + site.id + " · " + esc(site.area) + '</small></div></div></td>' +
        '<td><div class="energy-tags">' + site.energy.map(function (e) { return "<span>" + esc(e) + "</span>"; }).join("") + "</div></td>" +
        "<td><strong>" + site.usage + '</strong></td><td><span class="variance ' + (site.variance > 0 ? "up" : "down") + '">' + (site.variance > 0 ? "↗ +" : "↘ ") + site.variance.toLocaleString("fr-FR") + " %</span></td>" +
        '<td><span class="status-pill ' + statusClass(site.status) + '"><i></i>' + esc(site.status) + '</span></td><td><button class="row-open" data-open-site="' + site.id + '" aria-label="Ouvrir ' + esc(site.name) + '">' + iconSvg("chevron") + "</button></td></tr>";
    }).join("") : '<tr><td colspan="6" class="empty-state">Aucun site ne correspond à ces critères.</td></tr>';
    qsa("[data-open-site]").forEach(function (button) {
      button.addEventListener("click", function (event) { event.stopPropagation(); openSite(button.dataset.openSite); });
    });
    qsa("[data-row-site]").forEach(function (row) { row.addEventListener("click", function () { openSite(row.dataset.rowSite); }); });
  }

  qsa("[data-site-category]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.siteCategory = button.dataset.siteCategory;
      qsa("[data-site-category]").forEach(function (b) { b.classList.toggle("active", b === button); });
      renderSites();
    });
  });
  qs("#siteSearch").addEventListener("input", function () { state.siteSearch = this.value; renderSites(); });

  function miniSparkline(values, color) {
    var w = 380, h = 120, max = Math.max.apply(null, values), min = Math.min.apply(null, values) - 5;
    var path = values.map(function (value, index) {
      var x = index * (w / (values.length - 1));
      var y = 10 + (max - value) * ((h - 20) / (max - min));
      return (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    return '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none"><line x1="0" y1="30" x2="' + w + '" y2="30" stroke="#dfe8ec" stroke-dasharray="4 4"/><line x1="0" y1="70" x2="' + w + '" y2="70" stroke="#e8eef1"/><path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function openSite(id) {
    var site = sites.find(function (item) { return item.id === id; });
    if (!site) return;
    var values = [58, 63, 60, 68, 72, 70, 79, 75, 83, 88, 84, 92];
    qs("#siteDrawer").innerHTML =
      '<button class="icon-button drawer-close" id="drawerClose" aria-label="Fermer">' + iconSvg("close") + '</button><div>' +
      '<span class="drawer-kicker">' + esc(site.id) + " · " + esc(site.area) + '</span><h2>' + esc(site.name) + '</h2><p>' + esc(site.points) + " · Données de démonstration</p>" +
      '<div class="drawer-summary"><div><span>Ce mois</span><strong>' + site.usage + '</strong></div><div><span>Écart normalisé</span><strong class="' + (site.variance > 0 ? "text-warning" : "") + '">' + (site.variance > 0 ? "+" : "") + site.variance.toLocaleString("fr-FR") + ' %</strong></div><div><span>Carbone</span><strong>' + site.carbon + '</strong></div></div>' +
      '<div class="drawer-section"><h3>Profil sur 12 semaines</h3><div class="drawer-chart">' + miniSparkline(values, site.variance > 5 ? "#ed6a5e" : "#0cbca8") + '</div></div>' +
      '<div class="drawer-section"><h3>Signaux clés</h3><div class="drawer-signal"><span class="evidence-dot ' + (site.score > 75 ? "critical" : "warning") + '"></span><p><strong>Score de dérive : ' + site.score + '/100</strong><small>Calculé après correction météo et occupation</small></p></div><div class="drawer-signal"><span class="evidence-dot positive"></span><p><strong>Complétude des données : ' + site.completeness + ' %</strong><small>Qualité suffisante pour les analyses</small></p></div><div class="drawer-signal"><span class="evidence-dot warning"></span><p><strong>Une action à confirmer</strong><small>Analyse humaine requise avant mise en œuvre</small></p></div></div>' +
      '<div class="drawer-actions"><button class="primary-button" data-drawer-twin>Ouvrir le jumeau</button><button class="secondary-button" data-drawer-export>Exporter les données</button></div></div>';
    qs("#siteDrawer").classList.add("open");
    qs("#drawerBackdrop").classList.add("open");
    qs("#siteDrawer").setAttribute("aria-hidden", "false");
    qs("#drawerClose").focus();
    qs("#drawerClose").addEventListener("click", closeDrawer);
    qs("[data-drawer-twin]").addEventListener("click", function () { closeDrawer(); showView("twin"); });
    qs("[data-drawer-export]").addEventListener("click", function () { downloadFile(site.id + "_consommations.csv", "date;energie_mwh\\n2026-07;144.2\\n2026-08;151.8\\n2026-09;139.7", "text/csv"); });
  }

  function closeDrawer() {
    qs("#siteDrawer").classList.remove("open");
    qs("#drawerBackdrop").classList.remove("open");
    qs("#siteDrawer").setAttribute("aria-hidden", "true");
  }
  qs("#drawerBackdrop").addEventListener("click", closeDrawer);

  function updateTwin() {
    var temp = parseFloat(qs("#tempSlider").value);
    var occupancy = parseInt(qs("#occupancySlider").value, 10);
    var schedule = parseInt(qs("#scheduleSlider").value, 10);
    var energy = Math.round(900 + (temp - 18) * 95 + occupancy * 1.05 + schedule * 25);
    var baseline = 1957;
    var delta = (energy / baseline - 1) * 100;
    var instant = Math.round(72 + (temp - 18) * 20 + occupancy * .35 + schedule * 5);
    var drift = Math.max(10, Math.min(98, Math.round(54 + (temp - 20) * 6 + (schedule - 10) * 2 - (occupancy - 184) * .02)));
    qs("#tempOutput").textContent = temp.toLocaleString("fr-FR") + " °C";
    qs("#occupancyOutput").textContent = occupancy + " pers.";
    qs("#scheduleOutput").textContent = schedule + " h/j";
    qs("#instantConsumption").textContent = instant + " kW";
    qs("#thermalGap").textContent = (temp - 8.4).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " °C";
    qs("#driftIndex").textContent = drift + " / 100";
    qs("#simulatedEnergy").textContent = energy.toLocaleString("fr-FR") + " MWh";
    qs("#simulatedDelta").innerHTML = "<b>" + (delta > 0 ? "+" : "−") + Math.abs(delta).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %</b> par rapport au scénario actuel";
  }
  ["#tempSlider", "#occupancySlider", "#scheduleSlider"].forEach(function (selector) { qs(selector).addEventListener("input", updateTwin); });
  qs("#twinSite").addEventListener("change", function () { toast("Site chargé", this.value + " est maintenant affiché dans le simulateur."); });
  qs("#saveScenario").addEventListener("click", function () { toast("Scénario enregistré", "La simulation est prête à être comparée, sans action automatique."); });

  function money(value) { return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }); }

  function renderInvoices() {
    var search = state.invoiceSearch.toLocaleLowerCase("fr");
    var filtered = invoices.filter(function (invoice) {
      var statusMatch = state.invoiceStatus === "all" || invoice.status === state.invoiceStatus;
      var searchMatch = !search || (invoice.id + " " + invoice.provider + " " + invoice.site).toLocaleLowerCase("fr").includes(search);
      return statusMatch && searchMatch;
    });
    var statusLabel = { paid: ["Payée", "success"], pending: ["À payer", "warning"], anomaly: ["À contrôler", "critical"] };
    qs("#invoiceTableBody").innerHTML = filtered.length ? filtered.map(function (invoice) {
      var label = statusLabel[invoice.status];
      var match = invoice.status === "anomaly" ? '<span class="match-cell anomaly">' + iconSvg("alert") + " Écart " + (100 - invoice.match) + " %</span>" : '<span class="match-cell"><span class="match-bar"><i style="width:' + invoice.match + '%"></i></span>' + invoice.match + " %</span>";
      return "<tr><td><span class=\"invoice-id\">" + invoice.id + '</span></td><td><div class="invoice-provider"><strong>' + esc(invoice.provider) + '</strong><small>' + esc(invoice.site) + "</small></div></td><td>" + esc(invoice.period) + "</td><td><strong>" + money(invoice.amount) + "</strong></td><td>" + match + '</td><td><span class="status-pill ' + label[1] + '"><i></i>' + label[0] + '</span></td><td><button class="row-open" data-invoice="' + invoice.id + '" aria-label="Voir la facture">' + iconSvg("chevron") + "</button></td></tr>";
    }).join("") : '<tr><td colspan="7" class="empty-state">Aucune facture ne correspond à ces critères.</td></tr>';
    qsa("[data-invoice]").forEach(function (button) {
      button.addEventListener("click", function () {
        var invoice = invoices.find(function (item) { return item.id === button.dataset.invoice; });
        openModal("Contrôle de la facture " + invoice.id, '<p>' + esc(invoice.provider) + " · " + esc(invoice.site) + '</p><div class="modal-highlight"><span>Montant TTC</span><strong>' + money(invoice.amount) + '</strong></div><ul class="modal-checklist"><li>' + iconSvg("check") + "<span>Période et point de livraison identifiés</span></li><li>" + iconSvg("check") + "<span>Index rapprochés avec les données du distributeur</span></li><li>" + iconSvg(invoice.status === "anomaly" ? "alert" : "check") + "<span>" + (invoice.status === "anomaly" ? "Écart à justifier avant paiement" : "Montant cohérent avec les consommations") + '</span></li></ul><div class="modal-actions"><button class="secondary-button" data-modal-dismiss>Fermer</button><button class="primary-button" data-invoice-validate>Valider le contrôle</button></div>');
        qs("[data-invoice-validate]").addEventListener("click", function () { closeModal(); toast("Contrôle enregistré", "La piste d’audit de la facture a été mise à jour."); });
      });
    });
  }

  qsa("[data-invoice-status]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.invoiceStatus = button.dataset.invoiceStatus;
      qsa("[data-invoice-status]").forEach(function (b) { b.classList.toggle("active", b === button); });
      renderInvoices();
    });
  });
  qs("#invoiceSearch").addEventListener("input", function () { state.invoiceSearch = this.value; renderInvoices(); });
  qs("#importInvoice").addEventListener("click", function () {
    openModal("Importer une facture", '<p>Déposez un PDF ou un fichier de données. Le prototype simulera la lecture et le rapprochement.</p><button class="upload-zone" data-upload-zone>' + iconSvg("upload") + '<strong>Sélectionner un fichier</strong><span>PDF, CSV ou XML · 20 Mo maximum</span></button><div class="modal-actions"><button class="secondary-button" data-modal-dismiss>Annuler</button><button class="primary-button" data-simulate-import>Simuler l’import</button></div>');
    qs("[data-upload-zone]").addEventListener("click", function () { toast("Fichier de démonstration sélectionné", "facture_energie_aout_2026.pdf"); });
    qs("[data-simulate-import]").addEventListener("click", function () { closeModal(); toast("Facture analysée", "4 champs reconnus, rapprochement à 97,8 %."); });
  });

  function renderAlerts() {
    var filtered = alerts.filter(function (alert) { return state.alertLevel === "all" || alert.level === state.alertLevel; });
    qs("#allAlerts").innerHTML = filtered.map(function (alert) {
      return '<div class="alert-row ' + (state.selectedAlert === alert.id ? "selected" : "") + '" data-alert-id="' + alert.id + '"><span class="alert-marker ' + alert.level + '"></span><div><strong>' + esc(alert.title) + (alert.acknowledged ? ' <span class="status-pill success">Acquittée</span>' : "") + '</strong><p>' + esc(alert.site) + " · " + esc(alert.text) + '</p><small>' + esc(alert.source) + '</small></div><time>' + esc(alert.time) + "</time></div>";
    }).join("");
    qsa("[data-alert-id]").forEach(function (row) {
      row.addEventListener("click", function () { state.selectedAlert = Number(row.dataset.alertId); renderAlerts(); });
    });
    renderAlertDetail();
  }

  function renderAlertDetail() {
    var alert = alerts.find(function (item) { return item.id === state.selectedAlert; }) || alerts[0];
    qs("#alertDetail").innerHTML =
      '<div class="alert-detail-header"><div><span class="status-pill ' + (alert.level === "critical" ? "critical" : "warning") + '">' + (alert.level === "critical" ? "Critique" : "À surveiller") + '</span><h3>' + esc(alert.title) + '</h3><p>' + esc(alert.site) + " · " + esc(alert.time) + '</p></div><button class="icon-button" aria-label="Plus d’options">' + iconSvg("more") + "</button></div>" +
      '<div class="alert-detail-chart">' + miniSparkline([42, 44, 43, 45, 47, 48, 61, 68, 72, 76, 81, 84], alert.level === "critical" ? "#ed6a5e" : "#e99a2d") + '</div>' +
      '<div class="alert-facts"><div><span>Valeur</span><strong>' + esc(alert.value) + '</strong></div><div><span>Référence</span><strong>' + esc(alert.reference) + '</strong></div><div><span>Source</span><strong>' + esc(alert.source) + '</strong></div></div>' +
      '<div class="alert-analysis"><h4>Analyse proposée</h4><p>' + esc(alert.analysis) + '</p></div><div class="method-note"><span>' + iconSvg("usercheck") + '</span><p>Cette analyse aide à décider. Elle doit être confirmée par un agent avant intervention.</p></div>' +
      '<div class="alert-actions"><button class="primary-button" data-ack-alert ' + (alert.acknowledged ? "disabled" : "") + ">" + (alert.acknowledged ? "Alerte acquittée" : "Acquitter") + '</button><button class="secondary-button" data-assign-alert>Assigner</button><button class="ghost-button" data-create-action>Créer une action</button></div>';
    var ack = qs("[data-ack-alert]");
    if (!alert.acknowledged) ack.addEventListener("click", function () { alert.acknowledged = true; renderAlerts(); toast("Alerte acquittée", "L’événement reste disponible dans la piste d’audit."); });
    qs("[data-assign-alert]").addEventListener("click", function () { toast("Alerte assignée", "Responsable énergie · échéance demain 12 h."); });
    qs("[data-create-action]").addEventListener("click", function () { toast("Action créée", "Contrôle sur site ajouté au plan de la semaine."); });
  }

  qsa("[data-alert-level]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.alertLevel = button.dataset.alertLevel;
      qsa("[data-alert-level]").forEach(function (b) { b.classList.toggle("active", b === button); });
      renderAlerts();
    });
  });
  qs("#alertRules").addEventListener("click", function () {
    openModal("Règles d’alerte", '<p>Chaque règle combine un seuil, une durée, une plage d’occupation et une source de comparaison.</p><ul class="modal-checklist"><li>' + iconSvg("check") + "<span>Charge nocturne : +20 % pendant 2 heures</span></li><li>" + iconSvg("check") + "<span>Fuite probable : débit continu pendant 90 minutes</span></li><li>" + iconSvg("check") + '<span>Facture : écart supérieur à 5 % après rapprochement</span></li></ul><div class="modal-actions"><button class="primary-button" data-modal-dismiss>Compris</button></div>');
  });

  var forecastScenarios = {
    low: { annual: 4.31, diff: -8.4, values: [405, 371, 342, 317, 281, 268, 265, 274, 299, 348, 383, 421] },
    central: { annual: 4.86, diff: 3.2, values: [452, 421, 387, 348, 313, 297, 294, 306, 337, 394, 438, 482] },
    stress: { annual: 5.42, diff: 15.0, values: [501, 472, 431, 389, 354, 332, 329, 343, 377, 439, 491, 548] }
  };

  function renderForecast() {
    var scenario = forecastScenarios[state.forecastScenario];
    var horizon = Number(qs("#forecastScenario").value);
    var horizonTotal = scenario.annual * (horizon / 12) * (horizon === 48 ? 1.045 : horizon === 24 ? 1.02 : 1);
    qs("#forecastAmount").textContent = horizonTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " M€";
    qs("#forecastDifference").textContent = (scenario.diff > 0 ? "+" : "−") + Math.abs(scenario.diff).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " % vs budget";
    qs("#forecastDifference").style.color = scenario.diff > 0 ? "#b86617" : "#168061";
    var values = scenario.values;
    var labels = ["Oct.", "Nov.", "Déc.", "Jan.", "Fév.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept."];
    var w = 760, h = 285, max = 600, min = 200;
    var path = linePath(values, w, h, max, min);
    var upper = values.map(function (v) { return v * 1.078; });
    var lower = values.map(function (v) { return v * .922; });
    var forecastPoint = function (value, index) {
      var x = 42 + index * ((w - 62) / (values.length - 1));
      var y = 16 + (max - value) * ((h - 47) / (max - min));
      return x.toFixed(1) + " " + y.toFixed(1);
    };
    var upperPoints = upper.map(forecastPoint);
    var lowerPoints = lower.map(forecastPoint).reverse();
    var uncertainty = "M" + upperPoints.join(" L") + " L" + lowerPoints.join(" L") + " Z";
    var grid = [0, 1, 2, 3, 4].map(function (i) {
      var y = 16 + i * ((h - 47) / 4), val = max - i * 100;
      return '<line class="chart-grid" x1="42" y1="' + y + '" x2="' + (w - 20) + '" y2="' + y + '"/><text x="5" y="' + (y + 3) + '">' + val + "</text>";
    }).join("");
    var xLabels = labels.map(function (label, i) {
      var x = 42 + i * ((w - 62) / (labels.length - 1));
      return '<text text-anchor="middle" x="' + x + '" y="' + (h - 8) + '">' + label + "</text>";
    }).join("");
    var budgetY = 16 + (max - 390) * ((h - 47) / (max - min));
    qs("#forecastChart").innerHTML = '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none"><defs><linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c96ff" stop-opacity=".22"/><stop offset="1" stop-color="#2c96ff" stop-opacity="0"/></linearGradient></defs>' + grid + xLabels + '<path class="uncertainty-area" d="' + uncertainty + '"/><line class="budget-line" x1="42" y1="' + budgetY + '" x2="' + (w - 20) + '" y2="' + budgetY + '"/><text x="' + (w - 70) + '" y="' + (budgetY - 6) + '">Budget</text><path class="forecast-line" d="' + path + '"/></svg>';
  }

  qsa("[data-scenario]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.forecastScenario = button.dataset.scenario;
      qsa("[data-scenario]").forEach(function (b) { b.classList.toggle("active", b === button); });
      renderForecast();
    });
  });
  qs("#forecastScenario").addEventListener("change", renderForecast);
  qs("#forecastMethod").addEventListener("click", function () {
    openModal("Méthode de prévision", '<p>La projection combine cinq familles de variables, avec une fourchette d’incertitude visible.</p><ul class="modal-checklist"><li>' + iconSvg("check") + "<span>Historique corrigé des anomalies et données manquantes</span></li><li>" + iconSvg("check") + "<span>Météo normalisée par degrés-jours unifiés (DJU)</span></li><li>" + iconSvg("check") + "<span>Fréquentation et amplitudes d’ouverture</span></li><li>" + iconSvg("check") + "<span>Hypothèses de prix saisies et versionnées</span></li><li>" + iconSvg("check") + '<span>Actions validées, puis économies mesurées</span></li></ul><div class="method-note">' + iconSvg("info") + "<p>Le résultat est une aide à la décision et non une garantie contractuelle d’économie.</p></div><div class=\"modal-actions\"><button class=\"primary-button\" data-modal-dismiss>Fermer</button></div>");
  });

  var assistantAnswers = {
    derive: "Le Centre nautique présente trois signaux concordants : une charge nocturne supérieure de 42 %, une température maintenue 2,1 °C au-dessus de la consigne et aucune fréquentation entre 23 h et 5 h. L’hypothèse principale est une programmation GTB inadaptée. Je recommande une vérification humaine avant tout réglage.",
    priority: "Trois priorités ressortent : 1) contrôler la programmation nocturne du Centre nautique, 2) rapprocher la facture gaz de l’École des Grésillons, 3) vérifier le débit d’eau continu au Gymnase Jean Guimier. Potentiel cumulé estimé : 4 900 € par an, à confirmer.",
    summary: "Synthèse direction : la consommation consolidée est inférieure de 8,4 % à la référence, malgré un coût en hausse de 3,1 %. 83 % des sites restent dans leur cible. Trois alertes critiques demandent une validation métier. La trajectoire carbone atteint −34 % pour un objectif 2030 de −40 %."
  };

  function answerQuestion(question) {
    var lower = question.toLocaleLowerCase("fr");
    if (lower.includes("centre nautique") || lower.includes("dérive")) return assistantAnswers.derive;
    if (lower.includes("prior") || lower.includes("semaine")) return assistantAnswers.priority;
    if (lower.includes("synth") || lower.includes("direction")) return assistantAnswers.summary;
    if (lower.includes("facture") || lower.includes("pay")) return "Huit écarts de facturation sont actuellement signalés, pour 12 640 € à contrôler. Le cas le plus important concerne l’École des Grésillons : +14,3 % entre le volume facturé et la consommation reconstituée.";
    if (lower.includes("carbone") || lower.includes("co2")) return "Les émissions de démonstration atteignent 286 tCO₂e sur la période, soit −11,2 % par rapport à la référence. La trajectoire 2030 simulée est à −34 %, encore 6 points sous l’objectif paramétré.";
    return "Je peux analyser cette question à partir des consommations, factures, températures, DJU et fréquentations disponibles. Dans ce prototype, essayez une demande sur une dérive, une priorité, une facture ou la trajectoire carbone.";
  }

  function appendChat(role, text) {
    var wrapper = document.createElement("div");
    wrapper.className = "message " + (role === "user" ? "user-message" : "assistant-message");
    wrapper.innerHTML = role === "user" ? '<div><p>' + esc(text) + '</p><span>à l’instant</span></div>' : '<div class="assistant-avatar small"><span data-icon="spark"></span></div><div><p>' + esc(text) + '</p><span>à l’instant</span></div>';
    qs("#chatMessages").appendChild(wrapper);
    hydrateIcons(wrapper);
    qs("#chatMessages").scrollTop = qs("#chatMessages").scrollHeight;
  }

  function askAssistant(question) {
    if (!question.trim()) return;
    appendChat("user", question);
    var typing = document.createElement("div");
    typing.className = "message assistant-message typing";
    typing.innerHTML = '<div class="assistant-avatar small">' + iconSvg("spark") + '</div><div><p><i></i><i></i><i></i></p></div>';
    qs("#chatMessages").appendChild(typing);
    qs("#chatMessages").scrollTop = qs("#chatMessages").scrollHeight;
    window.setTimeout(function () {
      typing.remove();
      appendChat("assistant", answerQuestion(question));
    }, 650);
  }
  qsa("[data-prompt]").forEach(function (button) { button.addEventListener("click", function () { askAssistant(button.dataset.prompt); }); });
  qs("#chatForm").addEventListener("submit", function (event) {
    event.preventDefault();
    var input = qs("#chatInput"), question = input.value;
    input.value = "";
    askAssistant(question);
  });
  qs("#assistantInfo").addEventListener("click", function () {
    openModal("Cadre de l’assistant", '<p>L’assistant est conçu pour expliquer et préparer des décisions, pas pour agir seul sur les équipements.</p><ul class="modal-checklist"><li>' + iconSvg("check") + "<span>Sources citées dans chaque analyse détaillée</span></li><li>" + iconSvg("check") + "<span>Validation humaine obligatoire avant action</span></li><li>" + iconSvg("check") + "<span>Données hébergées et traitées dans l’environnement proposé</span></li><li>" + iconSvg("check") + '<span>Aucune réutilisation pour entraîner un modèle public</span></li></ul><div class="modal-actions"><button class="primary-button" data-modal-dismiss>Fermer</button></div>');
  });
  qs("#startModule").addEventListener("click", function () {
    openModal("Normaliser par DJU & fréquentation", '<p>Mini-parcours interactif · 12 minutes restantes</p><div class="modal-highlight"><span>Cas pratique</span><strong>Comparer deux écoles</strong></div><p>Vous allez corriger leurs consommations selon la rigueur climatique, le nombre d’élèves présents et l’amplitude d’ouverture.</p><div class="method-note">' + iconSvg("award") + '<p>La réussite participe à l’attestation interne de compétences, qui n’est pas une certification officielle.</p></div><div class="modal-actions"><button class="secondary-button" data-modal-dismiss>Plus tard</button><button class="primary-button" data-start-lesson>Commencer</button></div>');
    qs("[data-start-lesson]").addEventListener("click", function () { closeModal(); toast("Module lancé", "Le cas pratique a été ouvert en mode démonstration."); });
  });

  function downloadFile(filename, content, type) {
    var blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    toast("Téléchargement prêt", filename);
  }

  qs("#exportSites").addEventListener("click", function () {
    var csv = "site_id;nom;quartier;energie;consommation;ecart_normalise;etat\\n" + sites.map(function (site) { return [site.id, site.name, site.area, site.energy.join("+"), site.usage, site.variance, site.status].join(";"); }).join("\\n");
    downloadFile("patrimoine_energetique_gennevilliers.csv", csv, "text/csv;charset=utf-8");
  });
  qs("#downloadCsv").addEventListener("click", function () {
    downloadFile("exemple_consommations_gennevilliers.csv", "site_id;point_id;horodatage;valeur;unite\\nGEN-042;PDL-253;2026-09-12T10:30:00+02:00;286.4;kWh\\nGEN-017;PCE-040;2026-09-12T10:30:00+02:00;81.2;kWh\\nGEN-088;EAU-118;2026-09-12T10:30:00+02:00;2.34;m3", "text/csv;charset=utf-8");
  });
  qs("#runExport").addEventListener("click", function () {
    openModal("Préparer un export complet", '<p>L’archive de réversibilité comprend les données brutes et consolidées, les pièces, les paramétrages et la documentation.</p><ul class="modal-checklist"><li>' + iconSvg("check") + "<span>Historique des mesures et indicateurs</span></li><li>" + iconSvg("check") + "<span>Factures et rapprochements comptables</span></li><li>" + iconSvg("check") + "<span>Référentiels, règles et dictionnaire de données</span></li><li>" + iconSvg("check") + '<span>Journal des actions et alertes</span></li></ul><div class="modal-actions"><button class="secondary-button" data-modal-dismiss>Annuler</button><button class="primary-button" data-confirm-export>Générer l’archive</button></div>');
    qs("[data-confirm-export]").addEventListener("click", function () { closeModal(); toast("Export lancé", "L’archive chiffrée sera déposée sur le SFTP de démonstration."); });
  });
  qs("#copyEndpoint").addEventListener("click", function () {
    var endpoint = "/api/v1/sites/{site_id}/consumptions";
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(endpoint);
    toast("Adresse copiée", endpoint);
  });
  qs("#downloadSecurity").addEventListener("click", function () {
    downloadFile("rapport_controles_securite_demo.txt", "GENNEVILLIERS ÉNERGIE — RAPPORT DE DÉMONSTRATION\\n\\nDisponibilité cible : 99,5 %\\nRTO proposé : moins de 4 heures\\nSauvegarde : 3-2-1-1-0\\nDernier test de restauration : réussi en 2 h 37\\n\\nDonnées de démonstration.", "text/plain;charset=utf-8");
  });

  qs("#reviewRecommendation").addEventListener("click", function () {
    openModal("Examiner la recommandation", '<p>Centre nautique · Ajustement de la consigne nocturne</p><div class="modal-highlight"><span>Gain estimé, à confirmer</span><strong>2 180 € / an</strong></div><ul class="modal-checklist"><li>' + iconSvg("check") + "<span>Vérifier la programmation GTB actuelle</span></li><li>" + iconSvg("check") + "<span>Valider la plage 23 h – 5 h avec l’exploitant</span></li><li>" + iconSvg("check") + "<span>Tester pendant 14 jours avec retour possible</span></li><li>" + iconSvg("check") + '<span>Mesurer le résultat sur une référence normalisée</span></li></ul><div class="method-note">' + iconSvg("usercheck") + '<p>La plateforme ne modifie aucune consigne avant votre validation explicite.</p></div><div class="modal-actions"><button class="secondary-button" data-modal-dismiss>Fermer</button><button class="primary-button" data-validate-rec>Valider pour expérimentation</button></div>');
    qs("[data-validate-rec]").addEventListener("click", function () { closeModal(); toast("Expérimentation validée", "Une tâche a été créée pour l’exploitant, avec suivi sur 14 jours."); });
  });
  qs("#dismissRecommendation").addEventListener("click", function () { toast("Rappel programmé", "La recommandation sera reproposée lundi prochain."); });

  function openModal(title, html) {
    qs("#modalContent").innerHTML = '<h2 id="modalTitle">' + esc(title) + "</h2>" + html;
    qs("#modalBackdrop").classList.add("open");
    qs("#modalBackdrop").setAttribute("aria-hidden", "false");
    qs("#modalBackdrop .modal").setAttribute("role", "dialog");
    qs("#modalBackdrop .modal").setAttribute("aria-modal", "true");
    qs("#modalBackdrop .modal").setAttribute("aria-labelledby", "modalTitle");
    hydrateIcons(qs("#modalContent"));
    qsa("[data-modal-dismiss]", qs("#modalContent")).forEach(function (button) { button.addEventListener("click", closeModal); });
    qs("#modalClose").focus();
  }

  function closeModal() {
    qs("#modalBackdrop").classList.remove("open");
    qs("#modalBackdrop").setAttribute("aria-hidden", "true");
  }
  qs("#modalClose").addEventListener("click", closeModal);
  qs("#modalBackdrop").addEventListener("click", function (event) { if (event.target === this) closeModal(); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { closeModal(); closeDrawer(); qs("#sidebar").classList.remove("mobile-open"); }
  });

  function toast(title, message) {
    var item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = iconSvg("check") + '<p><strong>' + esc(title) + '</strong><small>' + esc(message || "") + '</small></p><button aria-label="Fermer">' + iconSvg("close") + "</button>";
    qs("#toastRegion").appendChild(item);
    var close = function () { if (item.parentNode) item.remove(); };
    qs("button", item).addEventListener("click", close);
    window.setTimeout(close, 4800);
  }

  function detectFlaskBackend() {
    fetch("/api/health", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok || !(response.headers.get("content-type") || "").includes("application/json")) {
          throw new Error("Static demonstration");
        }
        return response.json();
      })
      .then(function (payload) {
        if (payload && payload.data && payload.data.status === "ok") {
          qs("#apiStatusText").textContent = "API Flask opérationnelle";
          qs("#apiStatusDetail").textContent = "mode démonstration";
        }
      })
      .catch(function () {
        /* Le déploiement statique conserve son indicateur de synchronisation. */
      });
  }

  hydrateIcons();
  renderOverviewLists();
  updateOverview();
  renderSites();
  renderInvoices();
  renderAlerts();
  renderForecast();
  updateTwin();
  detectFlaskBackend();
})();
