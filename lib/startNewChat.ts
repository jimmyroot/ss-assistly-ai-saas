import client from "@/graphql/apolloClient";
import {
  INSERT_CHAT_SESSION,
  INSERT_GUESTS,
  INSERT_MESSAGE,
} from "@/graphql/mutations/mutations";
// import { gql } from "@apollo/client";

async function startNewChat(
  guestName: string,
  guestEmail: string,
  chatbotId: number
) {
  try {
    // Create a new guest entry
    const guestResult = await client.mutate({
      mutation: INSERT_GUESTS,
      variables: { name: guestName, email: guestEmail },
    });

    const guestId = guestResult.data.insertGuests.id;

    // Initialize a new chat session
    const chatSessionResult = await client.mutate({
      mutation: INSERT_CHAT_SESSION,
      variables: { chatbot_id: chatbotId, guest_id: guestId },
    });
    const chatSessionId = chatSessionResult.data.insertChat_sessions.id;

    // Insert greeting message into the chat
    await client.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id: chatSessionId,
        sender: "ai",
        // This could be a more 'dynamic' message to give more variety, or even a prompted greeting ;)
        content: `Welcome ${guestName}!\n How can I help you? 😄`,
      },
    });
    return chatSessionId;
  } catch (err) {
    console.error(
      "There was an error when attempting to start a new chat session. The error was: " +
        err
    );
  }
}

export default startNewChat;
