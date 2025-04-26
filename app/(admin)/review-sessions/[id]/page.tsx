import Messages from "@/components/Messages";
import { GET_CHAT_SESSION_MESSAGES } from "@/graphql/queries/queries";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatSessionMessagesResponse,
  GetChatSessionsMessagesVariables,
} from "@/types/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function ReviewSingleSession({ params }: Props) {
  const { id } = await params;

  const {
    data: {
      chat_sessions: {
        // eslint-disable-next-line
        id: chatSessionId,
        created_at,
        messages,
        chatbots: { name },
        guests: { name: guestName, email },
      },
    },
  } = await serverClient.query<
    GetChatSessionMessagesResponse,
    GetChatSessionsMessagesVariables
  >({
    query: GET_CHAT_SESSION_MESSAGES,
    variables: { id: parseInt(id) },
  });

  return (
    <div className="flex-1 p-10 pb-24">
      <h1 className="">Session Review</h1>
      <p className="">Started at {new Date(created_at).toLocaleString()}</p>
      <h2 className="font-light mt-2">
        Between {name} &{" "}
        <span className="font-extrabold">
          {guestName} ({email})
        </span>
      </h2>
      <hr className="my-10" />

      <Messages messages={messages} chatbotName={name} />
    </div>
  );
}

export default ReviewSingleSession;
