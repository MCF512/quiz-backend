const { Schema, model } = require("mongoose");

const TestSchema = new Schema({
	questions: [
		{
			question: String,
			answers: [
				{
					text: String,
					correct: Boolean,
				},
			],
		},
	],
});

const Test = model("test", TestSchema);

module.exports = Test;
