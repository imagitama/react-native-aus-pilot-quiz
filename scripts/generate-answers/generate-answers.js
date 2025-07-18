#!/usr/bin/env node
const dotenv = require("dotenv");
const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");
const readline = require("readline");

dotenv.config();

// Validate args
if (process.argv.length < 3) {
  console.error("Usage: node interactive-answers.js <path-to-json-file>");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Need API key");
}

if (!process.argv.includes("--debug")) {
  console.debug = () => {};
}

const filePath = path.resolve(process.argv[2]);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) =>
    rl.question(question, (ans) => resolve(ans.trim()))
  );
}

// Load JSON
const raw = fs.readFileSync(filePath, "utf-8");
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error("Invalid JSON file.");
  process.exit(1);
}

/**
 * Recursively processes nodes.
 */
async function processNode(node) {
  if (node.questions) {
    for (const q of node.questions) {
      await handleQuestion(q);
    }
  }

  if (node.children) {
    for (const child of node.children) {
      await processNode(child);
    }
  }
}

/**
 * Handles a single question.
 */
async function handleQuestion(q) {
  console.log(`\nQuestion: ${q.question}`);

  const correctAnswer = q.answers && q.answers.length ? q.answers[0] : null;

  console.log(`Correct answer: ${correctAnswer.answer}`);

  let newAnswers = await generateAnswers(q.question, correctAnswer);
  let confirmed = false;

  while (!confirmed) {
    console.log("\nProposed answers:");

    if (correctAnswer) {
      console.log(`1. ${correctAnswer.answer} (existing correct answer)`);
    }

    newAnswers.forEach((a, i) =>
      console.log(`${i + 1 + (correctAnswer ? 1 : 0)}. ${a.answer}`)
    );

    const ans = await ask("Is this correct? (y/n) ");
    if (ans.toLowerCase() === "y") {
      const answersToSave = []
        .concat(correctAnswer ? [correctAnswer] : [])
        .concat(newAnswers);

      q.answers = answersToSave;
      confirmed = true;
    } else {
      const regen = await ask("Regenerate answers? (y/n) ");
      if (regen.toLowerCase() === "y") {
        newAnswers = await generateAnswers(q.question, correctAnswer);
      } else {
        console.log("Skipping this question");
        confirmed = true; // Exit loop but don't set answers
      }
    }
  }
}

/**
 * Calls ChatGPT to generate answers.
 */
async function generateAnswers(question, correctAnswer = nulll) {
  const prompt = `
You are an Australian aviation expert. For the question below, generate ${correctAnswer ? "" : "1 correct answer (first) and "}3 plausible but incorrect answers.
${correctAnswer ? `The correct answer is already known as "${correctAnswer.answer}". Provide 3 more.` : ""}
Be short and succinct as it is quiz format. Use proper punctuation (such as ending in a dot) and Australian spelling.
Only return JSON array with objects like: [{ "answer": "..." }, ...].
Do not include any explanations. Do not wrap in Markdown backticks.

Question: "${question}"
  `;

  console.debug("Generating...");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  console.debug(`Got response`);

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error(
      "Failed to parse AI response:",
      response.choices[0].message.content
    );
    return [];
  }
}

// Main
(async () => {
  await processNode(data);
  rl.close();

  const newFilePath = path.resolve(__dirname, "output.json");

  fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
  console.log(`\nUpdated JSON saved to ${newFilePath}`);
})();
