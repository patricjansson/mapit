# Geografi Quiz

Ett roligt och utmanande geografispel där du ska placera europeiska huvudstäder på kartan så nära deras faktiska plats som möjligt!

## 🎮 Spelet

I Geografi Quiz får du en sekund på dig att läsa namnet på en huvudstad, och sedan har du 20 sekunder på dig att placera den på kartan. Ju närmare du klickar, desto fler poäng får du!

### Speciella händelser
- Om du klickar inom 40 km från rätt plats får du en guldregn-animation!
- Om du klickar i fel land förlorar du alla poäng och spelet är slut
- Om du missar att placera staden tre gånger är spelet slut

### Poängsystem
- Poäng baseras på hur nära du klickar på den faktiska platsen
- Ju närmare, desto fler poäng!
- Klicka i rätt land för att få poäng

## 🚀 Kom igång

### Automatisk installation
1. Klona detta repository
2. Kör `./start.sh` i terminalen
3. Spelet kommer att starta automatiskt och vara tillgängligt på http://localhost:3000

### Manuell installation
1. Klona detta repository
2. Installera beroenden:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Starta backend-servern:
   ```bash
   cd backend
   npm start
   ```
4. Starta frontend-servern:
   ```bash
   cd frontend
   npm start
   ```

## 🛠️ Teknisk information

### Frontend
- React med TypeScript
- Leaflet för kartan
- CSS-animationer för speleffekter
- Responsiv design

### Backend
- Node.js med Express
- Beräknar avstånd mellan koordinater
- Hanterar städer och deras koordinater

## 🎯 Tips för att spela

1. Lär dig läsa kartan snabbt
2. Var noggrann med dina klick
3. Var extra försiktig med gränsområden mellan länder
4. Kom ihåg att du bara har 20 sekunder per stad!

## 📝 Licens

Detta projekt är öppen källkod och tillgängligt under MIT-licensen.
