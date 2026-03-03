"use client";

import React from "react";
import { NavigationBar } from "@/src/components/dashboard/navigation-bar";
import HomeSecOne from "./home-sec-one/home-sec-one";
import HomeSecTwo from "./home-sec-two/home-sec-two";
import HomeSecThree from "./home-sec-three/home-sec-three";

const HomePage = () => {
    return (
        <main className="overflow-x-hidden">
            <NavigationBar />
            <HomeSecOne />
            <HomeSecTwo />
            <HomeSecThree />
        </main>
    );
};

export default HomePage;


