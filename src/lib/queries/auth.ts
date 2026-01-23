import { queryOptions } from "@tanstack/react-query";
import { getAuth } from "~/utils/auth-ssr";

const $getUser = async () => (await getAuth()) ?? null;

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: () => $getUser(),
  });

export type AuthQueryResult = Awaited<ReturnType<typeof $getUser>>;
