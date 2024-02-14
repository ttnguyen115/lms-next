"use client";

import { CustomModal, NavItems, ThemeSwitcher } from "@/components";
import { Login } from "@/components/Auth";
import { APP_ROUTES } from "@/constants";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";

type HeaderProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
    setRoute: (route: string) => void;
    route: string;
};

function Header({ open, setOpen, activeItem, setRoute, route }: Readonly<HeaderProps>) {
    const [active, setActive] = React.useState(false);
    const [openSidebar, setOpenSidebar] = React.useState(false);

    if (typeof window !== "undefined") {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 80) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    }

    const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLDivElement).id === "screen") {
            setOpenSidebar(false);
        }
    };

    const mobileSidebar = (): JSX.Element => (
        <div
            className="fixed w-full h-screen top-0 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]"
            onClick={handleClose}
            id="screen"
        >
            <div className="w-[70%] fixed z-[9999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
                <NavItems activeItem={activeItem} isMobile={true} />
                <HiOutlineUserCircle
                    size={25}
                    className="cursor-pointer ml-5 my-2 text-black dark:text-white"
                    onClick={() => setOpen(true)}
                />
            </div>
        </div>
    );

    return (
        <div className="w-full relative">
            <div
                className={clsx(
                    "w-full border-b h-[80px]",
                    active
                        ? "dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 z-[80] dark:border-[#ffffff]"
                        : "dark:border-[#ffffff1c] dark:shadow"
                )}
            >
                <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
                    <div className="w-full h-[80px] flex items-center justify-between p-3">
                        <div>
                            <Link
                                href="/"
                                className="text-[25px] font-Poppins font-[500] text-black dark:text-white"
                            >
                                E-Learning
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <NavItems activeItem={activeItem} isMobile={false} />
                            <ThemeSwitcher />
                            <HiOutlineMenuAlt3
                                size={25}
                                className="800px:hidden cursor-pointer dark:text-white text-black"
                                onClick={() => setOpenSidebar(true)}
                            />
                            <HiOutlineUserCircle
                                size={25}
                                className="hidden 800px:block cursor-pointer dark:text-white text-black"
                                onClick={() => setOpen(true)}
                            />
                        </div>
                    </div>
                </div>
                {openSidebar && mobileSidebar()}
            </div>
            {route === APP_ROUTES.LOGIN && (
                <>
                    {open && (
                        <CustomModal
                            open={open}
                            setOpen={setOpen}
                            setRoute={setRoute}
                            activeItem={activeItem}
                            component={Login}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default React.memo(Header);
