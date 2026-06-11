import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdPeople, MdAutoGraph, MdRemoveRedEye } from "react-icons/md";
import Notice from "../Notice";
import Student from "./Student";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import Admin from "./Admin";
import Branch from "./Branch";
import Alumni from "./Alumni";
import Societies from "./Societies";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Profile from "./Profile";
import Exam from "../Exam";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import AIAssistant from "../../components/AIAssistant";

const MENU_ITEMS = [
  { id: "home", label: "Home", component: Profile },
  { id: "student", label: "Student", component: Student },
  { id: "faculty", label: "Faculty", component: Faculty },
  { id: "alumni", label: "Alumni", component: Alumni },
  { id: "societies", label: "Societies", component: Societies },
  { id: "branch", label: "Branch", component: Branch },
  { id: "notice", label: "Notice", component: Notice },
  { id: "exam", label: "Exam", component: Exam },
  { id: "subjects", label: "Subjects", component: Subjects },
  { id: "admin", label: "Admin", component: Admin },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading user details...");
      const response = await axiosWrapper.get(`/admin/my-details`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error fetching user details"
      );
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, userToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.pathname]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-400">Loading...</div>
        </div>
      );
    }

    const MenuItem = MENU_ITEMS.find(
      (item) => item.id === selectedMenu
    )?.component;

    if (selectedMenu === "home" && profileData) {
      return (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value="12,345"
              change="+12%"
              icon={<MdPeople className="text-2xl" />}
              color="blue"
            />
            <StatCard
              title="Total Faculty"
              value="456"
              change="+8.2%"
              icon={<MdPeople className="text-2xl" />}
              color="green"
            />
            <StatCard
              title="Active Sessions"
              value="2,456"
              change="+15%"
              icon={<MdAutoGraph className="text-2xl" />}
              color="purple"
            />
            <StatCard
              title="Total Subjects"
              value="89"
              change="-2.4%"
              icon={<MdRemoveRedEye className="text-2xl" />}
              color="orange"
            />
          </div>

          {/* Profile Content */}
          <Profile profileData={profileData} />
        </>
      );
    }

    return MenuItem && <MenuItem />;
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/admin?page=${menuId}`);
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar
        menuItems={MENU_ITEMS}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuClick}
        userType="Admin"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 md:ml-64 w-full">
        <TopBar 
          title="Welcome Admin" 
          subtitle="Here's what's happening with your platform today."
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
