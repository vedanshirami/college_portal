import React, { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import Events from "./Events";
import Achievements from "./Achievements";
import Projects from "./Projects";

const MENU_ITEMS = [
  { id: "events", label: "Events", component: Events },
  { id: "achievements", label: "Achievements", component: Achievements },
  { id: "projects", label: "Projects", component: Projects },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("events");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [society, setSociety] = useState(null);
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        const resp = await axiosWrapper.get("/coordinator/my-details", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        setProfileData(resp.data?.data || null);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load coordinator details");
      }
    };

    const fetchSocieties = async () => {
      try {
        const resp = await axiosWrapper.get("/coordinator/societies", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const list = resp.data?.data || [];
        setSociety(list[0] || null);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load assigned society");
      }
    };

    fetchMyDetails();
    fetchSocieties();
  }, [userToken]);

  const MenuItem = useMemo(
    () => MENU_ITEMS.find((i) => i.id === selectedMenu)?.component,
    [selectedMenu]
  );

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar
        menuItems={MENU_ITEMS}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        userType="Coordinator"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 md:ml-64 w-full">
        <TopBar
          title={`Welcome${profileData?.firstName ? `, ${profileData.firstName}` : ""}`}
          subtitle={society?.name ? `Managing: ${society.name}` : "No society assigned"}
          setSidebarOpen={setIsSidebarOpen}
        />

        <div className="p-4 md:p-8 overflow-x-hidden">
          {!society ? (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-slate-300">
              You are not assigned to any society. Please contact admin.
            </div>
          ) : (
            MenuItem && <MenuItem societyId={society._id} />
          )}
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default Home;
