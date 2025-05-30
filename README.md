# Geografi Quiz

Ett roligt och utmanande geografispel där du ska placera städer på en karta. Testa dina geografikunskaper och se hur nära du kan komma!

## 🎮 Spelet

I Geografi Quiz får du en stad att placera på kartan. Du har 5 sekunder på dig att klicka var du tror staden ligger. Ju närmare du kommer, desto fler poäng får du!

### Poängsystem
- 100 poäng för gissningar inom 1 km
- 0 poäng för gissningar över 10 000 km
- Poäng beräknas logaritmiskt mellan dessa värden
- Om du klickar i fel land förlorar du alla poäng!

### Särskilda händelser
- Klickar du inom 40 km från rätt plats får du ett guldregn! ✨
- Klickar du i fel land visas en "FEL LAND" splash screen
- Missar du tiden visas en "MISS" splash screen

## 🚀 Kom igång

### Krav
- Node.js (version 14 eller högre)
- npm (kommer med Node.js)

### Installation

1. Klona detta repository:
```bash
git clone [repository-url]
cd mapit
```

2. Kör start-skriptet:
```bash
./start.sh
```

Skriptet kommer att:
- Kontrollera att du har Node.js och npm installerat
- Installera alla nödvändiga beroenden
- Starta både backend- och frontend-servrarna

### Manuell installation

Om du föredrar att installera manuellt:

1. Installera backend-beroenden:
```bash
cd backend
npm install
```

2. Installera frontend-beroenden:
```bash
cd frontend
npm install
```

3. Starta servrarna:
```bash
# I backend-mappen
npm start

# I frontend-mappen
npm start
```

## 🛠️ Teknisk information

### Frontend
- Byggt med React och TypeScript
- Använder Leaflet för kartan
- Responsiv design som fungerar på alla skärmstorlekar

### Backend
- Node.js med Express
- Enkel REST API
- Beräknar avstånd med Haversine-formeln

## 🎯 Tips för att spela

1. Var snabb! Du har bara 5 sekunder på dig
2. Titta på kartans konturer för att identifiera länder
3. Kom ihåg att fel land = noll poäng!
4. Försök komma inom 40 km för att se guldregnet! ✨

## 📝 Licens

Detta projekt är öppen källkod och tillgängligt under MIT-licensen.
