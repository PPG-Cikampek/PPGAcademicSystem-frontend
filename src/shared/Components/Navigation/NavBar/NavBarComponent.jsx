import { useState } from "react";
import { NavLink } from "react-router-dom";

const Navbar = ({ links, logo }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-white shadow-md border-b-2 border-gray-200">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-8 w-auto" />
                    <span className="text-xl font-semibold ml-2 text-gray-700">
                        Brand
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6">
                    {links.map((link, index) => (
                        <NavLink
                            key={index}
                            to={link.path}
                            className={({ isActive }) =>
                                `text-gray-600 hover:text-blue-600 transition pb-3 ${
                                    isActive
                                        ? "border-b-2 border-blue-600"
                                        : "border-b-2 border-transparent"
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-hidden"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                        ></path>
                    </svg>
                </button>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-md z-20 transform transition-transform duration-300 ${
                        isOpen
                            ? "translate-y-0 opacity-100"
                            : "-translate-y-full opacity-0"
                    }`}
                >
                    <div className="px-4 py-3 space-y-2">
                        {links.map((link, index) => (
                            <NavLink
                                key={index}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block text-gray-600 hover:text-blue-600 transition pb-3 ${
                                        isActive
                                            ? "border-b-2 border-blue-600"
                                            : "border-b-2 border-transparent"
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
