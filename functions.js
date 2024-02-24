import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "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"
});

function extractCodeFromMarkdown(text) {
  // Match the pattern of a Markdown code block
  const codeBlockPattern = /```[\s\S]*?```/g;
  const codeBlocks = text.match(codeBlockPattern);

  if (codeBlocks && codeBlocks.length > 0) {
    // Extract the first code block and remove the Markdown code block syntax
    let code = codeBlocks[0];
    code = code.replace(/```.*\n/g, ''); // Remove the starting ```
    code = code.replace(/```/g, ''); // Remove the ending ```
    return code.trim(); // Trim whitespace
  }
}

export const generate_code = async (prompt) => {
    const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
            {
            "role": "system",
            "content": "You are a junior programmer given a programming task. Using your knowledge, you will generate ALL code that completes that task."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    })

    return extractCodeFromMarkdown(response.choices[0].message.content);
}