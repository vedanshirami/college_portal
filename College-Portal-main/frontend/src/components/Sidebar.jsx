import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  RxDashboard, 
  RxPerson, 
  RxReader, 
  RxFileText, 
  RxBarChart,
  RxExit 
} from "react-icons/rx";
import { 
  MdPeople, 
  MdBook, 
  MdAssignment,
  MdSchool,
  MdEvent
} from "react-icons/md";

const Sidebar = ({ menuItems, selectedMenu, onMenuSelect, userType, isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const iconMap = {
    home: <RxDashboard className="text-xl" />,
    student: <MdPeople className="text-xl" />,
    faculty: <RxPerson className="text-xl" />,
    branch: <MdSchool className="text-xl" />,
    notice: <RxFileText className="text-xl" />,
    exam: <MdAssignment className="text-xl" />,
    subjects: <MdBook className="text-xl" />,
    admin: <RxPerson className="text-xl" />,
    timetable: <MdEvent className="text-xl" />,
    material: <RxReader className="text-xl" />,
    marks: <RxBarChart className="text-xl" />,
    "student info": <MdPeople className="text-xl" />,
  };

  const logoutHandler = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`w-64 bg-dark-800 border-r border-dark-700 h-screen flex flex-col fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-dark-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <MdSchool className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">College</h1>
              <p className="text-gray-400 text-xs">{userType} Panel</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <RxExit className="text-xl rotate-180" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="text-gray-500 text-xs font-semibold uppercase px-4 mb-3">
            Navigation
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = selectedMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onMenuSelect(item.id);
                    if (setIsOpen) setIsOpen(false);
                  }}
                  className={`w-full sidebar-item ${
                    isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                  }`}
                >
                  <span className={isActive ? "text-primary-400" : ""}>
                    {iconMap[item.id] || <RxDashboard className="text-xl" />}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-dark-700 space-y-2">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-dark-700 rounded-lg transition-all duration-200"
          >
            <RxExit className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
