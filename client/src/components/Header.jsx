import React from 'react';
import { User } from 'lucide-react'; // Using an icon library for the account icon
import insimine from "@/assets/Insimine.svg";
const Header = () => {
    return (
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
            {/* Logo on the left */}
            <div className="flex items-center">
                <img
                    src={insimine} // Replace with your logo's path
                    alt="Insimine"
                    className="h-8 w-8"
                />
            </div>

            {/* Center text */}
            <h1 className="text-2xl font-bold text-gray-800">
                Welcome to <span className="text-[#a6ce39]">PharmaX</span>
            </h1>

            {/* Account icon on the right */}
            <div className="flex items-center">
                <User className="h-6 w-6 text-gray-600 cursor-pointer" />
                <p>Hi, Ayush !</p>
            </div>
        </header>
    );
};

export default Header;
