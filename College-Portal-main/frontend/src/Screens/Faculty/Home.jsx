import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdPeople, MdBook, MdAssignment, MdEventNote } from "react-icons/md";
import Notice from "../Notice";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Timetable from "./Timetable";
import Material from "./Material";
import StudentFinder from "./StudentFinder";
import Profile from "./Profile";
import Marks from "./AddMarks";
import Exam from "../Exam";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import AIAssistant from "../../components/AIAssistant";

const MENU_ITEMS = [
  { id: "home", label: "Home", component: null },
  { id: "timetable", label: "Timetable", component: Timetable },
  { id: "material", label: "Material", component: Material },
  { id: "notice", label: "Notice", component: Notice },
  { id: "student info", label: "Student Info", component: StudentFinder },
  { id: "marks", label: "Marks", component: Marks },
  { id: "exam", label: "Exam", component: Exam },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosWrapper.get("/faculty/my-details", {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (response.data.success) {
          setProfileData(response.data.data);
          dispatch(setUserData(response.data.data));
        }
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };

    fetchUserDetails();
  }, [dispatch, userToken]);

  const renderContent = () => {
    if (selectedMenu === "home" && profileData) {
      return (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Classes"
              value="24"
              change="+5%"
              icon={<MdBook className="text-2xl" />}
              color="blue"
            />
            <StatCard
              title="Students"
              value="145"
              change="+8.2%"
              icon={<MdPeople className="text-2xl" />}
              color="green"
            />
            <StatCard
              title="Assignments"
              value="12"
              change="+10%"
              icon={<MdAssignment className="text-2xl" />}
              color="purple"
            />
            <StatCard
              title="Upcoming Events"
              value="5"
              change="+3%"
              icon={<MdEventNote className="text-2xl" />}
              color="orange"
            />
          </div>

          {/* Profile Content */}
          <Profile profileData={profileData} />
        </>
      );
    }

    const menuItem = MENU_ITEMS.find(
      (item) => item.label.toLowerCase() === selectedMenu.toLowerCase()
    );

    if (menuItem && menuItem.component) {
      const Component = menuItem.component;
      return <Component />;
    }

    return null;
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar
        menuItems={MENU_ITEMS}
        selectedMenu={selectedMenu}
        onMenuSelect={(id) => setSelectedMenu(MENU_ITEMS.find(item => item.id === id)?.label || "Home")}
        userType="Faculty"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 md:ml-64 w-full">
        <TopBar 
          title="Welcome Faculty" 
          subtitle="Manage your classes and students"
          setSidebarOpen={setIsSidebarOpen}
        />
        
        <div className="p-4 md:p-8 overflow-x-hidden">
          {renderContent()}
        </div>
      </div>
      
      <Toaster position="bottom-center" />
      <AIAssistant />
    </div>
  );
};

export default Home;
