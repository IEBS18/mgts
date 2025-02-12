// import React, { useEffect, useState } from 'react';
// import { User, LogOut } from 'lucide-react'; // Adding logout icon
// import { useNavigate } from 'react-router-dom'; // For navigation
// import insimine from "@/assets/logo.png";

// const Header = () => {
//     const [firstName, setFirstName] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         // Retrieve the first name from localStorage
//         const storedFirstName = localStorage.getItem('first_name_pharmax_user');
//         if (storedFirstName) {
//             setFirstName(storedFirstName);
//         }
//     }, []);

//     const handleLogout = () => {
//         // Clear user data from localStorage
//         localStorage.removeItem('first_name_pharmax_user');
//         localStorage.removeItem('user_pharmax_id');
//         // Redirect to login page
//         navigate('/');
//     };

//     return (
//         <header className="flex items-center justify-between bg-gradient-alt-ego px-6 py-4 shadow-md z-50">
//             {/* Logo on the left */}
//             <div className="flex items-center">
//                 <a href="/dashboard">
//                     <img
//                         src={insimine} // Replace with your logo's path
//                         alt="Insimine"
//                         className="h-full w-20"
//                     />
//                 </a>
//                 <h1 className="px-4 text-white">|</h1>
//                 <a href="/dashboard" className="font-bold text-white hover:text-white">
//                     Pharma<span className="text-[#a6ce39]">X</span>
//                 </a>

//             </div>

//             {/* Center text */}

//             {/* Account icon, greeting, and logout on the right */}
//             <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                     <User className="h-6 w-6 text-gray-600 cursor-pointer" />
//                     <p className=" mt-2 items-center">Hi, {firstName || 'Guest'}!</p>
//                 </div>
//                 {/* Logout Button */}
//                 <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
//                 >
//                     <LogOut className="h-5 w-5" />
//                     <span>Logout</span>
//                 </button>
//             </div>
//         </header>
//     );
// };

// export default Header;



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

const Header = () => {
  const [firstName, setFirstName] = useState("Ayush"); // Default to Ayush if not available
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
    <header className="flex items-center justify-between bg-gradient-alt-ego px-6 py-4 shadow-md z-50">
      {/* Logo Section */}
      <div className="flex items-center">
        <a href="/dashboard">
          <img src={insimine} alt="Insimine" className="h-full w-20" />
        </a>
        <h1 className="px-4 text-white">|</h1>
        <a href="/dashboard" className="font-bold text-white hover:text-white">
          Pharma<span className="text-[#a6ce39]">X</span>
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
              Ingenious-e-brains
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

export default Header;
