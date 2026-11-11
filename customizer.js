/* Aplica los ajustes guardados desde el editor visual. */
(() => {
  const KEY = "valefromtheweb.design";
  const defaults = {
    paper: "#f7f6f2",
    ink: "#20201e",
    accent: "#a28e78",
    muted: "#85827c",
    font: "DM Sans",
    headingFont: "Cormorant Garamond",
    baseSize: 12,
    width: "classic",
    spacing: "comfortable",
    layout: "editorial"
  };

  let settings = defaults;
  try {
    settings = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch (_) {}

  const root = document.documentElement;
  root.style.setProperty("--paper", settings.paper);
  root.style.setProperty("--ink", settings.ink);
  root.style.setProperty("--accent", settings.accent);
  root.style.setProperty("--muted", settings.muted);
  root.style.setProperty("--body-font", `"${settings.font}", sans-serif`);
  root.style.setProperty("--heading-font", `"${settings.headingFont}", serif`);
  root.style.setProperty("--base-size", `${settings.baseSize}px`);

  const shell = document.querySelector(".page-shell");
  if (shell) {
    const widths = { narrow: "850px", classic: "1050px", wide: "1280px" };
    shell.style.maxWidth = widths[settings.width] || widths.classic;
    shell.style.paddingLeft = settings.width === "wide" ? "5%" : settings.width === "narrow" ? "9%" : "7.2%";
    shell.style.paddingRight = shell.style.paddingLeft;
  }

  if (settings.spacing === "compact") root.style.setProperty("--section-space", "48px");
  else if (settings.spacing === "airy") root.style.setProperty("--section-space", "112px");
  else root.style.setProperty("--section-space", "80px");

  if (settings.layout === "stacked") {
    root.classList.add("layout-stacked");
  } else {
    root.classList.remove("layout-stacked");
  }
})();