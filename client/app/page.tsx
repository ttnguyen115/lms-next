"use client";

import React from "react";
import { Header, Heading } from "@/components";

interface PageProps {}

function Page(props: PageProps) {
  const [open, setOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(0);

  return (
    <div>
      <Heading
        title="E-Learning"
        description="E-Learning is a platform for studenrtrs to learn and get help from teacher"
        keywords="Programming, MGoR, Redux, Machine Learning"
      />
      <Header open={open} setOpen={setOpen} activeItem={activeItem} />
    </div>
  );
}

export default Page;
