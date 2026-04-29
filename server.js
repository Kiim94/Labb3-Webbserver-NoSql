//Återanvänt koden nedan från tidigare laboration.

//importera de bibliotek som behövs

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

//skapa server
const app = express();
const PORT = process.env.PORT || 3000;

//använd cors. Sätt origin till startsidan av webbapplikation eller localhost:5173 utifall att
//för att det ska fungera för äldre webbläsare: optionsSuccessStatus: 200. 
//Finns tydligen bugg som kanske inte hanterar 204 korrekt
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    optionsSuccessStatus: 200
}));
//express.json() för att kunna köra CRUD
app.use(express.json())

//schema för data. Specificera typ och om det är obligatoriskt att ha med
//Dokumenten ska ha detta utseende/uppbyggnad
const workSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
    },
    jobtitle: {
        type: String,
        required: true,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: Date,
    description: String
},
    { timestamps: true });

//koppling workSchema till MongoDB. Gör det möjligt att använda find, create med flera
//modell kopplas automatiskt till collection Works
//se mongoDB dokumentation: const Tank = mongoose.model("Tank", schema);
const Work = mongoose.model("Work", workSchema);

//det gjorde mig paranoid att se "cannot GET" när jag startade server. Så la till detta nedan
app.get("/", (req, res) => {
    res.send("API server fungerar!");
});

app.get("/api/works", async (req, res) => {
    try {
        //"hitta" hela resultatet, sortera efter start_date. -1 betyder minsta först, alltså DESC
        const result = await Work.find().sort({ start_date: -1 });
        //visa hela resultatet = allt som finns
        res.json(result);
    } catch (err) {
        //skicka server fel om något inte fungerar
        res.status(500).json({ error: err.message });
    }
});

//app.get ovan är bara för ALLA. Behöver en route som är för enstaka id
app.get("/api/works/:id", async (req, res) => {
    try{
        const result = await workSchema.findById(req.params.id);
        if(!result){
            return res.status(404).json({ message: "Jobbet hittades inte"});
        }
        res.json(result);
    }catch(err){
        res.status(500).json({ message: "Serverfel: " + err.message})
    }
})

//routes
app.post("/api/works", async (req, res) => {
    try {
        //variabler för vilken data som ska "vara med". Testat annan slags variabel för att hämta dem
        const { company, jobtitle, start_date, end_date, description } = req.body

        //validering för vad som måste komma med. Tagit med start_datum denna gång: annars svårt att sortera efter start_datum
        if (!company || !jobtitle || !start_date) {
            //skicka status 400 och error meddelande om problemet
            return res.status(400).json({
                error: "company, jobtitle och start_date krävs"
            });
        }

        //skapa nytt dokument i collection Work, om validering är ok
        const result = await Work.create({
            company,
            jobtitle,
            start_date,
            end_date,
            description
        });
        //returnera "Created" status och resultatet. MongoDB har ingar rows, så result räcker
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})



app.put("/api/works/:id", async (req, res) => {
    try {
        //samma variabler som i post
        const { company, jobtitle, start_date, end_date, description } = req.body;

        //company, jobtitle och start_date kan inte stå tomma.
        if (!company || !jobtitle || !start_date) {
            return res.status(400).json({
                error: "company, jobtitle och start_date krävs"
            });
        }

        //ganska tydlig mongoose-kommando. Hitta och uppdatera document som innehåller id
        const result = await Work.findByIdAndUpdate(
            req.params.id,
            { company, jobtitle, start_date, end_date, description },
            { new: true }
        );
        //om ingen rad uppdateras så finns inte id
        if (!result) {
            //skicka status "kunde inte hitta"
            res.status(404).json({ error: "Kunde inte hittas. Finns id?" });
            return;
        }
        //om det verkar ok, skicka den uppdaterade datan för raden
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.delete("/api/works/:id", async (req, res) => {
    try {
        const result = await Work.findByIdAndDelete(req.params.id);
        if (!result) {
            res.status(404).json({ error: "Det gick inte att radera. Kontrollera om id stämmer" })
            return;
        }
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//starta server-function. En async, try, catch utifall att något skulle gå fel när den ska "lyssna"
async function startServer() {
    try {
        //vänta på att ansluta
        if(!MONGO_URI){
            console.error("MONGO_URI saknas i .env: applikationen avslutas")
            //istället för att låta appen fortsätta köras utan fungerande databas,
            //avsluta process så det går att starta om tjänst
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log("Uppkopplad till MongoDB");

        //lyssna på port
        app.listen(PORT, () => {
            console.log("API fungerar på port: " + PORT);
        })

    } catch (err) {
        //felhantering vid start.
        //Ingen res.status pga att det inte är en http-request utan sker direkt när servern startas
        console.error("Kunde inte ansluta till MongoDB:", err);
        process.exit(1);
    }
}

startServer();