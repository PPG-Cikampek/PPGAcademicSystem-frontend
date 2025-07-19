import React, { useState } from 'react';
import { Search, Menu, User, Settings, Bell } from 'lucide-react';

const TestNavBar = ({ variant = 'glass', brandName = 'Brand', items = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(0);

    const variants = {
        default: "bg-white border-b shadow-xs",
        material: "bg-white shadow-md rounded-lg my-2 mx-4",
        minimal: "bg-transparent",
        colored: "bg-blue-600",
        glass: "bg-white/80 backdrop-blur-md border-b"
    };

    const itemVariants = {
        default: "hover:bg-gray-100 px-3 py-2 rounded-lg",
        material: "hover:bg-gray-100 px-4 py-2 rounded-full",
        minimal: "hover:text-blue-600 px-3 py-2",
        colored: "hover:bg-blue-700 px-3 py-2 rounded-lg text-white",
        glass: "hover:bg-black/5 px-3 py-2 rounded-lg"
    };

    const brandVariants = {
        default: "text-gray-800 font-semibold text-xl",
        material: "text-gray-800 font-semibold text-xl",
        minimal: "text-gray-800 font-semibold text-xl",
        colored: "text-white font-semibold text-xl",
        glass: "text-gray-800 font-semibold text-xl"
    };

    const defaultItems = [
        { label: 'Home', href: '#' },
        { label: 'Products', href: '#' },
        { label: 'Services', href: '#' },
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' }
    ];

    const navItems = items.length > 0 ? items : defaultItems;

    return (
        <nav className={`${variants[variant]} px-4 py-2`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center space-x-8">
                    <a href="#" className={brandVariants[variant]}>
                        {brandName}
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className={`${itemVariants[variant]} ${activeItem === index ? 'font-medium' : ''
                                    } transition-colors duration-200`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveItem(index);
                                }}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right side icons */}
                <div className="flex items-center space-x-4">
                    <button className={`${itemVariants[variant]} p-2`}>
                        <Search className={variant === 'colored' ? 'text-white' : 'text-gray-600'} size={20} />
                    </button>
                    <button className={`${itemVariants[variant]} p-2`}>
                        <Settings className={variant === 'colored' ? 'text-white' : 'text-gray-600'} size={20} />
                    </button>
                    <button className={`${itemVariants[variant]} p-2`}>
                        <Bell className={variant === 'colored' ? 'text-white' : 'text-gray-600'} size={20} />
                    </button>
                    <button className={`${itemVariants[variant]} p-2`}>
                        <User className={variant === 'colored' ? 'text-white' : 'text-gray-600'} size={20} />
                    </button>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2"
                    >
                        <Menu className={variant === 'colored' ? 'text-white' : 'text-gray-600'} size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden mt-2 py-2">
                    {navItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className={`block ${itemVariants[variant]} ${activeItem === index ? 'font-medium' : ''
                                } my-1`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveItem(index);
                                setIsOpen(false);
                            }}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default TestNavBar;