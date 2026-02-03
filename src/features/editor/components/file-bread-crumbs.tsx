import { FileIcon } from "@react-symbols/icons/utils";
import { Id } from "convex/_generated/dataModel";
import React from "react";
import { useFilePath } from "~/features/projects/hooks/use-file";
import { useEditor } from "../hooks/use-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";

export default function FileBreadCrumbs({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const { activeTabId } = useEditor(projectId);
  const { data: filePath } = useFilePath({ fileId: activeTabId });

  if (!filePath || !activeTabId) {
    return (
      <div className="p-2 bg-background pl-4 border-b">
        <Breadcrumb>
          <BreadcrumbList className="sm:gap-0.5 gap-0.5">
            <BreadcrumbItem className="text-sm">
              <BreadcrumbPage>&nbsp;</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }
  return (
    <div className="p-2 bg-background pl-4 border-b">
      <Breadcrumb>
        <BreadcrumbList className=" gap-0.5">
          {filePath.map((path, index) => {
            const isLast = index === filePath.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem className="text-sm">
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <FileIcon
                        fileName={path.name}
                        autoAssign
                        className="size-4"
                      />
                      {path.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={"/"}>{path.name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
