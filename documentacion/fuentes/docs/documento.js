// Numera secciones, figuras y tablas de forma corrida y, si existe, llena el contenido breve antes de paginar.
// Inserta el código real desde entregables/codigo: <div class="codigo" data-src="ruta" data-lineas="10-40"></div>.
function insertarCodigo() {
  document.querySelectorAll(".codigo[data-src]").forEach((caja) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", caja.dataset.src, false);
    xhr.send();
    let lineas = xhr.responseText.replace(/\n$/, "").split("\n");
    let desde = 1;
    if (caja.dataset.lineas) {
      const [a, b] = caja.dataset.lineas.split("-").map(Number);
      lineas = lineas.slice(a - 1, b); desde = a;
    }
    const tit = document.createElement("div");
    tit.className = "codigo-tit";
    tit.textContent = caja.dataset.titulo || caja.dataset.src.split("/").pop();
    caja.appendChild(tit);
    lineas.forEach((texto, i) => {
      const l = document.createElement("div"); l.className = "l";
      const n = document.createElement("span"); n.className = "n"; n.textContent = desde + i;
      const t = document.createElement("span"); t.className = "t"; t.textContent = texto || " ";
      l.append(n, t); caja.appendChild(l);
    });
  });
}

window.PagedConfig = {
  auto: true,
  before: () => {
    insertarCodigo();
    const lista = document.querySelector(".contenido ol");
    let s = 0, sub = 0, f = 0, t = 0;
    const numeros = {};
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
      if (el.id && (el.tagName === "FIGURE" || el.tagName === "TABLE")) numeros[el.id] = el.tagName === "FIGURE" ? f : t;
    });
    // Referencias cruzadas: <a class="ref" href="#id"></a> recibe el número de la figura o tabla.
    document.querySelectorAll("a.ref").forEach((a) => {
      const n = numeros[a.getAttribute("href").slice(1)];
      a.textContent = n === undefined ? "??" : n;
    });
  },
  after: () => { window.__listo = true; },
};
