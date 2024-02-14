"use client";

import clsx from "clsx";
import Link from "next/link";
import React from "react";

export const navItemsData = [
    {
        name: "Home",
        url: "/",
    },
    {
        name: "Courses",
        url: "/courses",
    },
    {
        name: "About",
        url: "/about",
    },
    {
        name: "Policy",
        url: "/policy",
    },
    {
        name: "FAQ",
        url: "/faq",
    },
];

type Props = {
    activeItem: number;
    isMobile: boolean;
};

const NavItems: React.FC<Props> = ({ activeItem, isMobile }) => {
    return (
        <React.Fragment>
            <div className={clsx(isMobile ? "800px:hidden mt-5" : "hidden 800px:flex")}>
                {isMobile && (
                    <div className="w-full text-center py-6">
                        <Link href="/" passHref>
                            <span className="text-[25px] font-Poppins font-[500] text-black dark:text-white">
                                E-Learning
                            </span>
                        </Link>
                    </div>
                )}
                {navItemsData &&
                    navItemsData.map((item, index) => (
                        <Link href={item.url} key={index} passHref>
                            <span
                                className={clsx(
                                    "text-[18px] px-6 font-Poppins font-[400]",
                                    activeItem === index
                                        ? "dark:text-[#37a39a] text-[crimson]"
                                        : "dark:text-white text-black",
                                    isMobile && "block py-5"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    ))}
            </div>
        </React.Fragment>
    );
};

export default NavItems;
