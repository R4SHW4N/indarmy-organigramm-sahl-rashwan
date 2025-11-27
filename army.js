// Importiere benötigte Bibliotheken
import { Client } from "pg";          // PostgreSQL-Client für Datenbankzugriff
import * as d3 from "d3";              // D3.js für Datenvisualisierung
import { JSDOM } from "jsdom";         // Simuliert einen DOM für SVG-Erstellung
import { writeFileSync, mkdirSync, existsSync } from "fs"; // Dateisystem-Operationen
import sharp from "sharp";            // Bildverarbeitung (SVG → PNG)

// --- Datenbankverbindung herstellen ---
const client = new Client({
  user: "postgres",                   // Datenbank-Benutzername
  password: "Jasa.7",                 // Passwort 
  host: "localhost",                  // Host-Adresse
  database: "indarmydb",              // Datenbankname
});
await client.connect();               // Verbindung zur Datenbank aufbauen

// --- Daten aus der Datenbank abfragen ---
const { rows } = await client.query("SELECT id, name, boss_id FROM indiarmy");
await client.end();                    // Verbindung schließen

// --- Baumstruktur vorbereiten ---
// Wurzelknoten des Baums (oberste Ebene)
const data = {
  id: "root",
  name: "Indian Army",                // Name des Wurzelknotens
  children: [],                       // Kinderknoten (werden später gefüllt)
};
const nodeMap = {};                    // Map für schnellen Zugriff auf Knoten

// --- Knoten aus Datenbankzeilen erstellen ---
// Jede Zeile aus der Datenbank wird zu einem Knoten im Baum
rows.forEach((row) => {
  nodeMap[row.id] = {                  // Speichere jeden Knoten in nodeMap
    id: row.id,                        // Knoten-ID
    name: row.name,                    // Knoten-Name
    children: [],                      // Leere Liste für Unterknoten
  };
});

// --- Hierarchie aufbauen ---
// Jeder Knoten wird seinem Vorgesetzten zugeordnet
rows.forEach((row) => {
  if (row.boss_id === null) {
    // Falls kein Vorgesetzter: direkt unter "Indian Army" einfügen
    data.children.push(nodeMap[row.id]);
  } else {
    // Sonst: als Kind des Vorgesetzten einfügen
    nodeMap[row.boss_id].children.push(nodeMap[row.id]);
  }
});

// --- D3-Hierarchie erstellen ---
// Wandelt die verschachtelten Daten in ein D3-Hierarchie-Objekt um
const root = d3.hierarchy(data);
// Baum-Layout mit festen Knotenabständen (Breite x Höhe)
const treeLayout = d3.tree().nodeSize([300, 150]);
// Berechnet die Positionen aller Knoten im Baum
treeLayout(root);

// --- Baumgröße berechnen (für Zentrierung) ---
// Maximale X-Position = Breite des Baums
const treeWidth = root.descendants().reduce((maxX, node) => Math.max(maxX, node.x), 0);
// Maximale Y-Position = Höhe des Baums
const treeHeight = root.descendants().reduce((maxY, node) => Math.max(maxY, node.y), 0);

// --- SVG vorbereiten ---
// SVG-Größe (fest: 7000x1000, um Abschneiden zu vermeiden)
const width = 12000,
      height = 1000;
// Erstelle ein SVG-Dokument mit JSDOM
const dom = new JSDOM(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:white"></svg>`
);
// Wähle das SVG-Element aus
const svg = d3.select(dom.window.document.querySelector("svg"));
// Gruppe (<g>) für den Baum, zentriert durch Translation
const g = svg.append("g").attr("transform", `translate(${width / 2 - treeWidth / 2}, 50)`);

// --- Verbindungen (Linien) zwischen Knoten zeichnen ---
g.selectAll("path")                    // Wähle alle Pfade aus (werden erstellt)
  .data(root.links())                  // Daten: Verbindungen zwischen Knoten
  .enter()                             // Für jeden Datensatz einen Pfad erstellen
  .append("path")                      // Füge ein <path>-Element hinzu
  .attr("d", d3.linkVertical()         // Zeichne vertikale Verbindungen
    .x((d) => d.x)                     // X-Position der Verbindung
    .y((d) => d.y)                     // Y-Position der Verbindung
  )
  .attr("fill", "none")                // Keine Füllung
  .attr("stroke", "#444")              // Linienfarbe: dunkelgrau
  .attr("stroke-width", 1.5);          // Liniendicke

// --- Knoten (Rechtecke + Texte) zeichnen ---
// Gruppe (<g>) für jeden Knoten
const node = g.selectAll("g.node")
  .data(root.descendants())            // Daten: alle Knoten im Baum
  .enter()                             // Für jeden Knoten eine Gruppe erstellen
  .append("g")                         // Füge eine <g>-Gruppe hinzu
  .attr("transform", (d) => `translate(${d.x - 80},${d.y - 30})`); // Positioniere die Gruppe

// --- Rechteck für jeden Knoten ---
node.append("rect")                     // Füge ein Rechteck hinzu
  .attr("width", 250)                  // Breite des Rechtecks
  .attr("height", 60)                  // Höhe des Rechtecks
  .attr("rx", 10)                      // Abgerundete Ecken
  .attr("fill", "#e3f2fd")             // Hintergrundfarbe: hellblau
  .attr("stroke", "#1976d2");          // Rahmenfarbe: dunkelblau

// --- Text für jeden Knoten ---
node.append("text")                     // Füge einen Text hinzu
  .attr("x", 125)                      // X-Position (zentriert im Rechteck)
  .attr("y", 35)                       // Y-Position (vertikal zentriert)
  .attr("text-anchor", "middle")       // Textausrichtung: zentriert
  .attr("font-family", "Arial")        // Schriftart
  .attr("font-size", 16)               // Schriftgröße
  .text((d) => d.data.name);           // Textinhalt: Knotenname

// --- Ausgabeordner erstellen (falls nicht vorhanden) ---
if (!existsSync("output")) mkdirSync("output");

// --- SVG als Datei speichern ---
const svgData = svg.node().outerHTML;   // SVG-Inhalt als HTML-String
writeFileSync("output/army.svg", svgData); // Speichere als army.svg

// --- SVG in PNG konvertieren ---
await sharp(Buffer.from(svgData))       // Lade SVG-Daten
  .png()                               // Konvertiere zu PNG
  .toFile("output/army.png");          // Speichere als army.png

// --- Erfolgsmeldung ---
console.log("✅ Organigramm erstellt: output/army.svg & output/army.png");
