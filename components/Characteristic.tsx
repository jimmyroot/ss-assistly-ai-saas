"use client";

import { REMOVE_CHARACTERISTIC } from "@/graphql/mutations/mutations";
import { ChatbotCharacteristic } from "@/types/types";
import { useMutation } from "@apollo/client";
import { OctagonX } from "lucide-react";
import { toast } from "sonner";

function Characteristic({
  characteristic,
}: {
  characteristic: ChatbotCharacteristic;
}) {
  const [removeCharacteristic] = useMutation(REMOVE_CHARACTERISTIC, {
    // This is important, without this the UI won't get updated
    refetchQueries: ["GetChatbotById"],
  });

  const handleRemoveCharacteristic = async (characteristicId: number) => {
    try {
      const response = await removeCharacteristic({
        variables: {
          id: characteristicId,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <li className="relative p-10 bg-white border rounded-md">
      {characteristic.content}
      <OctagonX
        className="w-6 h-6 text-white fill-red-500 absolute top-1 right-1 cursor-pointer hover:opacity-50"
        onClick={() => {
          const promise = handleRemoveCharacteristic(characteristic.id);
          toast.promise(promise, {
            loading: "Removing...",
            success: "Characteristic removed",
            error: "Failed to remove characteristic",
          });
        }}
      />
    </li>
  );
}

export default Characteristic;
