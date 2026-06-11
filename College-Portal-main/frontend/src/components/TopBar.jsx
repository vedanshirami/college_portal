import React from "react";
import { RxMagnifyingGlass, RxBell, RxReload, RxHamburgerMenu } from "react-icons/rx";
import { MdFilterList, MdFileDownload } from "react-icons/md";

const TopBar = ({ title, subtitle, setSidebarOpen }) => {
  return (
    <div className="bg-dark-900 border-b border-dark-700 px-4 md:px-8 py-4 md:py-6 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 bg-dark-800 text-gray-400 hover:text-white rounded-lg border border-dark-700"
            onClick={() => setSidebarOpen && setSidebarOpen(prev => !prev)}
          >
            <RxHamburgerMenu className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 truncate max-w-[200px] sm:max-w-none">{title}</h1>
            <p className="text-gray-400 text-xs md:text-sm truncate max-w-[200px] sm:max-w-none">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="bg-dark-800 border border-dark-700 text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-all"
            />
            <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          </div>

          <button className="md:hidden p-2.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all border border-dark-700">
            <RxMagnifyingGlass className="text-xl" />
          </button>

          {/* Action Buttons */}
          <button className="hidden sm:block p-2.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all border border-dark-700">
            <MdFilterList className="text-xl" />
          </button>
          
          <button className="hidden sm:block p-2.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all border border-dark-700">
            <MdFileDownload className="text-xl" />
          </button>
          
          <button className="hidden sm:block p-2.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all border border-dark-700">
            <RxReload className="text-xl" />
          </button>
          
          <button className="relative p-2.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all border border-dark-700">
            <RxBell className="text-xl" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-dark-900"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
