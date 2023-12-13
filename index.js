const express = require("express");
const dotenv = require('dotenv')
// const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Test, User } = require("./models");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || `http://localhost:5173` }));

app.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new Error("Не все поля заполнены");
		}
		const user = await User.findOne({ email });

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isPasswordCorrect) {
			throw new Error("Неверный пароль");
		}

		const token = jwt.sign({ email }, process.env.JWT_SECRET, {
			expiresIn: "30d",
		});
		res.json({
			email: user.email,
			name: user.name,
			surname: user.surname,
			accessToken: token,
		});
	} catch (e) {
		res.status(302).json(e.message);
	}
});

app.post("/register", async (req, res) => {
	try {
		const { email, password, name, surname } = req.body;

		if (!email || !password || !name || !surname) {
			throw new Error("Не все поля заполнены");
		}

		const user = await User.findOne({ email });

		if (user) {
			throw new Error("Пользователь с таким email уже зарегистрирован");
		} else {
			const passwordHash = await bcrypt.hash(password, 10);

			const user = await User.create({
				email,
				password: passwordHash,
				name,
				surname,
			});
			res.json(user);
		}
	} catch (e) {
		res.status(302).json(e.message);
	}
});

app.post("/user", async (req, res) => {
	const { accessToken } = req.body;

	try {
		jwt.verify(accessToken, process.env.JWT_SECRET, async (error, user) => {
			if (error) {
				throw new Error("Ошибка аутентификации");
			}

			const account = await User.findOne({ email: user.email });

			res.json({
				email: account.email,
				name: account.name,
				surname: account.surname,
			});
		});
	} catch (e) {
		res.status(302).json(e.message);
	}
});

app.post("/user/edit", async (req, res) => {
	const { accessToken, email, name, surname } = req.body;
	try {
		jwt.verify(accessToken, process.env.JWT_SECRET, async (error, user) => {
			if (error) {
				throw new Error("При изменении данных произошла ошибка");
			}

			const account = await User.findOneAndUpdate(
				{ email: user.email },
				{ email, name, surname }
			);
			await account.save();
			res.json(user)
		});
	} catch (e) {
		res.status(302).json(e.message);
	}
});

app.post("/quiz", async (req, res) => {
	try {
		const test = await Test.findOne({ _id: req.body.id })

		if (test) {
			res.json(test)
		} else {
			throw new Error("Тест не найден")
		}
	} catch (e) {
		res.status(302).json(e.message);
	}
});

app.post("/edit", async (req, res) => {
	const test = await Test.findOne({ _id: req.body.id });

	test.questions = req.body.data;
	await test.save();

	res.json(test);
});

app.post("/test/create", async (req, res) => {
	const test = await Test.create(req.body)
	res.json(test)
});

app.post("/test/delete", async (req, res) => {
	try {
		await Test.findOneAndDelete({ _id: req.body.id })
		res.json('deleted')
	} catch (e) {
		res.status(302).json(e.message)
	}
});

app.post("/test/result", async (req, res) => {
	try {
		const test = await Test.findOne({ _id: req.body.id })
		console.log(test)
		test.results.push({
			answers: req.body.answers,
			testLength: req.body.testLength,
			timestamp: req.body.timestamp,
			user: req.body.user
		})

		await test.save()

		res.json(test)
	} catch (e) {
		res.status(302).json(e.message)
	}
});

app.get('/tests/get', async (req, res) => {
	const tests = await Test.find()
	res.json(tests)
})

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@result.sgeroau.mongodb.net/quiz?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(port, () => {
			console.log(`Server has been started on port: ${port}`);
		});
	});
