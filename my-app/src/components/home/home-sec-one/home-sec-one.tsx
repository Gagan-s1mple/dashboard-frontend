"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RocketIcon, ShieldCheckIcon, ZapIcon, BarChartIcon, FileBoxIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import Image from "next/image";
import Link from "next/link";
import DisplayCards from "../../ui/display-cards";
import { GlowEffect } from "../../ui/glow-effect";

const frameworkCards = [
    {
        icon: (
            <Image
                src="/export.png"
                alt="Export & Share"
                width={60}
                height={60}
                className="h-16 w-16 transition-opacity group-hover:opacity-100"
            />
        ),
        title: "Export & Share",
        description: "Download as PNG, JPG, Excel or PDF",
        className:
            "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
        icon: (
            <Image
                src="/dashboard.png"
                alt="AI Dashboard Generation"
                width={60}
                height={60}
                className="h-16 w-16 transition-opacity group-hover:opacity-100"
            />
        ),
        title: "AI Dashboards",
        description: "Generate insights using Claude 4.6",
        className:
            "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
        icon: (
            <Image
                src="/csv.png"
                alt="CSV & Excel Upload"
                width={60}
                height={60}
                className="h-16 w-16 transition-opacity group-hover:opacity-100"
            />
        ),
        title: "Upload Data",
        description: "Import CSV or Excel files instantly",
        className:
            "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
];

const features = [
    {
        icon: RocketIcon,
        title: "Instant Dashboards",
        description:
            "Our AI generates interactive dashboards from your data in seconds, no coding required.",
    },
    {
        icon: ShieldCheckIcon,
        title: "Secure Data Upload",
        description:
            "Upload datasets safely and manage your information with complete privacy.",
    },
    {
        icon: ZapIcon,
        title: "AI-Powered Insights",
        description:
            "Our LLM uses smart agents to produce charts, KPIs, tables, and textual summaries automatically.",
    },
    {
        icon: BarChartIcon,
        title: "Interactive Visuals",
        description:
            "Explore dashboards with fully interactive charts and visualizations, plus dynamic insights generated in real-time.",
    },
    {
        icon: FileBoxIcon,
        title: "Download & Share",
        description:
            "Export dashboards as PDFs, images, or raw data for reporting or sharing.",
    },
];

const HomeSecOne = memo(() => {
    return (
        <>
            {/* Hero Section */}
            <div className="w-full pb-16 pt-24 flex items-center xl:px-0 relative">
                <div className="w-full flex justify-center px-4 sm:px-6">
                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="relative z-10 flex flex-col justify-center w-full md:col-span-4"
                        >
                            <div className="space-y-4 max-w-4xl mx-auto">
                                <div className="flex justify-center text-center">
                                    <p className="text-neutral-600 text-xl sm:text-2xl md:text-3xl">
                                        Easy to use.
                                    </p>
                                </div>

                                <div className="tracking-tighter text-center">
                                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                        <h1 className="font-semibold bg-gradient-to-b from-black to-gray-500 bg-clip-text text-transparent text-3xl sm:text-5xl md:text-6xl lg:text-7xl dark:from-white dark:to-black">
                                            AI Dashboard Builder.
                                        </h1>
                                    </div>
                                </div>

                                <div className="flex justify-center text-center">
                                    <p className="text-neutral-600 text-lg sm:text-xl md:text-2xl">
                                        AI dashboards, instantly generated !
                                    </p>
                                </div>

                                <div className="flex justify-center gap-4 sm:flex-row pt-4">
                                    <div className="relative">
                                        <GlowEffect
                                            colors={["#808080", "#FF00FF", "#00FFFF"]}
                                            mode="colorShift"
                                            blur="soft"
                                            duration={3}
                                            scale={0.9}
                                        />
                                        <Link href="/login" className="relative z-20 group">
                                            <Button
                                                size="lg"
                                                className="relative z-10 group border-neutral-800"
                                            >
                                                Get Started
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-16 overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0.0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 1.0,
                        ease: "linear",
                    }}
                    className="container mx-auto space-y-8 px-4 md:px-6"
                >
                    <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-8 lg:items-center mb-20 md:mb-24 lg:mb-32">
                        <div className="flex gap-4 pl-0 lg:pl-20 flex-col flex-1 mb-8 sm:mb-12 lg:mb-0">
                            <div className="space-y-4 text-left pt-4 sm:pt-0">
                                <h2 className="text-4xl font-bold tracking-tighter lg:max-w-xl">
                                    Adro turns simple prompts into fully interactive, customized
                                    dashboards in seconds.
                                </h2>
                                <p className="text-xl text-muted-foreground max-w-xl lg:max-w-sm leading-relaxed">
                                    Adro builds dashboards from simple prompts.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 pb-8 sm:mt-8 lg:mt-0">
                            <div className="w-full px-2 sm:px-0">
                                <DisplayCards cards={frameworkCards} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                            >
                                <Card className="p-0 h-full">
                                    <CardContent className="space-y-2 p-6 flex flex-col h-full">
                                        <feature.icon className="text-primary h-12 w-12" />
                                        <h3 className="font-bold">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm flex-grow">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>
        </>
    );
});

HomeSecOne.displayName = "HomeSecOne";

export default HomeSecOne;
