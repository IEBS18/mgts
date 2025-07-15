// //  ***********************************
// // Layout without sidebar 
// // *************************************
// import React from 'react';
// import Header from '@/components/Navbar/Header';
// import '../index.css'

// const Layout = ({ children }) => {
//   return (
//     <div className="flex flex-col h-full no-scrollbar">
//       {/* Use Header at the top */}
//       <div className='sticky top-0 w-full z-50'>
//         <Header />
//       </div>
//       {/* Content area */}
//       <div className="flex-1 overflow-y-auto bg-gray-100 no-scrollbar">{children}</div>
//     </div>
//   );
// };

// export default Layout;



//  ***********************************
// Layout with sidebar 
// ************************************


// import React, { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   LogIn,
//   Users,
//   Microscope,
//   DollarSign,
//   FileText,
//   Lightbulb,
//   LayoutDashboard,
//   Settings,
//   LogOut,
// } from "lucide-react";

// import { UserNav } from "@/components/Navbar/UserNav"; // Adjust path as necessary
// import "../index.css";

// export default function Layout({ children }) {
//   // Collapse state
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // React Router
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Check if user is logged in
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [firstName, setFirstName] = useState("User");

//   // Example main navigation items
//   const mainNavItems = [
//     {
//       title: "Dashboard",
//       path: "/dashboard",
//       icon: <LayoutDashboard className="size-4" />,
//     },
//     {
//       title: "Competitive Landscape",
//       path: "/competitive-analysis",
//       icon: <Users className="size-4" />,
//     },
//     {
//       title: "Disease Overview",
//       path: "/disease-overview",
//       icon: <Microscope className="size-4" />,
//     },
//     {
//       title: "Price Prediction",
//       path: "/price-prediction-modal",
//       icon: <DollarSign className="size-4" />,
//     },
//     {
//       title: "Formulary",
//       path: "/formulary",
//       icon: <FileText className="size-4" />,
//     },
//     {
//       title: "BioFormulate",
//       path: "/bio-formulate",
//       icon: <Lightbulb className="size-4" />,
//     },
//   ];

//   // Check if user is logged in and set first name
//   useEffect(() => {
//     const storedFirstName = localStorage.getItem("first_name_pharmax_user");
//     if (storedFirstName) {
//       setIsLoggedIn(true);
//       setFirstName(storedFirstName);
//     }
//   }, []);

//   // Handle log out
//   const handleLogout = () => {
//     localStorage.removeItem("first_name_pharmax_user");
//     localStorage.removeItem("user_pharmax_id");
//     setIsLoggedIn(false);
//     navigate("/");
//   };

//   return (
//     <div className="flex flex-col h-screen no-scrollbar">
//       {/* ===== Header ===== */}
//       <header className="flex items-center justify-between bg-gradient-alt-ego px-6 py-2 shadow-md z-50 fixed top-0 left-0 w-full">
//         {/* Left Section: Collapse Button + Bar + Brand */}
//         <div className="flex items-center">
//           {/* Larger arrow button */}
//           <button
//             onClick={() => setIsCollapsed((prev) => !prev)}
//             className="mr-3 mb-2 text-white text-4xl focus:outline-none"
//           >
//             {isCollapsed ? "›" : "‹"}
//           </button>

//           {/* Vertical bar */}
//           <span className="text-white mr-3 text-xl">|</span>

//           {/* Brand/Logo */}
//           <Link to="/" className="flex items-center gap-2">
//             <span className="font-bold text-white hover:text-white">
//               Pharma<span className="text-[#a6ce39]">X</span>
//             </span>
//           </Link>
//         </div>

//         {/* Right Section: UserNav (avatar & dropdown) */}
//         {isLoggedIn ? (
//           <UserNav firstName={firstName} onLogout={handleLogout} />
//         ) : (
//           <span className="text-white">Hi User</span>
//         )}
//       </header>

//       {/* ===== Body: Sidebar + Content ===== */}
//       <div className="flex flex-1 pt-16">
//         {" "}
//         {/* Added pt-16 to create space for the fixed header */}
//         {/* ===== Sidebar ===== */}
//         <aside
//           className={`fixed top-0 left-0 flex flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out ${
//             isCollapsed ? "w-12" : "w-56"
//           }`}
//           style={{ height: "100vh" }}
//           // style={{ height: "calc(100vh - 64px)" }}
//         >
//           <div className="flex-1 flex flex-col justify-between">
//             {/* --- Main Nav Items --- */}
//             <ul className="mt-20 space-y-2">
//               {mainNavItems.map((item) => (
//                 <li key={item.title}>
//                   <Link
//                     to={item.path}
//                     className={`flex items-center gap-3 px-4 py-2 hover:bg-white hover:text-[#a6ce39] transition-all duration-300 ease-in-out ${
//                       location.pathname === item.path
//                         ? "bg-white text-[#a6ce39] font-bold"
//                         : "text-[#000]"
//                     }`}
//                   >
//                     {isCollapsed ? (React.cloneElement(item.icon, {
//                       className: "text-[#000] size-5 font-bold"
//                     }))
//                   :
//                   (React.cloneElement(item.icon, {
//                     className:
//                       location.pathname === item.path
//                         ? "text-[#a6ce39] size-5 font-bold"
//                         : "text-[#a6ce39] size-4",
//                   }))}
//                     {!isCollapsed && <span>{item.title}</span>}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             {/* --- Bottom Links: Settings or Sign up --- */}
//             {isLoggedIn ? (
//               <ul className="space-y-1 border-t pt-4 mt-auto mb-2">
//                 <li>
//                   <Link
//                     to="/settings"
//                     className="flex items-center gap-2 px-4 py-2 hover:bg-white hover:text-[#a6ce39] transition-all duration-300 ease-in-out"
//                   >
//                     <Settings className="size-4" />
//                     {!isCollapsed && <span>Settings</span>}
//                   </Link>
//                 </li>
//                 <li>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-white hover:text-red-600 transition-all duration-300 ease-in-out"
//                   >
//                     <LogOut className="size-4" />
//                     {!isCollapsed && <span>Log Out</span>}
//                   </button>
//                 </li>
//               </ul>
//             ) : (
//               <ul className="space-y-1 border-t pt-4 mt-auto mb-2">
//                 <li>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-white hover:text-green-600 transition-all duration-300 ease-in-out"
//                   >
//                     <LogIn className="size-4" />
//                     {!isCollapsed && <span>Sign up</span>}
//                   </button>
//                 </li>
//               </ul>
//             )}
//           </div>
//         </aside>
//         {/* ===== Main Content ===== */}
//         <main
//           className={`flex-1 overflow-y-auto bg-gray-100 no-scrollbar transition-all duration-300 ease-in-out ${
//             isCollapsed ? "ml-12" : "ml-56"
//           }`}
//         >
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogIn,
  Users,
  Microscope,
  DollarSign,
  FileText,
  Lightbulb,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";

import { UserNav } from "@/components/Navbar/UserNav"; // Adjust path as necessary
import "../index.css";

export default function Layout({ children }) {
  // Collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // React Router
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("User");

  // Example main navigation items
  const mainNavItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: "Competitive Landscape",
      path: "/competitive-analysis",
      icon: <Users className="size-4" />,
    },
    {
      title: "Disease Overview",
      path: "/disease-overview",
      icon: <Microscope className="size-4" />,
    },
    {
      title: "Price Prediction",
      path: "/price-prediction-modal",
      icon: <DollarSign className="size-4" />,
    },
    {
      title: "Formulary",
      path: "/formulary",
      icon: <FileText className="size-4" />,
    },
    {
      title: "BioFormulate",
      path: "/bio-formulate",
      icon: <Lightbulb className="size-4" />,
    },
  ];

  // Check if user is logged in and set first name
  useEffect(() => {
    const storedFirstName = localStorage.getItem("first_name_pharmax_user");
    if (storedFirstName) {
      setIsLoggedIn(true);
      setFirstName(storedFirstName);
    }
  }, []);

  // Handle log out
  const handleLogout = () => {
    localStorage.removeItem("first_name_pharmax_user");
    localStorage.removeItem("user_pharmax_id");
    setIsLoggedIn(false);
    navigate("/");
  };

  // Handle tab click to collapse sidebar
  const handleTabClick = () => {
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
  };

  return (
    <div className="flex flex-col h-screen no-scrollbar">
      {/* ===== Header ===== */}
      <header className="flex items-center justify-between bg-gradient-alt-ego px-6 py-2 shadow-md z-50 fixed top-0 left-0 w-full">
        {/* Left Section: Collapse Button + Bar + Brand */}
        <div className="flex items-center">
          {/* Larger arrow button */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="mr-3 mb-2 text-white text-4xl focus:outline-none"
          >
            {isCollapsed ? "›" : "‹"}
          </button>

          {/* Vertical bar */}
          <span className="text-white mr-3 text-xl">|</span>

          {/* Brand/Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-white hover:text-white">
              Pharma<span className="text-[#a6ce39]">X</span>
            </span>
          </Link>
        </div>

        {/* Right Section: UserNav (avatar & dropdown) */}
        {isLoggedIn ? (
          <UserNav firstName={firstName} onLogout={handleLogout} />
        ) : (
          <span className="text-white">Hi User</span>
        )}
      </header>

      {/* ===== Body: Sidebar + Content ===== */}
      <div className="flex flex-1 pt-16">
        {/* ===== Sidebar ===== */}
        <aside
          className={`fixed top-0 left-0 flex flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out ${isCollapsed ? "w-12" : "w-56"}`}
          style={{ height: "100vh" }}
        >
          <div className="flex-1 flex flex-col justify-between">
            {/* --- Main Nav Items --- */}
            <ul className="mt-20 space-y-2">
              {mainNavItems.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    onClick={handleTabClick}  // Collapse sidebar on tab click
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-white hover:text-[#a6ce39] transition-all duration-300 ease-in-out ${
                      location.pathname === item.path
                        ? "bg-white text-[#a6ce39] font-bold"
                        : "text-[#000]"
                    }`}
                    title={isCollapsed ? item.title : ""}  // Tooltip on hover when collapsed
                  >
                    {isCollapsed ? (
                      React.cloneElement(item.icon, {
                        className: "text-[#000] size-5 font-bold",
                      })
                    ) : (
                      React.cloneElement(item.icon, {
                        className:
                          location.pathname === item.path
                            ? "text-[#a6ce39] size-5 font-bold"
                            : "text-[#a6ce39] size-4",
                      })
                    )}
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>

            {/* --- Bottom Links: Settings or Sign up --- */}
            {isLoggedIn ? (
              <ul className="space-y-1 border-t pt-4 mt-auto mb-2">
                <li>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white hover:text-[#a6ce39] transition-all duration-300 ease-in-out"
                  >
                    <Settings className="size-4" />
                    {!isCollapsed && <span>Settings</span>}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-white hover:text-red-600 transition-all duration-300 ease-in-out"
                  >
                    <LogOut className="size-4" />
                    {!isCollapsed && <span>Log Out</span>}
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="space-y-1 border-t pt-4 mt-auto mb-2">
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-white hover:text-green-600 transition-all duration-300 ease-in-out"
                  >
                    <LogIn className="size-4" />
                    {!isCollapsed && <span>Sign up</span>}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </aside>
        {/* ===== Main Content ===== */}
        <main
          className={`flex-1 overflow-y-auto bg-gray-100 no-scrollbar transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-12" : "ml-56"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
