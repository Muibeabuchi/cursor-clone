import { convexQuery } from "@convex-dev/react-query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

export const currentUserQueryOptions = convexQuery(api.auth.getCurrentUser, {});

export const useCurrentUser = () => {
  return useQuery({
    ...currentUserQueryOptions,
  });
};

export const useSuspenseCurrentUser = () => {
  return useSuspenseQuery({
    ...currentUserQueryOptions,
  });
};
