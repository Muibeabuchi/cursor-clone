import { Id } from "convex/_generated/dataModel";
import Navbar from "./navbar";

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
      {children}
    </div>
  );
};

export default ProjectIdLayout;
