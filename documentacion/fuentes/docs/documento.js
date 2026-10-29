// Numera secciones, figuras y tablas de forma corrida y, si existe, llena el contenido breve antes de paginar.
window.PagedConfig = {
  auto: true,
  before: () => {
    const lista = document.querySelector(".contenido ol");
    let s = 0, sub = 0, f = 0, t = 0;
    document.querySelectorAll("main h2, main h3, main figure, main table.tabla").forEach((el) => {
      if (el.tagName === "H2") {
        s++; sub = 0;
        el.id = el.id || "s" + s;
        el.innerHTML = `<span class="n">${s}.</span>${el.innerHTML}`;
        if (lista) {
          const li = document.createElement("li");
          li.innerHTML = `<span class="num">${s}.</span><span class="txt">${el.textContent.replace(/^\d+\./, "")}</span><span class="puntos"></span><a class="pag" href="#${el.id}"></a>`;
          lista.appendChild(li);
        }
      } else if (el.tagName === "H3") {
        sub++;
        el.innerHTML = `<span class="n">${s}.${sub}.</span>${el.innerHTML}`;
      } else if (el.tagName === "FIGURE") {
        const cap = el.querySelector("figcaption");
        cap.innerHTML = `<span class="etq">Figura ${++f}.</span> ${cap.innerHTML}`;
      } else {
        const cp = el.querySelector("caption");
        if (cp) cp.innerHTML = `<span class="etq">Tabla ${++t}.</span> ${cp.innerHTML}`;
      }
    });
  },
  after: () => { window.__listo = true; },
};
