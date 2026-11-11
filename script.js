
const starterEntries = [
  {
    id: "starter-1",
    title: "La normalidad también puede ser una construcción.",
    category: "Sociedad",
    date: "2026-11-09",
    content: "¿Quién decide qué es normal y por qué aceptamos ciertas ideas sin cuestionarlas?\n\nA veces llamamos normal a aquello que simplemente se repite. Pero que una práctica sea habitual no significa que sea justa, natural o inevitable."
  },
  {
    id: "starter-2",
    title: "La contradicción de existir.",
    category: "Filosofía",
    date: "2026-11-09",
    content: "Entre la necesidad de encontrar sentido y la posibilidad de que no exista ninguno.\n\nQuizá pensar no siempre sirve para encontrar respuestas. A veces sirve para formular preguntas mejores."
  },
  {
    id: "starter-3",
    title: "No todo lo que es legal es justo.",
    category: "Derecho",
    date: "2026-11-09",
    content: "Una aproximación a la relación entre el derecho, la moral y la justicia.\n\nLa legalidad describe lo que está permitido por un ordenamiento jurídico. La justicia, en cambio, nos obliga a preguntarnos si ese ordenamiento merece ser defendido."
  }
];

const CONTENT_API =
  "https://api.github.com/repos/imvaledeluxe/valefromtheweb/contents/content/entradas?ref=main";

let entries = [];
let selectedCategory = "Todas";

const articleList = document.getElementById("articleList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const readerDialog = document.getElementById("readerDialog");

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);

  if (!match) return null;

  const metadata = {};
  match[1].split(/\r?\n/).forEach(line => {
    const separator = line.indexOf(":");
    if (separator === -1) return;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    metadata[key] = value;
  });

  return {
    id: metadata.slug || metadata.title || String(Date.now()),
    title: metadata.title || "Sin título",
    category: metadata.category || "Personal",
    date: metadata.date || "",
    image: metadata.image || "",
    content: match[2].trim()
  };
}

async function loadEntries() {
  try {
    const response = await fetch(CONTENT_API);

    if (!response.ok) {
      throw new Error("No se pudo consultar el archivo de publicaciones.");
    }

    const files = await response.json();
    const markdownFiles = files.filter(file =>
      file.name.toLowerCase().endsWith(".md")
    );

    const publishedEntries = await Promise.all(
      markdownFiles.map(async file => {
        const fileResponse = await fetch(file.download_url);
        if (!fileResponse.ok) return null;

        const markdown = await fileResponse.text();
        return parseFrontMatter(markdown);
      })
    );

    entries = publishedEntries.filter(Boolean);

    if (entries.length === 0) {
      entries = starterEntries;
    }
  } catch (error) {
    console.warn("Se mostrarán las entradas de ejemplo:", error);
    entries = starterEntries;
  }

  buildFilters();
  renderEntries();
}

function formatDate(dateString) {
  if (!dateString) return "SIN FECHA";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? new Date(dateString + "T12:00:00")
    : new Date(dateString);

  if (Number.isNaN(date.getTime())) return "SIN FECHA";

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).toUpperCase();
}

function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFilters() {
  const categories = [
    "Todas",
    ...new Set(entries.map(entry => entry.category).filter(Boolean))
  ];

  filters.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "filter";
    button.dataset.category = category;
    button.textContent = category;

    if (category === selectedCategory) {
      button.classList.add("active");
    }

    filters.appendChild(button);
  });

  if (!categories.includes(selectedCategory)) {
    selectedCategory = "Todas";
    filters.querySelector('[data-category="Todas"]').classList.add("active");
  }
}

function renderEntries() {
  const query = searchInput.value.trim().toLowerCase();

  const visible = entries
    .filter(entry =>
      selectedCategory === "Todas" || entry.category === selectedCategory
    )
    .filter(entry =>
      `${entry.title} ${entry.content} ${entry.category}`
        .toLowerCase()
        .includes(query)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  articleList.innerHTML = "";
  emptyState.hidden = visible.length > 0;

  visible.forEach(entry => {
    const card = document.createElement("article");
    card.className = "article-card";

    const meta = document.createElement("span");
    meta.className = "article-meta";
    meta.textContent =
      `${entry.category.toUpperCase()} / ${formatDate(entry.date)}`;

    const title = document.createElement("h3");
    title.textContent = entry.title;

    const excerpt = document.createElement("p");
    const plainText = stripMarkdown(entry.content);
    excerpt.textContent = plainText.length > 135
      ? plainText.slice(0, 135) + "…"
      : plainText;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Leer entrada ↗";
    button.addEventListener("click", () => openReader(entry));

    card.append(meta, title, excerpt, button);
    articleList.appendChild(card);
  });
}

function openReader(entry) {
  document.getElementById("readerMeta").textContent =
    `${entry.category.toUpperCase()} · ${formatDate(entry.date)}`;

  document.getElementById("readerTitle").textContent = entry.title;

  const body = document.getElementById("readerBody");
  body.innerHTML = "";

  if (entry.image) {
    const image = document.createElement("img");
    image.src = entry.image;
    image.alt = entry.title;
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    image.style.marginBottom = "24px";
    body.appendChild(image);
  }

  const content = document.createElement("div");

  if (window.marked && window.DOMPurify) {
    content.innerHTML = DOMPurify.sanitize(marked.parse(entry.content));
  } else {
    content.textContent = entry.content;
  }

  body.appendChild(content);
  readerDialog.showModal();
}

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;

  filters.querySelectorAll(".filter").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  renderEntries();
});

searchInput.addEventListener("input", renderEntries);

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.close).close();
  });
});

document.getElementById("readFeatured").addEventListener("click", () => {
  openReader({
    title: "¿Y si todo lo personal fuera político?",
    category: "Filosofía",
    date: "2026-11-09",
    content: `Nuestras experiencias individuales no ocurren en el vacío. Lo que vivimos en casa, en el trabajo, en la escuela y en nuestras relaciones también está atravesado por normas, expectativas y estructuras sociales.

Decir que lo personal es político no significa que cada experiencia tenga que convertirse en un debate público.

Significa reconocer que muchas experiencias que parecen privadas tienen causas y consecuencias colectivas.

Esta entrada es un punto de partida: una invitación a mirar de nuevo aquello que aprendimos a considerar normal.`
  });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  const isDark = document.documentElement.classList.contains("dark");

  document.getElementById("themeToggle").textContent =
    isDark ? "Modo claro" : "Modo oscuro";

  localStorage.setItem("valefromtheweb.theme", isDark ? "dark" : "light");
});

if (localStorage.getItem("valefromtheweb.theme") === "dark") {
  document.documentElement.classList.add("dark");
  document.getElementById("themeToggle").textContent = "Modo claro";
}

document.getElementById("year").textContent = new Date().getFullYear();

loadEntries();
