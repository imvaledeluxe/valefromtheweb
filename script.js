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

const STORAGE_KEY = "valefromtheweb.entries";
let entries = loadEntries();
let selectedCategory = "Todas";

const articleList = document.getElementById("articleList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const editorDialog = document.getElementById("editorDialog");
const readerDialog = document.getElementById("readerDialog");

function loadEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterEntries;
  } catch {
    return starterEntries;
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(dateString) {
  if (!dateString) return "SIN FECHA";
  return new Date(dateString + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric"
  }).toUpperCase();
}

function renderEntries() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = entries
    .filter(entry => selectedCategory === "Todas" || entry.category === selectedCategory)
    .filter(entry => `${entry.title} ${entry.content} ${entry.category}`.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date));

  articleList.innerHTML = "";
  emptyState.hidden = visible.length > 0;

  visible.forEach(entry => {
    const card = document.createElement("article");
    card.className = "article-card";

    const meta = document.createElement("span");
    meta.className = "article-meta";
    meta.textContent = `${entry.category.toUpperCase()} / ${formatDate(entry.date)}`;

    const title = document.createElement("h3");
    title.textContent = entry.title;

    const excerpt = document.createElement("p");
    excerpt.textContent = entry.content.length > 135
      ? entry.content.slice(0, 135).trim() + "…"
      : entry.content;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Leer entrada ↗";
    button.addEventListener("click", () => openReader(entry));

    card.append(meta, title, excerpt, button);
    articleList.append(card);
  });
}

function openReader(entry) {
  document.getElementById("readerMeta").textContent =
    `${entry.category.toUpperCase()} · ${formatDate(entry.date)}`;
  document.getElementById("readerTitle").textContent = entry.title;
  document.getElementById("readerBody").textContent = entry.content;
  readerDialog.showModal();
}

document.getElementById("filters").addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;
  document.querySelectorAll(".filter").forEach(item => {
    item.classList.toggle("active", item === button);
  });
  renderEntries();
});

searchInput.addEventListener("input", renderEntries);

document.getElementById("openEditor").addEventListener("click", () => {
  document.getElementById("entryDate").value =
    new Date().toLocaleDateString("en-CA");
  editorDialog.showModal();
});

document.getElementById("entryForm").addEventListener("submit", event => {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: document.getElementById("entryTitle").value.trim(),
    category: document.getElementById("entryCategory").value,
    date: document.getElementById("entryDate").value,
    content: document.getElementById("entryContent").value.trim()
  };

  if (!entry.title || !entry.content || !entry.date) return;

  entries.push(entry);
  saveEntries();
  event.target.reset();
  editorDialog.close();
  selectedCategory = "Todas";
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "Todas");
  });
  renderEntries();
});

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
    content: "Nuestras experiencias individuales no ocurren en el vacío. Lo que vivimos en casa, en el trabajo, en la escuela y en nuestras relaciones también está atravesado por normas, expectativas y estructuras sociales.\n\nDecir que lo personal es político no significa que cada experiencia tenga que convertirse en un debate público. Significa reconocer que muchas experiencias que parecen privadas tienen causas y consecuencias colectivas.\n\nEsta entrada es un punto de partida: una invitación a mirar de nuevo aquello que aprendimos a considerar normal."
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
renderEntries();
