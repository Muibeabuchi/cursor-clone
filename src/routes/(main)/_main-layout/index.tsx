// import { convexQuery } from "@convex-dev/react-query";
// import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
// import { api } from "convex/_generated/api";
// import { Authenticated, Unauthenticated } from "convex/react";
// import { Button } from "~/components/ui/button";
// import { useSignOut } from "~/hooks/useAuthMethods";
import { authQueryOptions } from "~/lib/queries/auth";

import { useChat } from "@ai-sdk/react";
import { Fragment, useState } from "react";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Loader2, MessageSquare } from "lucide-react";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "~/components/ai-elements/message";
import { ProjectsView } from "~/features/projects/components/projects-view";
import { projectQueryOptions } from "~/features/projects/hooks/use-projects";
import { LoadingIndicator } from "~/components/Loader";
// import { api } from "convex/_generated/api";

export const Route = createFileRoute("/(main)/_main-layout/")({
  component: Home,
  pendingComponent: () => <LoadingIndicator />,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(authQueryOptions()),
      // Load multiple queries in parallel if needed

      context.queryClient.prefetchQuery(
        projectQueryOptions.getProjectsPartial(10),
      ),
    ]);
  },
});

function Home() {
  return <ProjectsView />;
}

// import { createFileRoute } from '@tanstack/react-router';

// export const Route = createFileRoute('/')({
//   component: Chat,
// });

// function Chat() {
//   const [input, setInput] = useState("");
//   const { messages, sendMessage } = useChat({
//     transport: new DefaultChatTransport({
//       api: "/api/ai/chat/",
//     }),
//   });
//   return (
//     <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
//       <div className="h-full">
//         <Conversation>
//           <ConversationContent>
//             {messages.length === 0 ? (
//               <ConversationEmptyState
//                 title="Start a Conversation"
//                 description="Send a message to get started"
//                 icon={
//                   <MessageSquare className="size-12 text-muted-foreground" />
//                 }
//               />
//             ) : (
//               messages.map((message) => (
//                 <Message from={message.role} key={message.id}>
//                   <MessageContent>
//                     {/* {message.role === "user" ? "User: " : "AI: "} */}
//                     {message.parts.map((part, i) => {
//                       switch (part.type) {
//                         case "text":
//                           return (
//                             <MessageResponse key={`${message.id}-${i}`}>
//                               {part.text}
//                             </MessageResponse>
//                           );
//                         default:
//                           return null;
//                       }
//                     })}
//                   </MessageContent>
//                 </Message>
//               ))
//             )}
//           </ConversationContent>
//           <ConversationScrollButton />
//         </Conversation>
//       </div>

//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           sendMessage({ text: input });
//           setInput("");
//         }}
//       >
//         <input
//           className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
//           value={input}
//           placeholder="Say something..."
//           onChange={(e) => setInput(e.currentTarget.value)}
//         />
//       </form>
//     </div>
//   );
// }
