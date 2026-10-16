/* Le CoQ Boulangerie — carta y pedido por WhatsApp. Sin dependencias. */
(function () {
  "use strict";

  var WHATSAPP = "56971858142";
  var STORE_KEY = "lecoq-pedido-v1";
  var ADVANCE_DAYS = 3;

  var CAMPAGNE = ["Blanco centeno", "Lin (linaza)", "Graines (multisemilla)"];
  var MUFFIN = ["Zanahoria nuez", "Dátiles nuez", "Chocolate chips"];

  // Columnas como en la carta impresa. flag: "advance" = 3 días de anticipación; "weekend" = solo fin de semana.
  var MENU = [
    [
      {
        id: "campo", title: "Panes de campo", img: "campagne", alt: "Hogaza de masa madre",
        items: [
          { id: "campagne", name: "Campagne", detail: "Hogaza de masa madre, 1000 g", price: 4200, options: CAMPAGNE, optionLabel: "Variedad" }
        ]
      },
      {
        id: "pedido", title: "A pedido", img: "baguette", alt: "Baguette", wide: true,
        items: [{ id: "baguette", name: "Baguette", price: 2000 }]
      },
      {
        id: "individuales", title: "Dulces individuales", img: "individuales", alt: "Roulés y muffins",
        items: [
          { id: "petit-babka", name: "Petit babka", price: 2000 },
          { id: "roule-cannelle", name: "Roulé cannelle", price: 2000 },
          { id: "roule-canela", name: "Roulé canela, pasas, nueces", price: 2000 },
          { id: "roule-cardamomo", name: "Roulé cardamomo naranja", price: 2000 },
          { id: "muffin", name: "Muffin", detail: "Zanahoria nuez · dátiles nuez · chocolate chips", price: 2000, options: MUFFIN, optionLabel: "Sabor" }
        ]
      },
      {
        id: "familiares", title: "Dulces familiares", img: "queques", alt: "Queques",
        items: [
          { id: "queque-zanahoria", name: "Queque zanahoria nuez", price: 4000 },
          { id: "queque-datiles", name: "Queque dátiles nuez", price: 4000 },
          { id: "queque-chocolate", name: "Queque chips chocolate", price: 4000 }
        ]
      },
      {
        id: "especiales", title: "Especiales", img: "pascua", alt: "Pan de Pascua", tag: "Temporada",
        items: [
          { id: "pascua-1kg", name: "Pan de Pascua", detail: "1 kg", price: 11500 },
          { id: "pascua-500", name: "Pan de Pascua", detail: "500 g", price: 6000 }
        ]
      }
    ],
    [
      {
        id: "finde", title: "Fines de semana", img: "focaccia", alt: "Focaccia con romero", wide: true,
        flag: "weekend", tag: "Sábado y domingo",
        items: [
          { id: "focaccia-romero", name: "Focaccia sal de mar y romero", price: 5000 },
          { id: "focaccia-especial", name: "Focaccia con queso", detail: "Tomate cherry · cebolla · aceituna", price: 7000 }
        ]
      },
      {
        id: "especiales-pedido", title: "Panes especiales a pedido", img: "molde", alt: "Pan de molde",
        flag: "advance", tag: "3 días de anticipación",
        items: [
          { id: "molde-bimbo", name: "Pan de molde Bimbo", price: 4000 },
          { id: "molde-brioche", name: "Pan de molde brioche", price: 5000 },
          { id: "hamburguesa", name: "Pan hamburguesa brioche", detail: "6 unidades", price: 3500 },
          { id: "babka", name: "Babka", price: 7000 },
          { id: "cramique", name: "Cramique", detail: "Pasas · dátiles · nueces", price: 7000 }
        ]
      },
      {
        id: "tortas", title: "Tortas", img: "torta", alt: "Torta de merengue",
        flag: "advance", tag: "3 días de anticipación",
        items: [
          { id: "torta-caluga", name: "Torta caluga", detail: "10 personas", price: 25000 },
          { id: "torta-manjar", name: "Torta merengue manjar", detail: "15 personas", price: 33000 },
          { id: "torta-lucuma", name: "Torta merengue manjar lúcuma", detail: "15 personas", price: 35000 }
        ]
      },
      {
        id: "otros", title: "Otros productos", img: "huevos", alt: "Bandeja de huevos",
        items: [{ id: "huevos", name: "Huevos", detail: "Bandeja de 30", price: 7500 }]
      }
    ]
  ];

  var PANIERS = [
    {
      id: "panier-petit", name: "Le Panier Petit", price: 10000, img: "panier_petit",
      parts: ["1 Campagne de 1 kg a elección", "3 piezas dulces a elección"]
    },
    {
      id: "panier-weekend", name: "Le Panier Week-end", price: 15000, img: "panier_weekend", flag: "weekend",
      parts: ["1 Campagne de 1 kg a elección", "1 Focaccia sal de mar y romero", "3 piezas dulces a elección"]
    },
    {
      id: "panier-famille", name: "Le Panier La Famille", price: 20000, img: "panier_famille", flag: "weekend",
      parts: ["1 Campagne de 1 kg a elección", "1 Focaccia especial: queso, tomate cherry, cebolla y aceituna", "5 piezas dulces a elección"]
    }
  ];

  // ---------- utilidades ----------
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var fmt = function (n) { return "$ " + n.toLocaleString("es-CL"); };
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  var CATALOG = {};
  MENU.forEach(function (col) {
    col.forEach(function (sec) {
      sec.items.forEach(function (it) { CATALOG[it.id] = Object.assign({ flag: sec.flag }, it); });
    });
  });
  PANIERS.forEach(function (p) {
    CATALOG[p.id] = { id: p.id, name: p.name, price: p.price, flag: p.flag, options: CAMPAGNE, optionLabel: "Campagne" };
  });

  // ---------- estado ----------
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORE_KEY) || "[]").filter(function (l) { return CATALOG[l.id] && l.qty > 0; }); }
  catch (e) { cart = []; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) { /* sin almacenamiento */ } }

  function add(id, option) {
    var line = cart.find(function (l) { return l.id === id && l.option === option; });
    if (line) line.qty += 1; else cart.push({ id: id, option: option || "", qty: 1 });
    save(); renderCart();
    var p = CATALOG[id];
    toast("Añadido: " + p.name + (option ? " (" + option + ")" : ""));
    bump();
  }
  function setQty(i, qty) {
    if (qty <= 0) cart.splice(i, 1); else cart[i].qty = qty;
    save(); renderCart();
  }

  // ---------- carta ----------
  function optionSelect(item, idPrefix) {
    if (!item.options) return null;
    var sel = el("select", { "aria-label": item.optionLabel + " de " + item.name, id: idPrefix + item.id });
    item.options.forEach(function (o) { sel.appendChild(el("option", { value: o, text: o })); });
    return sel;
  }

  function renderMenu() {
    var grid = $("[data-menu]");
    MENU.forEach(function (col) {
      var colEl = el("div", { "class": "menu-col" });
      col.forEach(function (sec) {
        var head = el("div", { "class": "menu-sec-head" }, [
          el("h2", { text: sec.title }),
          sec.tag ? el("span", { "class": "tag" + (sec.flag ? " tag-" + sec.flag : ""), text: sec.tag }) : null
        ]);
        var list = el("ul", { "class": "items" });
        sec.items.forEach(function (it) {
          var sel = optionSelect(it, "opt-");
          var btn = el("button", { type: "button", "class": "add", "aria-label": "Añadir " + it.name + (it.detail ? " " + it.detail : ""), text: "+" });
          btn.addEventListener("click", function () { add(it.id, sel ? sel.value : ""); });
          list.appendChild(el("li", { "class": "item" }, [
            el("div", { "class": "item-main" }, [
              el("div", { "class": "item-line" }, [
                el("span", { "class": "item-name", text: it.name }),
                el("span", { "class": "leader", "aria-hidden": "true" }),
                el("span", { "class": "price", text: fmt(it.price) })
              ]),
              it.detail ? el("p", { "class": "item-detail", text: it.detail }) : null,
              sel ? el("label", { "class": "item-opt", "for": "opt-" + it.id }, [el("span", { text: it.optionLabel + ":" })]) : null
            ]),
            btn
          ]));
          if (sel) list.lastChild.querySelector(".item-opt").appendChild(sel);
        });
        var body = el("div", { "class": "menu-sec-body" + (sec.wide ? " wide" : "") }, [
          el("img", { src: "img/" + sec.img + ".jpg", alt: sec.alt, loading: "lazy", "class": "illus" }),
          list
        ]);
        colEl.appendChild(el("article", { "class": "menu-sec", id: "sec-" + sec.id }, [head, body]));
      });
      grid.appendChild(colEl);
    });
  }

  function renderPaniers() {
    var grid = $("[data-paniers]");
    PANIERS.forEach(function (p) {
      var sel = optionSelect(CATALOG[p.id], "opt-");
      var btn = el("button", { type: "button", "class": "btn btn-primary", text: "Añadir al pedido" });
      btn.addEventListener("click", function () { add(p.id, sel.value); });
      var parts = el("ul", { "class": "panier-parts" });
      p.parts.forEach(function (t, i) {
        if (i) parts.appendChild(el("li", { "class": "plus", "aria-hidden": "true", text: "+" }));
        parts.appendChild(el("li", { text: t }));
      });
      grid.appendChild(el("article", { "class": "panier" }, [
        el("img", { src: "img/" + p.img + ".jpg", alt: p.name, loading: "lazy", "class": "illus" }),
        el("h3", { text: p.name }),
        el("p", { "class": "panier-price", text: fmt(p.price) }),
        parts,
        el("label", { "class": "item-opt", "for": "opt-" + p.id }, [el("span", { text: "Campagne:" }), sel]),
        p.flag === "weekend" ? el("p", { "class": "panier-note", text: "Lleva focaccia: sale sábado y domingo." }) : null,
        btn
      ]));
    });
  }

  // ---------- pedido ----------
  var drawer = $("[data-drawer]"), scrim = $("[data-scrim]"), form = $("[data-form]");
  var lastFocus = null;

  function optText(l) { return l.option ? (CATALOG[l.id].optionLabel === "Campagne" ? "Campagne " : "") + l.option : ""; }
  function needs(flag) { return cart.some(function (l) { return CATALOG[l.id].flag === flag; }); }
  function total() { return cart.reduce(function (s, l) { return s + CATALOG[l.id].price * l.qty; }, 0); }
  function isoDate(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
  function minDate() { var d = new Date(); if (needs("advance")) d.setDate(d.getDate() + ADVANCE_DAYS); return isoDate(d); }

  function renderCart() {
    var count = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (n) { n.textContent = count; n.classList.toggle("on", count > 0); });
    var lines = $("[data-lines]");
    lines.textContent = "";
    cart.forEach(function (l, i) {
      var p = CATALOG[l.id];
      var minus = el("button", { type: "button", "class": "qty-btn", "aria-label": "Quitar uno", text: "−" });
      var plus = el("button", { type: "button", "class": "qty-btn", "aria-label": "Añadir uno", text: "+" });
      minus.addEventListener("click", function () { setQty(i, l.qty - 1); });
      plus.addEventListener("click", function () { setQty(i, l.qty + 1); });
      lines.appendChild(el("li", { "class": "line" }, [
        el("div", { "class": "line-name" }, [
          el("span", { text: p.name + (p.detail ? " · " + p.detail : "") }),
          l.option ? el("small", { text: optText(l) }) : null
        ]),
        el("div", { "class": "qty" }, [minus, el("span", { text: String(l.qty) }), plus]),
        el("span", { "class": "line-total", text: fmt(p.price * l.qty) })
      ]));
    });
    $("[data-empty]").hidden = cart.length > 0;
    form.hidden = cart.length === 0;
    $("[data-total]").textContent = fmt(total());
    $("[data-advance-warn]").hidden = !needs("advance");
    $("[data-weekend-warn]").hidden = !needs("weekend");
    form.fecha.min = minDate();
  }

  function openCart() {
    lastFocus = document.activeElement;
    scrim.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    drawer.focus();
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.body.classList.remove("locked");
    if (lastFocus) lastFocus.focus();
  }

  function buildMessage(data) {
    var out = ["Hola, Le CoQ. Quiero hacer un pedido:", ""];
    cart.forEach(function (l) {
      var p = CATALOG[l.id];
      out.push("• " + l.qty + " × " + p.name + (p.detail ? " (" + p.detail + ")" : "") + (l.option ? " — " + optText(l) : "") + ": " + fmt(p.price * l.qty));
    });
    var d = new Date(data.fecha + "T12:00:00");
    var fecha = d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
    out.push("", "Total: " + fmt(total()), "Nombre: " + data.nombre, "Para el: " + fecha);
    if (data.nota) out.push("Comentarios: " + data.nota);
    return out.join("\n");
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var err = $("[data-form-error]");
    var nombre = form.nombre.value.trim(), fecha = form.fecha.value, nota = form.nota.value.trim();
    var problem = "";
    if (!nombre) problem = "Escribe tu nombre.";
    else if (!fecha) problem = "Elige el día del pedido.";
    else if (fecha < minDate()) problem = needs("advance") ? "Hay productos por encargo: la fecha debe ser al menos en 3 días." : "La fecha ya pasó.";
    else if (needs("weekend") && [0, 6].indexOf(new Date(fecha + "T12:00:00").getDay()) < 0) problem = "Las focaccias salen sábado y domingo: elige un día de fin de semana.";
    err.hidden = !problem; err.textContent = problem;
    if (problem) return;
    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildMessage({ nombre: nombre, fecha: fecha, nota: nota }));
    window.open(url, "_blank", "noopener");
  });

  $("[data-clear]").addEventListener("click", function () { cart = []; save(); renderCart(); });
  document.querySelectorAll("[data-open-cart]").forEach(function (b) { b.addEventListener("click", openCart); });
  $("[data-close-cart]").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

  // ---------- detalles ----------
  var toastEl = $("[data-toast]"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }
  function bump() {
    var b = $(".cart-btn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }
  document.querySelector("[data-year]").textContent = new Date().getFullYear();
  document.querySelectorAll("[data-wa-direct]").forEach(function (a) {
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent("Hola, Le CoQ. Quería consultar por un pedido.");
  });

  renderMenu();
  renderPaniers();
  renderCart();
})();
