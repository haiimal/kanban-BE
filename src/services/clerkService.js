// src/services/clerkService.js
import axios from "axios";

export const getAllClerkUsers = async () => {
  const options = {
    method: "GET",
    url: "https://api.clerk.com/v1/users",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  };

  const { data } = await axios.request(options);
  return data;
};
