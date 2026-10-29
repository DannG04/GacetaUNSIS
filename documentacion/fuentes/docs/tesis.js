// Numera capítulos, secciones, figuras y tablas, y construye el índice antes de paginar.
window.PagedConfig = {
  auto: true,
  before: () => {
    const indice = document.querySelector(".indice ol.contenido");
    const listaFig = document.querySelector(".indice ol.figuras");
    let nId = 0;
    const ancla = (el) => el.id || (el.id = "a" + ++nId);
    const entrada = (lista, clase, num, texto, id) => {
      const li = document.createElement("li");
      li.className = clase;
      li.innerHTML = `<span class="num">${num}</span><span class="txt">${texto}</span><span class="puntos"></span><a class="pag" href="#${id}"></a>`;
      lista.appendChild(li);
    };
    document.querySelectorAll("section.capitulo").forEach((cap, i) => {
      const c = i + 1;
      const h1 = cap.querySelector("h1");
      const enc = document.createElement("div");
      enc.className = "encabezado-capitulo";
      enc.innerHTML = `<div class="etq">Capítulo ${c}</div>`;
      h1.before(enc);
      enc.appendChild(h1);
      // El encabezado de página muestra «Capítulo N: Título».
      const marca = document.createElement("span");
      marca.className = "etq-oculta";
      marca.textContent = `Capítulo ${c}: ${h1.textContent}`;
      enc.appendChild(marca);
      entrada(indice, "n1", `${c}.`, h1.textContent, ancla(h1));
      let s = 0, sub = 0, f = 0, t = 0;
      cap.querySelectorAll("h2, h3, figure, table.tabla").forEach((el) => {
        if (el.tagName === "H2") {
          s++; sub = 0;
          const n = `${c}.${s}.`;
          el.innerHTML = `<span class="n">${n}</span>${el.innerHTML}`;
          entrada(indice, "n2", n, el.textContent.replace(n, ""), ancla(el));
        } else if (el.tagName === "H3") {
          sub++;
          el.innerHTML = `<span class="n">${c}.${s}.${sub}.</span>${el.innerHTML}`;
        } else if (el.tagName === "FIGURE") {
          f++;
          const cap_ = el.querySelector("figcaption");
          const txt = cap_.innerHTML;
          cap_.innerHTML = `<span class="etq">Figura ${c}.${f}:</span> ${txt}`;
          if (listaFig) entrada(listaFig, "n2 fig", `${c}.${f}`, cap_.textContent.replace(/^Figura [\d.]+:\s*/, "").replace(/\.\s.*$/, ""), ancla(el));
        } else {
          t++;
          const cp = el.querySelector("caption");
          if (cp) cp.innerHTML = `<span class="etq">Tabla ${c}.${t}:</span> ${cp.innerHTML}`;
        }
      });
    });
  },
  after: () => { window.__listo = true; },
};

// Oculta el encabezado de página en la primera página de cada capítulo, como en LaTeX.
window.registrarManejadores = () => {
  class InicioCapitulo extends Paged.Handler {
    afterPageLayout(pagina) {
      if (pagina.querySelector(".encabezado-capitulo")) pagina.classList.add("inicio-capitulo");
    }
  }
  Paged.registerHandlers(InicioCapitulo);
};
