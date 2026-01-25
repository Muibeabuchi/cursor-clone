import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export const projectQueryOptions = {
  getProjects: convexQuery(api.projects.get, {}),
  getProjectsPartial: (limit: number) =>
    convexQuery(api.projects.getPartial, { limit }),
  getById: (projectId: Id<"projects">) =>
    convexQuery(api.projects.getById, { projectId }),
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

export const useGetProject = (projectId: Id<"projects">) => {
  return useSuspenseQuery({
    ...projectQueryOptions.getById(projectId),
  });
};

// -------------------------MUTATIONS----------------------------//

export const useCreateProjects = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.projects.create),
  });
};

export const useRenameProjectName = () => {
  return useMutation({
    mutationFn: useConvexMutation(
      api.projects.renameProjectName,
    ).withOptimisticUpdate((localStorage, variables) => {
      const { projectId, name } = variables;
      const project = localStorage.getQuery(api.projects.getById, {
        projectId,
      });
      if (!project) return;
      localStorage.setQuery(
        api.projects.getById,
        {
          projectId,
        },
        { ...project, name },
      );
    }),
  });
};
