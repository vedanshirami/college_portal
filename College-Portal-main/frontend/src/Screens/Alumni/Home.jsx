import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StudentConnect from "./StudentConnect";

const MENU_ITEMS = [{ id: "studentconnect", label: "Student Connect", component: StudentConnect }];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("studentconnect");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        const resp = await axiosWrapper.get("/alumni/my-details", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        setProfileData(resp.data?.data || null);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load alumni details");
      }
    };
    fetchMyDetails();
  }, [userToken]);

  const MenuItem = MENU_ITEMS.find((i) => i.id === selectedMenu)?.component;

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar
        menuItems={MENU_ITEMS}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        userType="Alumni"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 md:ml-64 w-full">
        <TopBar
          title={`Welcome${profileData?.firstName ? `, ${profileData.firstName}` : ""}`}
          subtitle="Connect with students"
          setSidebarOpen={setIsSidebarOpen}
        />

        <div className="p-4 md:p-8 overflow-x-hidden">{MenuItem && <MenuItem />}</div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default Home;
