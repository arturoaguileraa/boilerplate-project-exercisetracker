const express = require("express");
const mongoose = require("mongoose");
const { User, Exercise } = require("./collections");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use("/", express.json());
app.use("/", express.urlencoded());

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
    const { username } = req.body;
    const newuser = new User({ username });
    await newuser.save();
    return res.json({
        username: newuser.username,
        _id: newuser._id,
    });
});

app.get("/api/users", async (req, res) => {
    const users = await User.find();
    return res.send(users);
});

app.post("/api/users/:id/exercises", async (req, res) => {
    const { _id, description, duration, date } = req.body;
    try {
        const currentuser = await User.findById(req.params.id);
        if (currentuser) {
            let exerData = {
                userID: req.params.id,
                description,
                duration,
            };
            try {
                const newdate = new Date(date);
                if (newdate.getTime()) {
                    exerData.date = newdate;
                }
            } catch (error) {
                return res.send(error);
            }
            let newexer = new Exercise(exerData);
            newexer = await newexer.save();
            const userUpdated = await User.updateOne(
                { _id: currentuser._id },
                {
                    $set: {
                        log: [
                            {
                                description: newexer.description,
                                duration: newexer.duration,
                                date: newexer.date.toDateString(),
                            },
                            ...currentuser.log,
                        ],
                        count: currentuser.count + 1,
                    },
                }
            );

            return res.json({
                _id: newexer.userID,
                username: currentuser.username,
                date: newexer.date.toDateString(),
                duration: newexer.duration,
                description: newexer.description,
            });
        }
        return res.send("Error: user Not Found");
    } catch (err) {
        return res.send(err.message);
    }
});

app.get("/api/users/:id/logs", async (req, res) => {
    const { from, to, limit } = req.query;
    const limitNumber = parseInt(limit);
    console.log(from, to, limitNumber);

    const userID = req.params.id;
    let currentUser = await User.findById(userID);

    if (from) {
        const fromDate = new Date(from);
        currentUser.log = currentUser.log.filter((elem) => elem.date >= from);
    }

    if (to) {
        const toDate = new Date(to);
        currentUser.log = currentUser.log.filter(
            (elem) => (elem) => elem.date <= to
        );
    }

    if (limit) {
        currentUser.log = currentUser.log.slice(0, limit);
    }

    return res.json({
        id: currentUser.id,
        username: currentUser.username,
        count: currentUser.count,
        log: currentUser.log,
    });
});

//Conectamos base de datos
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//Inicializamos servidor
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

// Para conectarme a dos bases de datos debo crear mongoose y mongoose2 y conectar cada uno a distintas uris?
