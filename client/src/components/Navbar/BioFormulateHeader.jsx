
import React, { useEffect, useState } from "react";
import { LogOut, ChevronDown, UserCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import insimine from "@/assets/logo.png";

// Import dropdown components and Button from your UI library
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const BioFormulateHeader = () => {
  const [firstName, setFirstName] = useState("User"); // Default to Ayush if not available
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the first name from localStorage (if available)
    const storedFirstName = localStorage.getItem("first_name_pharmax_user");
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }
  }, []);

  const handleLogout = () => {
    // Clear user data and navigate to login page
    localStorage.removeItem("first_name_pharmax_user");
    localStorage.removeItem("user_pharmax_id");
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between bg-gradient-alt-ego px-6 py-2 shadow-md z-50">
      {/* Logo Section */}
      <div className="flex items-center">
        <a href="/dashboard">
          <img src={insimine} alt="Insimine" className="h-full w-20" />
        </a>
        <h1 className="px-4 text-white">|</h1>
        <a href="/dashboard" className="font-bold text-white hover:text-white">
          Bio<span className="text-white">Formulate</span>
        </a>
      </div>

      {/* Greeting and Dropdown Menu */}
      <div className="flex items-center gap-4">
        {/* <p className="text-white">Hi, {firstName || "Guest"}!</p> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white bg-transparent hover:text-white hover:bg-[#699434] rounded-[12px]"
            >
              <UserCircle className="h-4 w-4" />
              <span>Hi {firstName || "Ayush"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 bg-white/90 z-[9999] rounded-[12px]"
            align="end"
            forceMount
          >
            <DropdownMenuItem className="hover:bg-[#e0f3c4] hover:rounded-[12px]">
              <a href="https://insimine.com/" target="_blank" className="flex flex-row gap-2">
              <Building2 className="w-4 h-4 mr-2"/>
              Insimine
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-[#e0f3c4] hover:rounded-[12px]">
            <a href="https://www.iebrain.com/" target="_blank" className="flex flex-row gap-2">
              <Building2 className="w-4 h-4 mr-2"/>
              Ingenious-e-brain
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="group hover:bg-[#e0f3c4] hover:rounded-[12px]"
            >
              <LogOut className="mr-2 h-4 w-4 group-hover:text-red-600" />
              <span className="group-hover:text-red-600">Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default BioFormulateHeader;



// "use client"

// import { useEffect, useState } from "react"
// import { LogOut, ChevronDown, UserCircle, Building2, Microscope } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import insimine from "@/assets/logo.png"

// // Import dropdown components and Button from your UI library
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"

// const BioFormulateHeader = () => {
//   const [firstName, setFirstName] = useState("User") // Default to User if not available
//   const navigate = useNavigate()

//   useEffect(() => {
//     // Retrieve the first name from localStorage (if available)
//     const storedFirstName = localStorage.getItem("first_name_pharmax_user")
//     if (storedFirstName) {
//       setFirstName(storedFirstName)
//     }
//   }, [])

//   const handleLogout = () => {
//     // Clear user data and navigate to login page
//     localStorage.removeItem("first_name_pharmax_user")
//     localStorage.removeItem("user_pharmax_id")
//     navigate("/")
//   }

//   return (
//     <header className="flex items-center justify-between bg-white px-6 py-3 shadow-md z-50 border-b border-gray-100">
//       {/* Logo Section */}
//       <div className="flex items-center">
//         <a href="/dashboard" className="flex items-center gap-2">
//           <div className="bg-[#3b82f6] rounded-full p-1.5">
//             <Microscope className="h-5 w-5 text-white" />
//           </div>
//           {/* <img src={insimine || "/placeholder.svg"} alt="Insimine" className="h-full w-20" /> */}
//         </a>
//         <div className="h-6 w-px bg-gray-300 mx-4"></div>
//         <a href="/dashboard" className="font-bold text-gray-800 hover:text-gray-900">
//           Bio<span className="text-[#3b82f6]">Formulate</span>
//         </a>
//       </div>

//       {/* Greeting and Dropdown Menu */}
//       <div className="flex items-center gap-4">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="ghost"
//               className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
//             >
//               <UserCircle className="h-4 w-4" />
//               <span>Hi {firstName || "User"}</span>
//               <ChevronDown className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="w-48 bg-white z-[9999] rounded-lg shadow-md" align="end" forceMount>
//             <DropdownMenuItem className="hover:bg-gray-100 rounded-md">
//               <a href="https://insimine.com/" target="_blank" className="flex flex-row gap-2" rel="noreferrer">
//                 <Building2 className="w-4 h-4 mr-2" />
//                 Insimine
//               </a>
//             </DropdownMenuItem>
//             <DropdownMenuItem className="hover:bg-gray-100 rounded-md">
//               <a href="https://www.iebrain.com/" target="_blank" className="flex flex-row gap-2" rel="noreferrer">
//                 <Building2 className="w-4 h-4 mr-2" />
//                 Ingenious-e-brains
//               </a>
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={handleLogout} className="group hover:bg-red-50 hover:rounded-md">
//               <LogOut className="mr-2 h-4 w-4 group-hover:text-red-600" />
//               <span className="group-hover:text-red-600">Log Out</span>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   )
// }

// export default BioFormulateHeader
