import React, { useEffect, useState } from 'react';
import { User, LogOut } from 'lucide-react'; // Adding logout icon
import { useNavigate } from 'react-router-dom'; // For navigation
import insimine from "@/assets/Insimine.svg";

const Header = () => {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve the first name from localStorage
        const storedFirstName = localStorage.getItem('first_name_pharmax_user');
        if (storedFirstName) {
            setFirstName(storedFirstName);
        }
    }, []);

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('first_name_pharmax_user');
        localStorage.removeItem('user_pharmax_id');
        // Redirect to login page
        navigate('/');
    };

    return (
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md z-50">
            {/* Logo on the left */}
            <div className="flex items-center">
                <a href="/dashboard">
                    <img
                        src={insimine} // Replace with your logo's path
                        alt="Insimine"
                        className="h-8 w-8"
                    />
                </a>
                
            </div>

            {/* Center text */}
            <h1 className=" ml-8 text-2xl font-bold text-gray-800">
                PHARMA<span className="text-[#a6ce39]">X</span>
            </h1>

            {/* Account icon, greeting, and logout on the right */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-gray-600 cursor-pointer" />
                    <p>Hi, {firstName || 'Guest'}!</p>
                </div>
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;


// import React, { useEffect, useState } from 'react';
// import { User } from 'lucide-react'; // Using an icon library for the account icon
// import insimine from "@/assets/Insimine.svg";

// const Header = () => {
//     const [firstName, setFirstName] = useState('');

//     useEffect(() => {
//         // Retrieve the first name from localStorage
//         const storedFirstName = localStorage.getItem('first_name_pharmax_user');
//         if (storedFirstName) {
//             setFirstName(storedFirstName);
//         }
//     }, []); // Empty dependency array ensures this runs once when the component mounts

//     return (
//         <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
//             {/* Logo on the left */}
//             <div className="flex items-center">
//                 <a href="http://localhost:5173/dashboard">
//                     <img
//                         src={insimine} // Replace with your logo's path
//                         alt="Insimine"
//                         className="h-8 w-8"
//                     />
//                 </a>
//             </div>

//             {/* Center text */}
//             <h1 className="text-2xl font-bold text-gray-800">
//                 Welcome to <span className="text-[#a6ce39]">PharmaX</span>
//             </h1>

//             {/* Account icon and user name on the right */}
//             <div className="flex items-center">
//                 <User className="h-6 w-6 text-gray-600 cursor-pointer" />
//                 <p className="ml-2">Hi, {firstName || 'UserX'}!</p>
//             </div>
//         </header>
//     );
// };

// export default Header;
