const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Test = require("./models");
const cors = require("cors");

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || `http://localhost:5173` }));

app.get("/quiz", async (req, res) => {
	const test = req.body.id
		? await Test.findOne({ id: req.body.id })
		: await Test.find();

	res.json(test);
});

app.post("/edit", async (req, res) => {
	const test = await Test.findOne({ _id: req.body.id });

	test.questions = req.body.data;
	await test.save();

	res.json(test);
});

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@result.sgeroau.mongodb.net/quiz?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(port, () => {
			console.log(`Server has been started on port: ${port}`);
		});
	});
