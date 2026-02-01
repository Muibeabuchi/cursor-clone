import { Id } from "convex/_generated/dataModel";
import Navbar from "./navbar";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { ClientOnly } from "@tanstack/react-router";
import { ProjectIdPageSkeleton } from "~/components/ProjectIdPageSkeleton";

const paneConstants = {
  Min_SIDEBAR_WIDTH: 200,
  Max_SIDEBAR_WIDTH: 800,
  DEFAULT_MAIN_WIDTH: 1000,
  DEFAULT_CONVERSATION_SIDEBAR_WIDTH: 400,
};

const ProjectIdLayout = ({
  children,
  projectId,
}: {
  projectId: Id<"projects">;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar projectId={projectId} />
      <ClientOnly fallback={<ProjectIdPageSkeleton />}>
        <div className="flex-1 flex overflow-hidden">
          <Allotment
            className="flex-1"
            defaultSizes={[
              paneConstants.DEFAULT_CONVERSATION_SIDEBAR_WIDTH,
              paneConstants.DEFAULT_MAIN_WIDTH,
            ]}
          >
            <Allotment.Pane
              snap
              minSize={paneConstants.Min_SIDEBAR_WIDTH}
              maxSize={paneConstants.Max_SIDEBAR_WIDTH}
              preferredSize={paneConstants.DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
            >
              <div className="">SideBar</div>
              {/* <Sidebar /> */}
            </Allotment.Pane>
            <Allotment.Pane>{children}</Allotment.Pane>
          </Allotment>
        </div>
      </ClientOnly>
    </div>
  );
};

export default ProjectIdLayout;
