# 💳 Landing Page Broker Associati
### Mastercard Gold Version 2.0

Pagina di presentazione nuova versione della landing page per la **Card Gold**. Lo stile adottato è innovativo ed immersivo, semplice e dinamico, stile apple e startup.

---

## 🚀 Tech Stack
Il progetto sfrutta le tecnologie front-end più moderne per garantire animazioni fluide e una resa visiva premium:

* **HTML5 & CSS3**: Struttura semantica e styling modulare.
* **JavaScript (ES6+)**: Logica di interazione e gestione dati.
* **Three.js**: Per l'integrazione di elementi 3D e componenti visuali avanzate.
* **GSAP**: Motore principale per le animazioni ad alte prestazioni.

---

## 🏗️ Struttura del Progetto
Il codice è organizzato per essere estremamente leggibile e manutenibile. Sia l'HTML che il CSS seguono una logica a **blocchi indipendenti**.

### Sezioni principali:
* `nav`: Nav contenente il menu.
* `header`: presentazione ed introduzione.
* `section.about`: Vantaggi esclusivi e funzionalità.
* `canvas(3D)`: Canvas che contiene l'asset 3d per la carta.
* `section.vantages`: Sezione per sottolineare il design.
* `section.security`: Sezione per sottolineare la sicurezza.
* `section.requise`: Mostra i requisiti minimi per accedere al servizio.
* `section.partners`: Slider del gruppo.
* `section.info`: Sezione per indirizzare il cliente (ultima CTA diretta).
* `section.contact`: Contiene form per contatti diretti senza mailto.
* `footer`: footer.

### Navigazione del Codice:
Per facilitare lo sviluppo e la manutenzione, il CSS rispecchia esattamente la gerarchia dell'HTML. Ogni componente è isolato logicamente:

> **Developer Tip:** Per ricercare o modificare una sezione specifica nel CSS, ti basta cercare il selettore di classe dedicato:  
> `.nome_sezione { ... }`

---

## 📂 File Architecture
L'organizzazione delle cartelle segue uno standard modulare per separare asset, logica e stile:

```text
.
├── Assets/
│   ├── 3DObject/  # Modelli e mesh per Three.js
│   ├── Icon/      # Icone per i social
│   └── Logos/     # Loghi ufficiali e branding
├── Js/            # Script 
├── Style/         # Fogli di stile CSS
└── index.html     # index progetto



*Progetto sviluppato con focus su efficienza, scalabilità e design d'impatto.*
Non sono state usate librerie pesanti (a parte gsap)
Tutto (Librerie e framework) è incluso tramite CDN per facilitare la modifica degli import, e per mantenere il progetto leggero. 
