import { INSERT_MESSAGE } from "@/graphql/mutations/mutations";
import {
  GET_CHATBOT_BY_ID,
  GET_MESSAGES_BY_CHAT_SESSION_ID,
} from "@/graphql/queries/queries";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name } = await req.json();

  console.log(
    `Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id}, ${name})}`
  );

  try {
    // 1. Get the chatbot (for characteristics)
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot)
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });

    // 2. Fetch previous messages
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });
    const previousMessages = messagesData.chat_sessions.messages;

    // 3. Format previous messages for OpenAI
    const formattedPreviousMessages: ChatCompletionMessageParam[] =
      previousMessages.map((message) => ({
        role: message.sender === "ai" ? "system" : "user",
        name: message.sender === "ai" ? "system" : name,
        content: message.content,
      }));

    const systemPrompt = chatbot.chatbot_characteristics
      .map((characteristic) => characteristic.content)
      .join(" + ");
    console.log(systemPrompt);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        name: "system",
        content: `You are a helpful assistant talking to ${name}. If a generic question is asked which is not
            relevant or in the same scope or domain as the points in mentioned in the key information section, 
            kindly inform the user theyre only allowed to search for the specified content. Use Emoji's where possible. 
            Here is some key information that you need to be aware of, these are elements you may be asked about: ${systemPrompt}`,
      },
      ...formattedPreviousMessages,
      {
        role: "user",
        name,
        content,
      },
    ];

    // 4. Create the chat completion
    const openaiResponse = await openai.chat.completions.create({
      messages,
      model: "gpt-4o",
    });

    const aiResponse = openaiResponse?.choices?.[0].message?.content?.trim();

    if (!aiResponse)
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 }
      );

    // Step 5. Commit users message to DB
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: { chat_session_id, content, sender: "user" },
    });

    // 6. Commit ai response to DB
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: { chat_session_id, content: aiResponse, sender: "ai" },
    });

    return NextResponse.json({
      id: aiMessageResult.data.insertMessages.id,
      content: aiResponse,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
