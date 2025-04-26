import { serverClient } from "@/lib/server/serverClient";
import { gql } from "@apollo/client";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  const { query, variables } = await request.json();

  try {
    let result;
    if (query.trim().startsWith("mutation")) {
      // handle mutations
      result = await serverClient.mutate({
        mutation: gql`
          ${query}
        `,
        variables,
      });
      // This is where you console log out the result to see why the response is missing
      // console.log(result);
    } else {
      // handle queries
      result = await serverClient.query({
        query: gql`
          ${query}
        `,
        variables,
      });
      // console.log(result);
    }

    const data = result.data;

    // Debugging stuff
    // console.log("DATA >>> ", data);

    return NextResponse.json(
      {
        data,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
