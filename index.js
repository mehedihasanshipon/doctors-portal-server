const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const fileUpload = require("express-fileupload");
// const fs = require("fs");
const fse = require("fs-extra");
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// console.log(process.env.DB_NAME);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzoti.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Hello from Database!");
});

// Database

client.connect((err) => {
  const appointmentCollection = client
    .db("doctorsPortal")
    .collection("appointment");

  const doctorCollection = client.db("doctorsPortal").collection("doctors");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection
      .insertOne(appointment)
      .then((result) => {
        res.send(result.insertedCount > 0);
        console.log("Data inserted successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/appointments", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    console.log(date);

    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      // console.log(err);
      const filter = { date: date.date };
      if (doctors.length === 0) {
        filter.email = email;
      }
      appointmentCollection.find(filter).toArray((err, documents) => {
        // console.log(err);
        res.send(documents);
      });
    });
  });

  //   Is doctor
  app.post("/isDoctor", (req, res) => {
    const email = req.body.email;
    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });

  app.get("/allAppointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Add doctor
  app.post("/addDoctor", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    console.log(file);

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    doctorCollection.insertOne({ name, email, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });

    // const filePath = `${__dirname}/doctor/${file.name}`;

    // file.mv(filePath, (err) => {
    //   if (err) {
    //     console.log(err);
    //     res.status(500).send({ msg: "Failed to upload image" });
    //   }

    //   const newImage = fse.readFileSync(filePath);
    //   const encImg = newImage.toString("base64");

    //   const image = {
    //     contentType: req.files.file.mimetype,
    //     size: req.files.file.size,

    //     img: Buffer.from(encImg, "base64"),
    //   };

    //   doctorCollection.insertOne({ name, email, image }).then((result) => {
    //     fse.remove(filePath, (error) => {
    //       if (error) console.log(error);
    //       res.send(result.insertedCount > 0);
    //     });
    //   });
    // });
  });

  app.get("/doctors", (rew, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  console.log("Database connected successfully");
  console.log("error", err);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
