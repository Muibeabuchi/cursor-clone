import { streamText, convertToModelMessages, UIMessage } from "ai";
import { createFileRoute } from "@tanstack/react-router";
import google from "~/lib/google-gemini";
import openrouter from "~/lib/open-router";
// import { UIMessage } from "@ai-sdk/react";

export const Route = createFileRoute("/api/ai/chat/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: UIMessage[] } = await request.json();

        const result = streamText({
          model: openrouter.chat("x-ai/grok-code-fast-1"),
          //    google.chat("gemini-2.5-pro"),
          //   openrouter.chat("anthropic/claude-sonnet-4.5"),
          //   openrouter.chat("x-ai/grok-code-fast-1"),
          messages: await convertToModelMessages(messages),
          system: "You are a helpful assistant.",
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});

// import React, { useState, useRef, useEffect } from 'react';

// // Interface for user data
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   imageUrl?: string;
// }

// // Props for the component
// interface UserButtonProps {
//   user: User;
//   onSignOut: () => void; // Your logout handler
//   onProfileClick?: () => void; // Optional profile click
// }

// const UserButton: React.FC<UserButtonProps> = ({ user, onSignOut, onProfileClick }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Generate initials from name
//   const initials = user.name
//     .split(' ')
//     .map(word => word[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2); // Max 2 initials

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Button that looks like Clerk's UserButton */}
//       <button
//         className="
//           flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5
//           shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2
//           focus:ring-blue-500 focus:ring-offset-1
//           active:scale-95 transition-transform
//         "
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label="User menu"
//       >
//         {/* Avatar */}
//         <div className="h-8 w-8 rounded-full overflow-hidden">
//           {user.imageUrl ? (
//             <img
//               src={user.imageUrl}
//               alt={`${user.name} avatar`}
//               className="h-full w-full object-cover"
//               onError={(e) => {
//                 (e.target as HTMLImageElement).style.display = 'none';
//               }}
//             />
//           ) : (
//             <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
//               {initials}
//             </div>
//           )}
//         </div>
//         {/* Down arrow */}
//         <svg
//           className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <polyline points="6,9 12,15 18,9" />
//         </svg>
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div className="
//           absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200
//           py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200
//         ">
//           {/* User info header */}
//           <div className="px-4 py-3 border-b border-gray-200">
//             <p className="font-medium text-gray-900">{user.name}</p>
//             <p className="text-sm text-gray-500">{user.email}</p>
//           </div>
//           {/* Menu options */}
//           <div className="py-1">
//             {onProfileClick && (
//               <button
//                 className="
//                   w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50
//                   focus:bg-gray-50 focus:outline-none transition-colors
//                 "
//                 onClick={() => {
//                   setIsOpen(false);
//                   onProfileClick();
//                 }}
//               >
//                 Manage Account
//               </button>
//             )}
//             <button
//               className="
//                 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50
//                 focus:bg-gray-50 focus:outline-none transition-colors
//               "
//               onClick={() => {
//                 setIsOpen(false);
//                 onSignOut();
//               }}
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserButton;

// import UserButton from './UserButton';

// const App = () => {
//   const user = {
//     id: '123',
//     name: 'John Doe',
//     email: 'john@example.com',
//     imageUrl: '' // or a real URL
//   };

//   const handleSignOut = () => {
//     // Your logout logic, e.g., sign out from Clerk
//   };

//   const handleProfileClick = () => {
//     // Navigate to profile page
//   };

//   return (
//     <div className="p-4">
//       <UserButton user={user} onSignOut={handleSignOut} onProfileClick={handleProfileClick} />
//     </div>
//   );
// };
