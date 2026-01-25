import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

export const projectQueryOptions = {
  getProjects: convexQuery(api.projects.get, {}),
  getProjectsPartial: (limit: number) =>
    convexQuery(api.projects.getPartial, { limit }),
};

export const useProjects = () =>
  useSuspenseQuery({
    ...projectQueryOptions.getProjects,
  });

export const useProjectsPartial = (limit: number) => {
  return useSuspenseQuery({
    ...projectQueryOptions.getProjectsPartial(limit),
  });
};

// -------------------------MUTATIONS----------------------------//

export const useCreateProjects = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.projects.create),
  });
};
