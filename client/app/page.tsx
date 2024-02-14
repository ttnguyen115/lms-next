"use client";

import { Header, Heading, Hero } from "@/components";
import React from "react";

interface PageProps {}

const Page: React.FC<PageProps> = (props) => {
    const [open, setOpen] = React.useState(false);
    const [activeItem, setActiveItem] = React.useState(0);
    const [route, setRoute] = React.useState("Login");

    return (
        <div>
            <Heading
                title="E-Learning"
                description="E-Learning is a platform for students to learn and get help from teacher"
                keywords="Programming, MGoR, Redux, Machine Learning"
            />
            <Header
                open={open}
                setOpen={setOpen}
                activeItem={activeItem}
                setRoute={setRoute}
                route={route}
            />
            <Hero />
        </div>
    );
};

export default Page;
