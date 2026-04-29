# Webbserver delen till frontend för laboration 3.
Länk till /api/works (GET alla): https://labb3-webbserver-nosql.onrender.com/api/works

Detta repository innehåller kod för en REST API. Det har byggts med Express och MongoDB + mongoose har använts. APIet är byggt för att hantera olika arbetslivserfarenheter jag har haft (vilket inte är särskilt många). 
Grundläggande funktionalitet för CRUD är implementerad.
##  CRUD:
---

| Metod  | URI                | Beskrivning                         |
| :----- | :----------------- | :---------------------------------- |
| GET    | `/api/work`        | Hämtar alla arbetserfarenheter      |
| POST   | `/api/work`        | Lägger till ett nytt arbete         |
| PUT    | `/api/work/:id`    | Uppdaterar ett befintlig arbete     |
| DELETE | `/api/work/:id`    | Raderar ett arbete                  |

Ovan är olika sätt man kan nå APIet på. 
## JSON-dokument
---
Ett Schema har använts för hur dokumenten i MongoDBs collection får se ut. Ett dokument kan se ut på följande sätt:
```json
{
  "company": "Exempel-Affär",
  "jobtitle": "Kassör",
  "start_date": "2024-02-10",
  "end_date": "2026-01-30",
  "description": "Ett exempel på en arbetserfarenhet"
}
```
### Länk till frontend för laboration 3: https://github.com/Kiim94/Labb3-Frontend-NoSql
