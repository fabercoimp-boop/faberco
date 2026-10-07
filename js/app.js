(function () {
  "use strict";

  var D = window.FABERCO;
  var app = document.getElementById("app");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE_TITLE = document.title;
  var view = null;          // "home" | "product" | "page"
  var homeScroll = 0;       // para volver al mismo lugar desde un producto
  var filtro = "todos";
  var observer = null;

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- utilidades ---------- */
  function wa(msg) {
    return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(slug) { return D.productos.filter(function (x) { return x.slug === slug; })[0]; }
  function catNombre(id) {
    var c = D.categorias.filter(function (x) { return x.id === id; })[0];
    return c ? c.nombre : "";
  }
  function v(path) { return path + "?v=" + D.version; }
  function foto(p, n) { return v("img/" + p.slug + "/" + n + ".webp"); }
  function icon(id, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }
  function money(n) { return "$ " + new Intl.NumberFormat("es-AR").format(n); }

  function precioHTML(p) {
    if (p.precio == null) return "";
    var html = '<span class="price">' + money(p.precio) + "</span>";
    if (p.precioAnterior && p.precioAnterior > p.precio) {
      var off = Math.round((1 - p.precio / p.precioAnterior) * 100);
      html = '<span class="price-old">' + money(p.precioAnterior) + "</span>" + html +
             '<span class="price-off">-' + off + "%</span>";
    }
    return html;
  }
  function transf(p) {
    return p.precioTransferencia != null ? p.precioTransferencia : Math.round(p.precio * (1 - D.transferencia.descuento / 100));
  }
  function pct(p) { return Math.round((1 - transf(p) / p.precio) * 100); }
  function stockHTML(p) {
    var map = {
      hay: ["Disponible", "ok"],
      poco: ["Últimas unidades", "low"],
      proximamente: ["Próximamente", "soon"]
    };
    var s = map[p.stock] || map.hay;
    return '<span class="badge badge-' + s[1] + '">' + s[0] + "</span>";
  }
  function placeholder() {
    return '<div class="ph">' + icon("i-image") + "<span>Foto próximamente</span></div>";
  }
  function money0() { return money(D.envioGratisDesde); }

  /* ---------- reseñas ---------- */
  function stars(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += i <= n ? "★" : "☆";
    return '<span class="stars" role="img" aria-label="' + n + ' de 5 estrellas">' + s + "</span>";
  }
  function reviewsOf(slug) {
    return D.resenas.filter(function (r) { return slug ? r.producto === slug : true; });
  }
  function reviewCard(r) {
    var p = r.producto ? byId(r.producto) : null;
    return '<li class="review">' + stars(r.estrellas) +
      '<p class="review-text">“' + esc(r.texto) + "”</p>" +
      '<p class="review-by"><strong>' + esc(r.nombre) + "</strong>" +
      (p ? " · " + esc(p.nombre) : "") + (r.fecha ? " · " + esc(r.fecha) : "") + "</p></li>";
  }
  function reviewHref(p) {
    if (D.formResenas) return D.formResenas;
    return wa("Hola, quiero dejar mi reseña" + (p ? " de: " + p.nombre : " de Faberco") + ".");
  }
  function reviewBtn(p, cls) {
    return '<a class="btn ' + (cls || "btn-ghost") + '" href="' + reviewHref(p) + '" target="_blank" rel="noopener">' +
      icon("i-star") + "Dejar mi reseña</a>";
  }
  function average(list) {
    if (!list.length) return 0;
    return Math.round(list.reduce(function (a, r) { return a + r.estrellas; }, 0) / list.length * 10) / 10;
  }
  function reviewsSectionHTML(slug) {
    var p = slug ? byId(slug) : null;
    var list = reviewsOf(slug);
    var head, body;
    if (list.length) {
      head = '<div class="rating-sum">' + stars(Math.round(average(list))) + " <strong>" + average(list).toLocaleString("es-AR") +
             "</strong> · " + list.length + (list.length === 1 ? " reseña" : " reseñas") + "</div>";
      body = '<ul class="reviews">' + list.map(reviewCard).join("") + "</ul>";
    } else {
      head = "";
      body = '<div class="review-empty"><p>' +
             (p ? "Todavía no hay opiniones de este producto." : "Estamos empezando, y tu opinión nos ayuda a crecer.") +
             " ¿Ya compraste? Contanos qué te pareció.</p></div>";
    }
    return head + body + '<div class="review-cta">' + reviewBtn(p, "btn-primary") + "</div>";
  }

  /* ---------- tarjeta de producto ---------- */
  function cardHTML(p, i) {
    var media;
    if (p.fotos > 0) {
      media = '<img class="m1" src="' + foto(p, 1) + '" alt="' + esc(p.nombre) + '" width="600" height="600"' +
              (i > 2 ? ' loading="lazy"' : "") + ' decoding="async">';
      if (p.fotos > 1) media += '<img class="m2" src="' + foto(p, 2) + '" alt="" width="600" height="600" loading="lazy" decoding="async">';
    } else {
      media = placeholder();
    }
    return '<li><a class="card" href="#/p/' + p.slug + '">' +
      '<div class="card-media">' + media + stockHTML(p) + "</div>" +
      '<div class="card-body"><p class="card-cat">' + catNombre(p.categoria) + "</p>" +
      "<h3>" + p.nombre + "</h3>" +
      (p.precio != null ? '<div class="price-row">' + precioHTML(p) + "</div>" +
        '<p class="card-off">' + pct(p) + "% OFF con transferencia</p>" : "") +
      '<span class="card-cta">Ver producto</span></div></a></li>';
  }

  function gridHTML() {
    var lista = D.productos.filter(function (p) { return filtro === "todos" || p.categoria === filtro; });
    lista = lista.slice().sort(function (a, b) {
      return (a.stock === "proximamente") - (b.stock === "proximamente");
    });
    return lista.map(cardHTML).join("");
  }

  /* ---------- inicio ---------- */
  var CAT_FOTOS = { hogar: "horno", mascotas: "bebedero", exterior: "carro" };

  function catCardsHTML() {
    return D.categorias.map(function (c) {
      var n = D.productos.filter(function (p) { return p.categoria === c.id && p.stock !== "proximamente"; }).length;
      var slug = CAT_FOTOS[c.id] || "carro";
      return '<li><button type="button" class="cat-card" data-cat="' + c.id + '">' +
        '<span class="cat-label">' + c.nombre + "<small>" + n + (n === 1 ? " producto" : " productos") + "</small></span>" +
        '<img src="' + v("img/" + slug + "/1.webp") + '" alt="" width="600" height="600" loading="lazy" decoding="async">' +
        "</button></li>";
    }).join("");
  }

  function faqHTML() {
    var items = [
      ["¿Cómo compro?", "Elegí tu producto y pagá con Mercado Pago o por transferencia. Después te escribimos para coordinar la entrega."],
      ["¿Qué medios de pago hay?", "Con Mercado Pago pagás en hasta " + D.cuotas + " cuotas sin interés. Por transferencia tenés " + D.transferencia.descuento + "% OFF."],
      ["¿Cuánto cuesta el envío?", "Tu primera compra tiene envío gratis, y también las compras que superen " + money0() + ". En el resto, el costo lo calcula el correo según el destino y te lo informamos antes de despachar."],
      ["¿Envían a todo el país?", "Sí, enviamos a cualquier parte del país con Andreani o Correo Argentino."],
      ["¿Puedo retirar en persona?", "Sí. Escribinos por WhatsApp y coordinamos el retiro."],
      ["¿Qué pasa si el producto falla?", "Tenés 10 días de garantía si el producto presenta una falla. Lo cambiamos y el envío del cambio corre por nuestra cuenta."]
    ];
    return '<div class="faq">' + items.map(function (it) {
      return "<details><summary>" + it[0] + "</summary><p>" + it[1] + "</p></details>";
    }).join("") + "</div>";
  }

  function homeHTML() {
    var chips = '<button type="button" class="chip" data-filtro="todos" aria-pressed="true">Todos</button>' +
      D.categorias.map(function (c) {
        return '<button type="button" class="chip" data-filtro="' + c.id + '" aria-pressed="false">' + c.nombre + "</button>";
      }).join("");
    var hv = byId("hidrolavadora");
    var ff = byId("fuente-agua");

    return '' +
    '<section class="hero">' +
      '<div class="wrap hero-in">' +
        '<div class="hero-text">' +
          '<p class="eyebrow">Faberco</p>' +
          '<h1>Hacé fácil lo de todos los días</h1>' +
          '<p class="lead">Productos prácticos para tu casa, tus mascotas y tus salidas. Pagá online de forma segura. <strong>Envío gratis en tu primera compra.</strong></p>' +
          '<div class="hero-cta">' +
            '<a class="btn btn-primary" href="#/productos">Ver todo el stock</a>' +
            '<a class="btn btn-ghost" href="#/como-comprar">Cómo comprar</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-visual">' +
          '<div class="phone">' +
            '<video class="loop-video" data-autoplay poster="' + v(ff.video.poster) + '" muted loop playsinline preload="metadata" aria-label="Video: fuente de agua con filtro para mascotas">' +
              '<source src="' + v(ff.video.src) + '" type="video/mp4"></video>' +
            '<a class="phone-tag" href="#/p/fuente-agua"><span>' + ff.nombre + "</span><strong>Ver producto →</strong></a>" +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="perks" aria-label="Beneficios"><div class="wrap perks-in">' +
      perk("i-truck", "Envío gratis", "En tu primera compra") +
      perk("i-card", D.cuotas + " cuotas sin interés", "Con Mercado Pago") +
      perk("i-percent", D.transferencia.descuento + "% OFF", "Pagando por transferencia") +
      perk("i-lock", "Pago seguro", "Con Mercado Pago") +
    '</div></section>' +

    '<section class="section" id="categorias">' +
      '<div class="wrap">' +
        '<div class="section-head"><h2>Comprá por categoría</h2></div>' +
        '<ul class="cat-grid">' + catCardsHTML() + "</ul>" +
      '</div>' +
    '</section>' +

    '<section class="section section-tight" id="productos">' +
      '<div class="wrap">' +
        '<div class="section-head"><h2>Todo el stock</h2><p>Tocá un producto para ver sus fotos y características.</p></div>' +
        '<div class="chips" role="group" aria-label="Filtrar por categoría">' + chips + '</div>' +
        '<ul class="grid" id="grid">' + gridHTML() + '</ul>' +
      '</div>' +
    '</section>' +

    '<section class="section section-alt" id="en-accion">' +
      '<div class="wrap action-in">' +
        '<div class="action-video">' +
          '<div class="phone phone-sm">' +
            '<video class="loop-video" data-autoplay poster="' + v(hv.video.poster) + '" muted loop playsinline preload="none" aria-label="Video: hidrolavadora inalámbrica en uso">' +
              '<source src="' + v(hv.video.src) + '" type="video/mp4"></video>' +
            '<button type="button" class="sound-btn" data-sound aria-pressed="false">' + icon("i-sound") + "<span>Activar sonido</span></button>" +
          '</div>' +
        '</div>' +
        '<div class="action-text">' +
          '<p class="eyebrow">En acción</p>' +
          '<h2>Mirá cómo funciona</h2>' +
          '<p class="lead">La hidrolavadora inalámbrica 48V lava tu auto, el patio y los muebles de exterior sin depender de un tomacorriente. Sin cables, sin vueltas.</p>' +
          '<ul class="ticks"><li>Batería extraíble de 48V</li><li>Incluye cargador, maletín y accesorios</li><li>Con jabón o solo agua</li></ul>' +
          '<a class="btn btn-primary" href="#/p/hidrolavadora">Ver la hidrolavadora</a>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section" id="como-comprar">' +
      '<div class="wrap">' +
        '<div class="section-head"><h2>Cómo comprar</h2></div>' +
        '<ol class="steps">' +
          step("1", "Elegí tu producto", "Mirá las fotos y las características de lo que te interesa.") +
          step("2", "Pagá como prefieras", "Con Mercado Pago en hasta " + D.cuotas + " cuotas sin interés, o por transferencia con " + D.transferencia.descuento + "% OFF.") +
          step("3", "Coordinamos tu envío", "Te escribimos para coordinar la entrega. Tu primera compra tiene envío gratis, y también las que superen " + money0() + ".") +
        '</ol>' +
      '</div>' +
    '</section>' +

    '<section class="section section-alt" id="resenas">' +
      '<div class="wrap">' +
        '<div class="section-head"><h2>Lo que dicen nuestros clientes</h2></div>' +
        reviewsSectionHTML("") +
      '</div>' +
    '</section>' +

    '<section class="section" id="preguntas">' +
      '<div class="wrap wrap-narrow">' +
        '<div class="section-head"><h2>Preguntas frecuentes</h2></div>' +
        faqHTML() +
        '<p class="faq-more">Más información: <a href="#/envios">Envíos</a> · <a href="#/garantia">Cambios y garantía</a></p>' +
      '</div>' +
    '</section>' +

    '<section class="cta-final"><div class="wrap">' +
      '<h2>¿Buscás algo que no ves acá?</h2>' +
      '<p>Contanos qué necesitás y lo consultamos.</p>' +
      '<a class="btn btn-light" data-wa="Hola, estoy buscando un producto que no vi en la web" target="_blank" rel="noopener">Escribinos por WhatsApp</a>' +
    '</div></section>';
  }
  function perk(ic, t, s) {
    return '<div class="perk">' + icon(ic) + "<div><strong>" + t + "</strong><span>" + s + "</span></div></div>";
  }
  function step(n, t, s) {
    return '<li class="step"><span class="step-n">' + n + "</span><h3>" + t + "</h3><p>" + s + "</p></li>";
  }

  /* ---------- página de producto ---------- */
  function productHTML(p) {
    var gal;
    if (p.fotos > 0) {
      var slides = "", thumbs = "", dots = "";
      for (var i = 1; i <= p.fotos; i++) {
        slides += '<div class="g-slide"><img src="' + foto(p, i) + '" alt="' + esc(p.nombre) + " - foto " + i + " de " + p.fotos + '" width="1000" height="1000"' +
                  (i === 1 ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></div>';
        thumbs += '<button type="button" class="g-thumb" data-i="' + (i - 1) + '" aria-label="Ver foto ' + i + '"><img src="' + foto(p, i) + '" alt="" width="120" height="120" decoding="async"></button>';
        dots += '<span class="g-dot"></span>';
      }
      gal = '<div class="gallery" data-n="' + p.fotos + '">' +
        '<div class="g-main">' +
          '<div class="g-track" tabindex="0" aria-label="Fotos de ' + esc(p.nombre) + '">' + slides + "</div>" +
          (p.fotos > 1 ?
            '<button type="button" class="g-btn g-prev" aria-label="Foto anterior">' + icon("i-prev") + "</button>" +
            '<button type="button" class="g-btn g-next" aria-label="Foto siguiente">' + icon("i-next") + "</button>" +
            '<div class="g-dots" aria-hidden="true">' + dots + "</div>" : "") +
          stockHTML(p) +
        "</div>" +
        (p.fotos > 1 ? '<div class="g-thumbs">' + thumbs + "</div>" : "") +
      "</div>";
    } else {
      gal = '<div class="gallery"><div class="g-main g-empty">' + placeholder() + stockHTML(p) + "</div></div>";
    }

    var specs = p.specs.map(function (s) {
      return "<li><span>" + s[0] + "</span><span>" + s[1] + "</span></li>";
    }).join("");

    var pagar = !!p.linkPago;
    var label = pagar ? "Comprar con Mercado Pago" : "Consultar por WhatsApp";
    var buyAttrs = pagar
      ? 'href="' + p.linkPago + '" target="_blank" rel="noopener"'
      : 'data-wa="' + esc("Hola, quiero consultar por: " + p.nombre) + '" target="_blank" rel="noopener"';

    var otros = D.productos.filter(function (x) { return x.slug !== p.slug && x.stock !== "proximamente"; })
      .sort(function (a, b) { return (b.categoria === p.categoria) - (a.categoria === p.categoria); })
      .slice(0, 4);

    var video = p.video ?
      '<section class="p-video"><h2>Mirá cómo funciona</h2><div class="p-video-box">' +
        '<video controls playsinline preload="none" poster="' + v(p.video.poster) + '" aria-label="Video de ' + esc(p.nombre) + '">' +
        '<source src="' + v(p.video.src) + '" type="video/mp4"></video></div></section>' : "";

    return '' +
    '<div class="wrap product">' +
      '<nav class="crumbs" aria-label="Ruta"><a href="#/">Inicio</a><span>/</span><a href="#/productos">Productos</a><span>/</span><span aria-current="page">' + catNombre(p.categoria) + "</span></nav>" +
      '<div class="product-grid">' +
        gal +
        '<div class="info">' +
          '<p class="card-cat">' + catNombre(p.categoria) + "</p>" +
          "<h1>" + p.nombre + "</h1>" +
          (p.precio != null ? '<div class="price-row price-lg">' + precioHTML(p) + "</div>" +
            '<p class="pay-note">Hasta ' + D.cuotas + ' cuotas sin interés de <strong>' + money(Math.round(p.precio / D.cuotas)) + "</strong></p>" +
            '<p class="pay-transfer"><strong>' + money(transf(p)) + '</strong> con transferencia <span class="price-off">' + pct(p) + "% OFF</span></p>" : "") +
          '<p class="desc">' + p.descripcion + "</p>" +
          '<ul class="specs">' + specs + "</ul>" +
          '<a class="btn btn-primary btn-block btn-lg" ' + buyAttrs + '>' + (pagar ? icon("i-lock") : icon("i-wa")) + label + "</a>" +
          (p.precio != null ? '<button type="button" class="btn btn-ghost btn-block btn-lg btn-transfer" data-transfer="' + p.slug + '">Pagar por transferencia · ' + pct(p) + "% OFF</button>" : "") +
          '<ul class="mini-perks">' +
            '<li>' + icon("i-lock") + "Pago seguro con Mercado Pago</li>" +
            '<li>' + icon("i-truck") + "Envío gratis en tu primera compra y en compras desde " + money0() + "</li>" +
            '<li>' + icon("i-shield") + '10 días de garantía por fallas · <a href="#/garantia">Ver condiciones</a></li>' +
            '<li>' + icon("i-chat") + "¿Dudas? Te respondemos por WhatsApp</li>" +
          "</ul>" +
        "</div>" +
      "</div>" +
      video +
      '<section class="p-reviews"><h2>Opiniones de clientes</h2>' + reviewsSectionHTML(p.slug) + "</section>" +
      '<section class="more"><h2>También te puede interesar</h2><ul class="grid grid-4">' + otros.map(cardHTML).join("") + "</ul></section>" +
    "</div>" +
    '<div class="sticky-cta"><a class="btn btn-primary btn-block" ' + buyAttrs + '>' + label + "</a></div>";
  }

  /* ---------- páginas legales ---------- */
  function sellerLine() {
    var s = D.vendedor;
    return esc(s.nombre) + " · " + esc(s.condicion) + " · CUIT " + esc(s.cuit);
  }
  var PAGES = {
    envios: {
      title: "Envíos",
      html: function () {
        return '' +
        "<p>Enviamos a <strong>todo el país</strong> con <strong>Andreani</strong> o <strong>Correo Argentino</strong>.</p>" +
        "<h2>¿Cuándo el envío es gratis?</h2>" +
        "<ul><li><strong>En tu primera compra.</strong></li><li><strong>En compras que superen " + money0() + "</strong>, siempre.</li></ul>" +
        "<h2>¿Y en las demás compras?</h2>" +
        "<p>El costo lo calcula el correo según el destino y el peso del paquete. Te lo informamos por WhatsApp antes de despachar, para que lo sepas antes de decidir.</p>" +
        "<h2>Retiro en persona</h2>" +
        "<p>También podés retirar tu compra en persona, sin costo. Escribinos por WhatsApp y coordinamos.</p>" +
        "<h2>Cambios por falla</h2>" +
        "<p>Si un producto llega con una falla, el envío del cambio corre por nuestra cuenta. Más información en <a href=\"#/garantia\">Cambios y garantía</a>.</p>";
      }
    },
    garantia: {
      title: "Cambios y garantía",
      html: function () {
        return '' +
        "<h2>10 días de garantía por fallas</h2>" +
        "<p>Si el producto presenta una falla dentro de los <strong>10 días</strong> de recibido, lo cambiamos. <strong>El envío del cambio lo pagamos nosotros.</strong></p>" +
        "<h2>Cómo hacer un reclamo</h2>" +
        "<ol><li>Escribinos por WhatsApp con tu nombre y el producto.</li><li>Mandanos fotos o un video donde se vea la falla.</li><li>Coordinamos el cambio.</li></ol>" +
        "<h2>Qué cubre</h2>" +
        "<p>La garantía cubre fallas del producto. No cubre daños causados por mal uso, golpes o desgaste.</p>" +
        "<h2>Garantía legal</h2>" +
        "<p>Además, rige la garantía legal de la Ley 24.240 de Defensa del Consumidor, que es de 6 meses para productos nuevos.</p>" +
        '<p class="a-cta"><a class="btn btn-primary" data-wa="Hola, quiero hacer un reclamo por garantía" target="_blank" rel="noopener">Reclamar por WhatsApp</a></p>';
      }
    },
    gracias: {
      title: "¡Gracias por tu compra!",
      html: function () {
        return '' +
        "<p>Nos alegra mucho que hayas elegido Faberco. En breve te escribimos para coordinar tu envío.</p>" +
        "<h2>¿Nos ayudás con una reseña?</h2>" +
        "<p>Tu opinión es muy valiosa para nosotros y para quienes están por comprar. Te lleva un minuto.</p>" +
        '<p class="a-cta">' + reviewBtn(null, "btn-primary") + "</p>";
      }
    }
  };

  function pageHTML(key) {
    var pg = PAGES[key];
    return '<div class="wrap wrap-narrow page">' +
      '<nav class="crumbs" aria-label="Ruta"><a href="#/">Inicio</a><span>/</span><span aria-current="page">' + pg.title + "</span></nav>" +
      "<h1>" + pg.title + "</h1>" + '<div class="prose">' + pg.html() + "</div></div>";
  }

  /* ---------- carrusel de fotos ---------- */
  function initGallery(root) {
    var track = root.querySelector(".g-track");
    if (!track) return;
    var n = track.children.length;
    var dots = root.querySelectorAll(".g-dot");
    var thumbs = root.querySelectorAll(".g-thumb");
    var idx = 0;

    function mark() {
      for (var i = 0; i < dots.length; i++) dots[i].classList.toggle("on", i === idx);
      for (var j = 0; j < thumbs.length; j++) {
        thumbs[j].classList.toggle("on", j === idx);
        thumbs[j].setAttribute("aria-current", j === idx ? "true" : "false");
      }
    }
    function go(i) {
      idx = (i + n) % n;
      track.scrollTo({ left: idx * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
      mark();
    }
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== idx && i >= 0 && i < n) { idx = i; mark(); }
    }, { passive: true });

    var prev = root.querySelector(".g-prev"), next = root.querySelector(".g-next");
    if (prev) prev.addEventListener("click", function () { go(idx - 1); });
    if (next) next.addEventListener("click", function () { go(idx + 1); });
    for (var t = 0; t < thumbs.length; t++) {
      thumbs[t].addEventListener("click", function (e) { go(+e.currentTarget.getAttribute("data-i")); });
    }
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
    });
    window.addEventListener("resize", function () { track.scrollTo({ left: idx * track.clientWidth, behavior: "auto" }); });
    mark();
  }

  /* ---------- videos en bucle: se reproducen solo cuando se ven ---------- */
  function initVideos(root) {
    if (observer) { observer.disconnect(); observer = null; }
    var vids = root.querySelectorAll("video[data-autoplay]");
    if (!vids.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var k = 0; k < vids.length; k++) vids[k].setAttribute("controls", "");
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var vd = en.target;
        if (en.isIntersecting) { vd.muted = vd.dataset.sound !== "on"; var pr = vd.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else vd.pause();
      });
    }, { threshold: 0.35 });
    for (var i = 0; i < vids.length; i++) { vids[i].muted = true; observer.observe(vids[i]); }
  }

  /* ---------- enlaces de WhatsApp (data-wa) ---------- */
  function wireWA(scope) {
    var els = (scope || document).querySelectorAll("[data-wa]");
    for (var i = 0; i < els.length; i++) els[i].setAttribute("href", wa(els[i].getAttribute("data-wa")));
  }

  /* ---------- rutas ---------- */
  var sections = { "productos": "productos", "como-comprar": "como-comprar", "contacto": "contacto", "resenas": "resenas", "preguntas": "preguntas", "categorias": "categorias" };

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 78, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function renderHome() {
    document.body.classList.remove("is-product");
    document.title = BASE_TITLE;
    app.innerHTML = homeHTML();
    wireWA(app);
    initVideos(app);
    view = "home";
  }

  function route() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/p\/([\w-]+)/);
    var p = m && byId(m[1]);
    var pg = h.match(/^#\/(envios|garantia|gracias)$/);

    if (p) {
      if (view === "home") homeScroll = window.scrollY;
      document.body.classList.add("is-product");
      document.title = p.nombre + " | Faberco";
      app.innerHTML = productHTML(p);
      wireWA(app);
      initGallery(app);
      initVideos(app);
      view = "product";
      window.scrollTo(0, 0);
      return;
    }

    if (pg) {
      if (view === "home") homeScroll = window.scrollY;
      document.body.classList.remove("is-product");
      document.title = PAGES[pg[1]].title + " | Faberco";
      app.innerHTML = pageHTML(pg[1]);
      wireWA(app);
      initVideos(app);
      view = "page";
      window.scrollTo(0, 0);
      return;
    }

    var key = h.replace(/^#\//, "");
    var coming = view === "product" || view === "page";
    if (view !== "home") renderHome();

    if (sections[key]) {
      setTimeout(function () { scrollToId(sections[key]); }, 30);
    } else if (coming) {
      window.scrollTo(0, homeScroll);
    } else {
      window.scrollTo(0, 0);
    }
  }
  window.addEventListener("hashchange", route);

  /* ---------- pago por transferencia ---------- */
  var tDlg = document.getElementById("transfer");
  var tBody = document.getElementById("transfer-body");
  function fila(k, val, copiable) {
    if (!val) return "";
    return "<li><span>" + k + "</span><span><strong>" + esc(val) + "</strong>" +
      (copiable ? ' <button type="button" class="copy" data-copy="' + esc(val) + '">Copiar</button>' : "") + "</span></li>";
  }
  function openTransfer(slug) {
    var p = byId(slug);
    if (!p || p.precio == null || !tDlg) return;
    var t = D.transferencia, monto = money(transf(p));
    var tiene = t.alias || t.cbu;
    var msg = tiene ? "Hola, hice una transferencia de " + monto + " por: " + p.nombre + ". Te envío el comprobante."
                    : "Hola, quiero pagar por transferencia (" + pct(p) + "% OFF): " + p.nombre + " (" + monto + "). ¿Me pasás los datos?";
    tBody.innerHTML =
      '<h2 id="transfer-title">Pagá por transferencia</h2>' +
      '<p class="t-prod">' + p.nombre + "</p>" +
      '<p class="t-amount">' + monto + ' <span class="price-off">' + pct(p) + "% OFF</span></p>" +
      '<p class="t-was">Con tarjeta o cuotas: ' + money(p.precio) + " · ahorrás " + money(p.precio - transf(p)) + "</p>" +
      (tiene ? '<ul class="t-data">' + fila("Titular", t.titular) + fila("Alias", t.alias, true) + fila("CBU / CVU", t.cbu, true) + fila("Banco", t.banco) + "</ul>"
             : '<p class="t-help">Escribinos por WhatsApp y te pasamos los datos para transferir.</p>') +
      '<a class="btn btn-primary btn-block" target="_blank" rel="noopener" href="' + wa(msg) + '">' +
        icon("i-wa") + (tiene ? "Enviar comprobante por WhatsApp" : "Pedir datos por WhatsApp") + "</a>" +
      (tiene ? '<p class="t-help">Una vez que transferís, mandanos el comprobante y coordinamos tu envío.</p>' : "");
    tDlg.showModal();
  }
  if (tDlg) tDlg.addEventListener("click", function (e) {
    if (e.target === tDlg || e.target.hasAttribute("data-close")) { tDlg.close(); return; }
    var c = e.target.closest("[data-copy]");
    if (c) {
      var val = c.getAttribute("data-copy");
      try { navigator.clipboard.writeText(val); c.textContent = "Copiado"; setTimeout(function () { c.textContent = "Copiar"; }, 1600); } catch (err) {}
    }
  });

  /* ---------- clics generales ---------- */
  function setFiltro(f) {
    filtro = f;
    var chips = app.querySelectorAll(".chip");
    for (var i = 0; i < chips.length; i++) chips[i].setAttribute("aria-pressed", chips[i].getAttribute("data-filtro") === f ? "true" : "false");
    var g = document.getElementById("grid");
    if (g) g.innerHTML = gridHTML();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-transfer]");
    if (b) { openTransfer(b.getAttribute("data-transfer")); return; }

    var chip = e.target.closest(".chip");
    if (chip && app.contains(chip)) { setFiltro(chip.getAttribute("data-filtro")); return; }

    var cat = e.target.closest(".cat-card");
    if (cat) { setFiltro(cat.getAttribute("data-cat")); scrollToId("productos"); return; }

    var snd = e.target.closest("[data-sound]");
    if (snd) {
      var vd = snd.parentNode.querySelector("video");
      var on = vd.muted;                       // estaba mudo -> activar sonido
      vd.muted = !on; vd.dataset.sound = on ? "on" : "off";
      if (on) { var pr = vd.play(); if (pr && pr.catch) pr.catch(function () {}); }
      snd.setAttribute("aria-pressed", on ? "true" : "false");
      snd.querySelector("span").textContent = on ? "Silenciar" : "Activar sonido";
    }
  });

  /* ---------- ventana "envío gratis" ---------- */
  var popup = document.getElementById("popup");
  var shown = false;
  function seen() { try { return sessionStorage.getItem("fb_popup") === "1"; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem("fb_popup", "1"); } catch (e) {} }
  function openPopup() {
    if (shown || seen() || !popup || typeof popup.showModal !== "function") return;
    shown = true; markSeen();
    wireWA(popup);
    popup.showModal();
  }
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target === popup || e.target.hasAttribute("data-close") || e.target.closest("[data-close]")) popup.close();
    });
  }
  document.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget && e.clientY <= 0) openPopup();           // escritorio: el mouse sale por arriba
  });
  if (window.matchMedia("(pointer: coarse)").matches) setTimeout(openPopup, 45000);  // celular: a los 45 s

  /* ---------- pie de página (datos del vendedor) ---------- */
  var fl = document.getElementById("f-legal");
  if (fl) fl.innerHTML = sellerLine();
  var fm = document.getElementById("f-mail");
  if (fm) { fm.href = "mailto:" + D.vendedor.email; fm.lastChild.textContent = D.vendedor.email; }

  /* ---------- inicio ---------- */
  wireWA(document);
  route();
})();
