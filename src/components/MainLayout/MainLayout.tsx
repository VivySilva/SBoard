import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { useState } from "react";
import CallSideBar from "../CallSideBar/CallSideBar";

export default function MainLayout() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <CallSideBar isOpen={isOpen} setIsOpen={setIsOpen} />
            {
                isOpen &&
                <SideBar username="Viviany Silva" />
            }
            <main>
                <Outlet />
            </main>
        </>
    );
}