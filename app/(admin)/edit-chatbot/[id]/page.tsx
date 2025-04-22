"use client";

import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/graphql/apolloClient";
import { Copy, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHATBOT_BY_ID } from "@/graphql/queries/queries";
import {
  ChatbotCharacteristic,
  GetChatbotByIdResponse,
  GetChatbotByIdVariables,
} from "@/types/types";
import Characteristic from "@/components/Characteristic";
import {
  ADD_CHARACTERISTIC,
  DELETE_CHATBOT,
  UPDATE_CHATBOT,
} from "@/graphql/mutations/mutations";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

function EditChatbot({ params }: Props) {
  const { id } = use(params);
  const [url, setUrl] = useState<string>("");
  const [chatbotName, setChatbotName] = useState<string>("");
  const [newCharacteristic, setNewCharacteristic] = useState<string>("");

  const { data, loading, error } = useQuery<
    GetChatbotByIdResponse,
    GetChatbotByIdVariables
  >(GET_CHATBOT_BY_ID, { variables: { id } });

  // Delete chatbot function
  const [deleteChatbot] = useMutation(DELETE_CHATBOT, {
    // Re-fetch chatbots after deleting
    refetchQueries: ["GetChatbotById"],
    awaitRefetchQueries: true,
  });

  const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
    refetchQueries: ["GetChatbotById"],
  });

  const [updateChatbot] = useMutation(UPDATE_CHATBOT, {
    refetchQueries: ["GetChatbotById"],
  });

  useEffect(() => {
    if (data) {
      setChatbotName(data.chatbots.name);
    }
  }, [data]);

  useEffect(() => {
    const url = `${BASE_URL}/chatbot/${id}`;
    setUrl(url);
  }, [id]);

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this chatbot?"
    );
    if (!isConfirmed) return;

    try {
      const promise = deleteChatbot({ variables: { id } });
      console.log(promise);
      toast.promise(promise, {
        loading: "Deleting...",
        success: "Chatbot successfully deleted!",
        error: "Failed to delete chatbot",
      });
    } catch (err) {
      console.error("Error deleting chatbot:", err);
      toast.error("Failed to delete chatbot");
    }
  };

  const handleUpdateChatbot = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const promise = updateChatbot({
        variables: {
          id,
          name: chatbotName,
        },
      });
      toast.promise(promise, {
        loading: "Renaming chatbot...",
        success: "Chatbot successfully renamed!",
        error: "Failed to rename Chatbot",
      });
    } catch (err) {
      console.error(err);
      console.log("Failed to update chatbot, error to follow", err);
    }
  };

  const handleAddCharacteristic = (content: string) => {
    try {
      const promise = addCharacteristic({
        variables: {
          chatbotId: Number(id),
          content,
        },
      });
      console.log(promise);
      toast.promise(promise, {
        loading: "Adding characteristic...",
        success: "New characteristic added",
        error: "Failed to add characteristic",
      });
    } catch (err) {
      console.error("Failed to add characteristic", err);
    }
  };

  // Show a spinner if query is loading
  if (loading)
    return (
      <div className="mx-auto animate-spin p-10">
        <Avatar seed="Jimmyr00t's AI Support Agent" />
      </div>
    );

  // If some other error occurs, print the 'ting
  if (error) return <p>Error: {error.message}</p>;

  // If query is successfull but empty, redirect to /view-chatbots
  if (!data?.chatbots) return redirect("/view-chatbots");

  return (
    <div className="px-0 md:p-10">
      <div className="md:sticky md:top-0 z-50 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-[#2991EE]">
        <h2 className="text-white text-sm font-bold">Link to chat</h2>
        <p className="text-sm italic text-white">
          Share this link with your customers to start conversations with your
          chatbot.
        </p>
        <div className="flex items-center space-x-2">
          <Link href={url} className="w-full cursor-pointer hover:opacity-50">
            <Input value={url} readOnly className="cursor-pointer bg-white" />
          </Link>
          <Button
            size="sm"
            className="px-3"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success("Copied to clipboard!");
            }}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <section className="relative mt-5 bg-white p-5 md:p-10 rounded-lg">
        <Button
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={() => handleDelete(id)}
        >
          <X />

          {/* Update chatbot button */}
        </Button>
        <div className="flex space-x-4">
          {chatbotName && <Avatar seed={chatbotName} />}
          <form
            onSubmit={handleUpdateChatbot}
            className="flex flex-1 items-center space-x-2"
          >
            <Input
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder={chatbotName}
              className="w-full border-none bg-transparent text-xl font-bold"
              required
            />
            <Button type="submit" disabled={!chatbotName}>
              Update
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mt-10">
            Here's what your AI knows...
          </h2>
          <p className="mt-3">
            Your chatbot is equipped with the following information, which it
            will be able to discuss with your customers or users.
          </p>
        </div>

        {/* FORM: ADD NEW CHARACTERISTIC */}
        <div className="bg-gray-200 p-5 md:p-5 rounded-md mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCharacteristic(newCharacteristic);
              setNewCharacteristic("");
            }}
            className="flex space-x-2 mb-5 mt-2"
          >
            <Input
              type="text"
              placeholder="Example: If the customer asks about price, provide a link to the pricing page: https://example.com/pricing"
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
              className="bg-white"
            />
            <Button type="submit" disabled={!newCharacteristic}>
              Add
            </Button>
          </form>
          <ul className="flex flex-wrap-reverse gap-5">
            {data?.chatbots.chatbot_characteristics.map((ch) => (
              <Characteristic key={ch.id} characteristic={ch} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default EditChatbot;
