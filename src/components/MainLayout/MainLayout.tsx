import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { useState } from "react";
import CallSideBar from "../CallSideBar/CallSideBar";
import { useAuth } from "../../context/AuthContext";
import { use } from "cytoscape";

export default function MainLayout() {
    
    const [isOpen, setIsOpen] = useState(false)
    
    const { isAuthenticated, logout } = useAuth();
    
    return (
        <>
            <CallSideBar isOpen={isOpen} setIsOpen={setIsOpen} />
            
            {isOpen &&
                <SideBar
                    username="Viviany Silva" 
                    frame={isAuthenticated ? 1 : 0}
                    onLogout={logout}
                />
            }
            <main>
                <Outlet />
            </main>
        </>
    );
}