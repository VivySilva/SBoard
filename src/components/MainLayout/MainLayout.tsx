import { Outlet, useNavigate, Navigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { useState, useEffect } from "react";
import CallSideBar from "../CallSideBar/CallSideBar";
import { useAuth } from "../../context/Auth/AuthContext";
import { use } from "cytoscape";

export default function MainLayout() {
    
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <>
            <CallSideBar isOpen={isOpen} setIsOpen={setIsOpen} />
            
            {isOpen &&
                <SideBar
                    username={user?.name || "Username"}
                    frame={isAuthenticated ? 1 : 0}
                    onLogout={logout}
                    userPhotoUrl={user?.photo}
                />
            }
            <main>
                <Outlet />
            </main>
        </>
    );
}