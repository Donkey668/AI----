import type {
  ChatCompletionCreateParamsStreaming,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat/completions/completions";
import { BIRD_IDENTIFY_MODEL_NAME } from "../../../../../packages/shared/src/identify/identify-contract";
import { getDashScopeClient } from "./dashscope-client";

/** Independent call: fixed instructions plus current upload-derived data only. */
export async function completeCurrentUploadJson(
  systemPrompt: string,
  currentContent: ChatCompletionUserMessageParam["content"],
): Promise<string> {
  // Reuse only the HTTP client; never keep a message/image/answer history.
  const request: ChatCompletionCreateParamsStreaming & {
    enable_thinking: boolean;
    preserve_thinking: boolean;
  } = {
    model: BIRD_IDENTIFY_MODEL_NAME,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: currentContent },
    ],
    response_format: { type: "json_object" },
    stream: true,
    enable_thinking: true,
    preserve_thinking: false,
  };

  const stream = await getDashScopeClient().chat.completions.create(request);
  const answer: string[] = [];
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    // Do not display, store or resend reasoning_content.
    if (typeof content === "string") answer.push(content);
  }
  const content = answer.join("");
  if (!content.trim()) throw new Error("Model returned an empty response.");
  return content;
}
