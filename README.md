# Indian Army Organigram Generator

Dieses Projekt generiert ein **Organigramm der indischen Armee** als SVG und PNG aus einer PostgreSQL-Datenbank.

---

## **Schritt-für-Schritt-Anleitung (Linux/OSX Commandline)**

### **1. PostgreSQL-Datenbank einrichten**
Öffne ein **Terminal** und führe die Befehle wie folgt aus:

### 1.1. Mit PostgreSQL verbinden
sudo -u postgres psql
----- (Du bist jetzt in der PostgreSQL-Kommandozeile.)

### 1.2. Datenbank erstellen
CREATE DATABASE indarmydb;
----- (Erstellt die Datenbank indarmydb.)

### 1.3. PostgreSQL verlassen
\q
----- (Du bist zurück in der Bash.)

### 1.4. Schema ausführen
# Führe das mitgelieferte SQL-Schema aus:
psql -U postgres -d indarmydb -f schema.sql
----- (Lädt Tabellenstruktur und Beispieldaten in die Datenbank.)

-> Alternativ mit \c mit indarmydb verbinden und den Inhalt von schema.sql in Bash reinkopieren

### 2. Abhängigkeiten installieren
# Installiere die benötigten npm-Pakete:
npm install
----- (Installiert pg, d3, jsdom und sharp laut package.json.)

### 3. Datenbank-Zugangsdaten anpassen
# Öffne die Datei army.js in einem Editor (z. B. nano):
nano army.js
# Passe die Datenbank-Zugangsdaten an (Zeilen 8–12):
const client = new Client({
  user: "postgres",          // Standard-Benutzername
  password: "DEIN_PASSWORT", // Ersetze mit deinem Passwort
  host: "localhost",         // Standard-Host
  database: "indarmydb",     // Datenbankname (wie erstellt)
});
----- (Speichern: Strg + O → Enter → Strg + X.)

# In terminal -> export DB_PASS="DeinPasswort"

### 4. Organigramm generieren
# Führe das Skript aus:
node army.js
----- (Erzeugt output/army.svg und output/army.png.)

5. Ergebnis
Die generierten Dateien findest du im Ordner output/:

----- army.svg (Vektorgrafik)
----- army.png (Rastergrafik)
