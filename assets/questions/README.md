# Adding new questions

The minimum structure of your JSON must be:

```json
{
  "levels": [
    {
      "name": "My cool level",
      "areas": [
        {
          "name": "My cool area",
          "questions": [
            {
              "question": "What is cool about this question?",
              "answers": [
                {
                  "answer": "It is cool!"
                },
                {
                  "answer": "It is not cool"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Answers

An answer must at minimum have an answer text. If you don't specify a "correct" answer, the first one in the list will be the correct one.

| Property    | Type       | Usage                                                                     |
| ----------- | ---------- | ------------------------------------------------------------------------- |
| `answer`    | text       | The answer text.                                                          |
| `correct`   | true/false | If this answer is the correct one.                                        |
| `rationale` | text/URL   | After answering this text is shown to the user to explain why.            |
| `reference` | text/URL   | After answering this text is shown to explain where the answer came from. |

To show a clickable link provide an object like this:

```ts
{
    "url": "https://www.somecoolreference.com"
}
```

Example:

```ts
{
    "answer": "It is cool",
    "reference": {
        "url": "https://www.somecoolreference.com"
    }
}
```
