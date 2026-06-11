import React, { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdBook, MdAssignment, MdEventNote, MdGrade } from "react-icons/md";
import Notice from "../Notice";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Timetable from "./Timetable";
import Material from "./Material";
import Profile from "./Profile";
import Exam from "../Exam";
import ViewMarks from "./ViewMarks";
import Alumni from "./Alumni";
import Societies from "./Societies";
import LostAndFound from "./LostAndFound";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import AIAssistant from "../../components/AIAssistant";

const MENU_ITEMS = [
  { id: "home", label: "Home", component: null },
  { id: "timetable", label: "Timetable", component: Timetable },
  { id: "material", label: "Material", component: Material },
  { id: "notice", label: "Notice", component: Notice },
  { id: "exam", label: "Exam", component: Exam },
  { id: "marks", label: "Marks", component: ViewMarks },
  { id: "alumni", label: "Alumni", component: Alumni },
  { id: "societies", label: "Societies", component: Societies },
  { id: "lostandfound", label: "Lost & Found", component: LostAndFound },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading user details...");
      const response = await axiosWrapper.get(`/student/my-details`, {
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
  }, [dispatch, userToken]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-400">Loading...</div>
        </div>
      );
    }

    if (selectedMenu === "home" && profileData) {
      return (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Enrolled Courses"
              value="8"
              change="+2%"
              icon={<MdBook className="text-2xl" />}
              color="blue"
            />
            <StatCard
              title="Assignments"
              value="15"
              change="+5%"
              icon={<MdAssignment className="text-2xl" />}
              color="green"
            />
            <StatCard
              title="Upcoming Exams"
              value="3"
              change="+1%"
              icon={<MdEventNote className="text-2xl" />}
              color="purple"
            />
            <StatCard
              title="Average Grade"
              value="8.5"
              change="+0.5%"
              icon={<MdGrade className="text-2xl" />}
              color="orange"
            />
          </div>

          {/* Profile Content */}
          <Profile profileData={profileData} />
        </>
      );
    }

    const MenuItem = MENU_ITEMS.find((item) => item.id === selectedMenu)?.component;

    return MenuItem && <MenuItem />;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.search]);

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/student?page=${menuId}`);
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar
        menuItems={MENU_ITEMS}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuClick}
        userType="Student"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 md:ml-64 w-full">
        <TopBar 
          title="Welcome Student" 
          subtitle="Access your academic information"
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
