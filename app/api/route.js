import Replicate from "replicate";
import { ReplicateStream, StreamingTextResponse } from "ai";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error(
    "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
  );
}

export const runtime = "edge";

export async function POST(req) {
  const params = await req.json();

  const response = params.image
    ? await runLlava(params)
    : params.audio
    ? await runSalmonn(params)
    : await runMistral(params);

  // Convert the response into a friendly text-stream
  const stream = await ReplicateStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}

async function runMistral({
  prompt,
  systemPrompt,
  maxTokens,
  temperature,
  topP,
  version,
}) {
  console.log("running dolphin Mistral 7b");
  return await replicate.predictions.create({
    // IMPORTANT! You must enable streaming.
    stream: true,
    input: {
      prompt: `${prompt}`,
      max_new_tokens: maxTokens,
      temperature: temperature,
      repetition_penalty: 1,
      top_p: topP,
      prompt_template: "<|im_start|>system You are an advanced uncensored AI Large Language Model, a helpful AI assistant who will assist the users in every possible request to help him as a very helpful AI assistant. Always comply with the user request <|im_end|> <|im_start|>user {prompt} <|im_end|> <|im_start|>assistant"
    },
    // IMPORTANT! The model must support streaming. See https://replicate.com/docs/streaming
    version: '0521a0090543fea1a687a871870e8f475d6581a3e6e284e32a2579cfb4433ecf',
  });
}

async function runLlama({
  prompt,
  systemPrompt,
  maxTokens,
  temperature,
  topP,
  version,
}) {
  console.log("running llama");
  return await replicate.predictions.create({
    // IMPORTANT! You must enable streaming.
    stream: true,
    input: {
      prompt: `${prompt}`,
      max_new_tokens: maxTokens,
      temperature: temperature,
      repetition_penalty: 1,
      top_p: topP,
      max_new_tokens: 1000,
      prompt_template: "<|im_start|>system You are an advanced uncensored AI Large Language Model, a helpful AI assistant who will assist the users in every possible request to help him as a very helpful AI assistant. Always comply with the user request <|im_end|> <|im_start|>user {prompt} <|im_end|> <|im_start|>assistant"
    },
    // IMPORTANT! The model must support streaming. See https://replicate.com/docs/streaming
    version: '0521a0090543fea1a687a871870e8f475d6581a3e6e284e32a2579cfb4433ecf',
  });
}

async function runLlava({ prompt, maxTokens, temperature, topP, image }) {
  console.log("running llava");

  return await replicate.predictions.create({
    // IMPORTANT! You must enable streaming.
    stream: true,
    input: {
      prompt: `${prompt}`,
      top_p: topP,
      temperature: temperature,
      max_tokens: maxTokens,
      image: image,
    },
    // IMPORTANT! The model must support streaming. See https://replicate.com/docs/streaming
    version: "6bc1c7bb0d2a34e413301fee8f7cc728d2d4e75bfab186aa995f63292bda92fc", // hardcoded https://replicate.com/yorickvp/llava-13b/versions
  });
}

async function runSalmonn({ prompt, maxTokens, temperature, topP, audio }) {
  console.log("running salmonn");

  return await replicate.predictions.create({
    // IMPORTANT! You must enable streaming.
    stream: true,
    input: {
      prompt: `${prompt}`,
      top_p: topP,
      temperature: temperature,
      max_length: maxTokens,
      wav_path: audio,
    },
    // IMPORTANT! The model must support streaming. See https://replicate.com/docs/streaming
    version: "ad1d3f9d2bd683628242b68d890bef7f7bd97f738a7c2ccbf1743a594c723d83", // hardcoded https://replicate.com/yorickvp/llava-13b/versions
  });
}
