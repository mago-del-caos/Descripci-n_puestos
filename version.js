// ==========================================
// CONTROL DE VERSIONES DEL SISTEMA
// ==========================================
// Cambia este número cada vez que modifiques app.js o styles.css
const VERSION = "1.0.0"; 

// 1. Inyectar CSS dinámicamente con la versión actual
const cssLink = document.createElement("link");
cssLink.rel = "stylesheet";
cssLink.href = `styles.css?v=${VERSION}`;
document.head.appendChild(cssLink);

// 2. Inyectar JS dinámicamente con la versión actual
const jsScript = document.createElement("script");
jsScript.src = `app.js?v=${VERSION}`;
jsScript.defer = true; // Asegura que el HTML cargue antes de ejecutar la lógica
document.head.appendChild(jsScript);

console.log(`Sistema Juventud Inicializado - Versión: ${VERSION}`);
