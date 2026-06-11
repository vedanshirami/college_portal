import { useContext } from "react";

const { createContext } = require("react");
const { useState, useEffect } = require("react");
const UserContext = createContext();
export const UserProvider = ({ children }) => {
    const [user,setUser] = useState(null);
    const getCookie = (name) => {
        try{
        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1];
        }catch(err){
            return null;
        }
    };
    useEffect(() => {
        try {
        const fetchUserFromCookie = async () => {
            const userCookie = getCookie("user");
            if (userCookie) {
                const userData = JSON.parse(decodeURIComponent(userCookie));
                setUser(userData.id);
            }
        };
        fetchUserFromCookie();
    } catch (error) {
        console.error("Error fetching user from cookie:", error);
    }
    }, []);
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
export const User = ()=>{
    return useContext(UserContext);
}
