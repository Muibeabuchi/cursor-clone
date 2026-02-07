import { queryOptions } from "@tanstack/react-query";
import { getAuth } from "~/utils/auth-ssr";

export const $getUser = async () => (await getAuth()) ?? null;

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: () => $getUser(),
    staleTime: 60 * 2 * 1000,
  });

export type AuthQueryResult = Awaited<ReturnType<typeof $getUser>>;
