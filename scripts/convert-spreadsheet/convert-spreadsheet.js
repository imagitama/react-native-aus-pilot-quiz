#!/usr/bin/env node
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const XLSX = require("xlsx");
const OpenAI = require("openai");

dotenv.config();

// Validate args
if (process.argv.length < 3) {
  console.error("Usage: node convert-spreadsheet.js <path-to-xlsx-file>");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in .env");
}

if (!process.argv.includes("--debug")) {
  console.debug = () => {};
}

const filePath = path.resolve(process.argv[2]);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const outputFilePath = path.resolve(__dirname, "output.json");

// Load or create output.json
let data = { children: [] };
if (fs.existsSync(outputFilePath)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(outputFilePath, "utf-8"));
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.children)
    ) {
      data = parsed;
    } else {
      console.warn("Invalid structure in output.json. Resetting to empty.");
      data = { children: [] };
    }
  } catch {
    console.warn("Could not parse output.json, starting fresh.");
    data = { children: [] };
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) =>
    rl.question(question, (ans) => resolve(ans.trim()))
  );
}

/**
 * Helpers to build hierarchy
 */
function getOrCreateLevel(data, name) {
  let level = data.children.find((l) => l.name === name);
  if (!level) {
    level = { name, children: [] };
    data.children.push(level);
  }
  return level;
}

function getOrCreateArea(level, name) {
  let area = level.children.find((a) => a.name === name);
  if (!area) {
    area = { name, children: [] };
    level.children.push(area);
  }
  return area;
}

function getOrCreateSection(area, name) {
  let section = area.children.find((s) => s.name === name);
  if (!section) {
    section = { name, questions: [] };
    area.children.push(section);
  }
  return section;
}

/**
 * Save current data to output.json
 */
function saveProgress() {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
  console.log(`Progress saved to ${outputFilePath}`);
}

/**
 * Find an existing question
 */
function findSavedQuestion(levelName, areaName, sectionName, questionText) {
  const level = data.children.find((l) => l.name === levelName);
  if (!level) return null;
  const area = level.children.find((a) => a.name === areaName);
  if (!area) return null;
  const section = area.children.find((s) => s.name === sectionName);
  if (!section) return null;
  return section.questions.find((q) => q.question === questionText);
}

/**
 * Generate answers using OpenAI
 */
async function generateAnswers(
  question,
  correctAnswer = null,
  extraInstruction = ""
) {
  const prompt = `
You are an Australian aviation expert.
${extraInstruction ? `Additional guidance: ${extraInstruction}` : ""}
For the question below, generate ${correctAnswer ? "" : "1 correct answer (first) and "}3 plausible but incorrect answers.
${correctAnswer ? `The correct answer is already known as "${correctAnswer}". Provide 3 more.` : ""}
Be short and succinct as it is quiz format. Use proper punctuation (such as ending in a dot) and Australian spelling.
Only return JSON array with objects like: [{ "answer": "..." }, ...].
Do not include any explanations. Do not wrap in Markdown backticks.

Question: "${question}"
  `;

  console.debug("Generating AI answers...");
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  console.debug("Got response");

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

/**
 * Process a single question interactively.
 */
async function handleQuestion(levelName, areaName, sectionName, q) {
  console.log(`\nQuestion: ${q.question}`);
  console.log(`Source: ${q.source || "(none)"}`);

  let correctAnswer = q.answers?.length ? q.answers[0] : null;

  // Generate missing answers
  if (!q.answers || q.answers.length < 4) {
    const generated = await generateAnswers(
      q.question,
      correctAnswer ? correctAnswer.answer : null
    );

    if (correctAnswer) {
      q.answers = [
        correctAnswer,
        ...generated.slice(0, 3).map((a) => ({ answer: a.answer })),
      ];
    } else {
      q.answers = generated.map((a) => ({ answer: a.answer }));
    }
  }

  let confirmed = false;
  while (!confirmed) {
    console.log("\nProposed answers:");
    q.answers.forEach((a, i) =>
      console.log(
        `${i + 1}. ${a.answer}${i === 0 ? " (correct)" : ""}${
          a.reference ? ` [Reference: ${a.reference}]` : ""
        }`
      )
    );

    const ans = await ask(
      "Press Enter to accept, 'n' to skip, or type instructions: "
    );
    if (ans === "" || ans.toLowerCase() === "y") {
      confirmed = true;
    } else if (ans.toLowerCase() === "n") {
      console.log("Skipping this question...");
      q.answers = null;
      confirmed = true;
    } else {
      console.log(`Regenerating with instruction: "${ans}"`);
      const regenerated = await generateAnswers(
        q.question,
        correctAnswer ? correctAnswer.answer : null,
        ans
      );
      if (correctAnswer) {
        q.answers = [
          correctAnswer,
          ...regenerated.slice(0, 3).map((a) => ({ answer: a.answer })),
        ];
      } else {
        q.answers = regenerated.map((a) => ({ answer: a.answer }));
      }
    }
  }

  // Save in hierarchy
  const level = getOrCreateLevel(data, levelName);
  const area = getOrCreateArea(level, areaName);
  const section = getOrCreateSection(area, sectionName);

  const existingIndex = section.questions.findIndex(
    (x) => x.question === q.question
  );
  if (existingIndex >= 0) {
    section.questions[existingIndex] = q;
  } else {
    section.questions.push(q);
  }
  saveProgress();
}

/**
 * Parse spreadsheet and build hierarchy
 */
function parseSpreadsheet(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  let lastLevel = "";
  let lastArea = "";
  let lastSection = "";
  let lastUnit = "";

  const parsedQuestions = [];

  for (const row of rows) {
    if (row.level) lastLevel = row.level;
    if (row.area) lastArea = row.area;
    if (row["MoS section"]) lastSection = row["MoS section"];
    if (row["MoS unit num"]) lastUnit = row["MoS unit num"];

    parsedQuestions.push({
      level: lastLevel,
      area: lastArea,
      section: lastSection,
      question: {
        question: row.question,
        source: `${lastUnit}${row.letter ? " " + row.letter : ""}`,
        answers: [
          ...(row.correct
            ? [
                {
                  answer: row.correct,
                  reference: row["red book num"]
                    ? `Red Book: ${row["red book num"]}`
                    : "",
                },
              ]
            : []),
          ...[row.incorrect1, row.incorrect2, row.incorrect3]
            .filter(Boolean)
            .map((ans) => ({ answer: ans })),
        ],
      },
    });
  }

  return parsedQuestions;
}

/**
 * Main
 */
(async () => {
  const questions = parseSpreadsheet(filePath);

  for (const { level, area, section, question } of questions) {
    const existing = findSavedQuestion(level, area, section, question.question);
    if (existing) {
      console.log(
        `\nSkipping already processed question: "${question.question}"`
      );
      continue;
    }

    await handleQuestion(level, area, section, question);
  }

  rl.close();
  saveProgress();
})();
