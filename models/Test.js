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
  results: [
    {
      answers: [Boolean],
      testLength: Number,
      timestamp: String,
      user: String
    }
  ],
  testName: String,
  author: String,
  timestamp: String,
  email: String
});

const Test = model("test", TestSchema);

module.exports = Test;
