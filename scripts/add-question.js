const fs = require("fs/promises");
const { default: inquirer } = require("inquirer");
const path = require("path");

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove non-alphanumeric except spaces
    .trim()
    .replace(/\s+/g, "-"); // replace spaces with dashes
}

(async () => {
  try {
    console.log("Starting up!");

    const pathToJson = path.resolve(__dirname, "../questions/questions.json");
    const json = await fs.readFile(pathToJson, "utf8");
    const data = JSON.parse(json);

    const answers = await inquirer.prompt([
      {
        name: "level",
        message: "What is the study level?",
        type: "list",
        choices: ["rpl", "ppl", "cpl"],
        required: true,
      },
      {
        name: "area",
        message: "What is the area of the question?",
        type: "list",
        choices: [
          "aircraft",
          "comms",
          "terms",
          "agk",
          "law",
          "theory",
          "atmosphere",
          "human",
          "meteor",
          "loading",
          "perf",
          "nav",
          "navaids",
        ],
        required: true,
      },
      {
        name: "question",
        message: "What is the question text? End with a ? symbol",
        type: "string",
        message: "eg. What is air?",
      },
      {
        name: "imageName",
        type: "string",
        message:
          'The filename of the image inside /images folder (minus extension) eg. "my-image"',
        required: false,
        default: null,
      },
      {
        name: "correctAnswer",
        message: "The correct answer (always listed first in JSON)",
        type: "string",
        message: "The correct answer",
      },
      {
        name: "incorrectAnswer1",
        type: "string",
        message: "Incorrect answer 1 of 3",
      },
      {
        name: "incorrectAnswer2",
        type: "string",
        message: "Incorrect answer 2 of 3",
      },
      {
        name: "incorrectAnswer3",
        type: "string",
        message: "Incorrect answer 3 of 3",
      },
    ]);

    console.debug(`Level ${answers.level}
Area ${answers.area}
Question "${answers.question}"
Image ${answers.imageName}
Correct Answer "${answers.correctAnswer}"
Incorrect Answer 1 "${answers.incorrectAnswer1}"
Incorrect Answer 2 "${answers.incorrectAnswer2}"
Incorrect Answer 3 "${answers.incorrectAnswer3}"`);

    const levelItem = data.levels.find((level) => level.id === answers.level);

    console.debug(`Found level: ${levelItem.id} ${levelItem.name}`);

    const areaItem = levelItem.areas.find((area) => area.id === answers.area);

    console.debug(`Found area: ${areaItem.id} ${areaItem.name}`);

    const questions = areaItem.questions;

    console.debug(`Found ${questions.length} questions in area`);

    const existingQuestion = questions.find(
      (question) => question.question === answers.question
    );

    if (existingQuestion) {
      throw new Error(`Question already exists`);
    }

    const newQuestions = [
      ...questions,
      {
        id: slugify(answers.question),
        question: answers.question,
        imageName: answers.imageName,
        answers: [
          {
            answer: answers.correctAnswer,
          },
          {
            answer: answers.incorrectAnswer1,
          },
          {
            answer: answers.incorrectAnswer2,
          },
          {
            answer: answers.incorrectAnswer3,
          },
        ],
      },
    ];

    const newAreaItem = {
      ...areaItem,
      questions: newQuestions,
    };

    const newAreas = levelItem.areas.map((area) =>
      area.id === areaItem.id ? newAreaItem : area
    );

    const newLevelItem = {
      ...levelItem,
      areas: newAreas,
    };

    const newLevels = data.levels.map((level) =>
      level.id === levelItem.id ? newLevelItem : level
    );

    const { areYouSure } = await inquirer.prompt([
      {
        name: "areYouSure",
        type: "confirm",
        message: "Are you sure you want to override?",
      },
    ]);

    const newJson = JSON.stringify(
      {
        levels: newLevels,
      },
      null,
      "  "
    );

    if (areYouSure) {
      const pathToJsonBackup = pathToJson.replace(".json", ".json.backup");

      console.debug(`Backup ${pathToJson} => ${pathToJsonBackup}`);

      await fs.copyFile(pathToJson, pathToJsonBackup);

      console.debug(`Write ${pathToJson}`);

      await fs.writeFile(pathToJson, newJson);
    }

    console.log("Done!");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
