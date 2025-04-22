import { gql } from "@apollo/client";

export const CREATE_CHATBOT = gql`
  mutation CreateChatbot($clerk_user_id: String!, $name: String!) {
    insertChatbots(clerk_user_id: $clerk_user_id, name: $name) {
      id
      name
    }
  }
`;

// Always double check the actual function in the graphql schema to make
// sure the names match exactly...
export const DELETE_CHATBOT = gql`
  mutation DeleteChatbot($id: Int!) {
    deleteChatbots(id: $id) {
      id
    }
  }
`;

export const REMOVE_CHARACTERISTIC = gql`
  mutation RemoveCharacteristic($id: Int!) {
    deleteChatbot_characteristics(id: $id) {
      id
    }
  }
`;

export const ADD_CHARACTERISTIC = gql`
  mutation AddCharacteristic($chatbotId: Int!, $content: String!) {
    insertChatbot_characteristics(chatbot_id: $chatbotId, content: $content) {
      id
      content
      created_at
    }
  }
`;

export const UPDATE_CHATBOT = gql`
  mutation UpdateChatbot($id: Int!, $name: String!) {
    updateChatbots(id: $id, name: $name) {
      id
      name
      created_at
    }
  }
`;

export const INSERT_MESSAGE = gql`
  mutation InsertMessages(
    $chat_session_id: Int!
    $content: String!
    $sender: String!
  ) {
    insertMessages(
      chat_session_id: $chat_session_id
      content: $content
      sender: $sender
    ) {
      id
      content
      sender
      created_at
    }
  }
`;

export const INSERT_GUESTS = gql`
  mutation insertGuests($name: String!, $email: String!) {
    insertGuests(name: $name, email: $email) {
      id
    }
  }
`;

export const INSERT_CHAT_SESSION = gql`
  mutation insertChatSession($chatbot_id: Int!, $guest_id: Int!) {
    insertChat_sessions(chatbot_id: $chatbot_id, guest_id: $guest_id) {
      id
    }
  }
`;
