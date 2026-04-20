import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import { searchInternet } from "./internet.service.js";
import * as z from "zod";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const searchInternetTool = tool(
  searchInternet,
  {
    name: "searchInternet",
    description: "Use this tool to get latest information from the internet",
    schema: z.object({
      query: z.string().describe("The search query to look up the internet")
    })
  }
)

const agent = createAgent({
  model: mistralModel,
  tools: [ searchInternetTool ]
})

async function withRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (err?.status === 429 && retries > 0) {
      console.log(`Retrying... (${retries})`);
      await new Promise((res) => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}


function formatMessages(messages) {
  return messages
    .map((msg) => {
      const text = msg?.content ?? msg?.context;
      if (!text) return null;
      if (msg.role === "user") return new HumanMessage(text);
      if (msg.role === "ai") return new AIMessage(text);
      return null; // ignore unknown roles
    })
    .filter(Boolean);
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function generateResponse(messages) {
  const formattedMessages = formatMessages(messages);

  const response = await withRetry(() =>
    agent.invoke({
      messages: [
        new SystemMessage(`
          You are a helpful and precise assistant for answering questions.
          If you don't know the answer, say you don't know.
          If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
        `),
        ...formattedMessages,
      ],
    })
  );

  const finalMessage = response.messages?.[response.messages.length - 1];
  return finalMessage?.text ?? "";
}

export async function generateChatTitle(message) {
  // small delay to avoid hitting rate limit when both APIs are used together
  await sleep(300);

  const response = await withRetry(() =>
    mistralModel.invoke([
      new SystemMessage(
        "Generate a short, clear chat title."
      ),
      new HumanMessage(`Message: "${message}"`),
    ])
  );

  return response.text.trim();
}
