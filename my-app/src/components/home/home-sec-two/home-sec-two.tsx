"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, BarChart3, Database, LineChart, Upload } from "lucide-react";
import { TextGenerateEffect } from "../../ui/text-generate-effect";
import { GlowingEffect } from "../../ui/glowing-effect";
import { cn } from "@/lib/utils";

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3 container">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                                {title}
                            </h3>
                            <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

const HomeSecTwo = () => {
    return (
        <section className="w-full px-4 py-8">
            {/* Text Generate Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: "linear" }}
                className="flex flex-col gap-4 items-center justify-center w-full max-w-4xl mx-auto"
            >
                <div className="text-2xl text-center">
                    <TextGenerateEffect
                        duration={1.5}
                        filter={false}
                        words="Adro turns your CSV and Excel data into intelligent dashboards instantly — no setup, no coding, just powerful insights."
                    />
                </div>
            </motion.div>

            {/* Features Grid Section */}
            <div className="w-full py-16">
                <motion.div
                    initial={{ opacity: 0.0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 1.0,
                        ease: "linear",
                    }}
                    className="container mx-auto"
                >
                    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
                        <GridItem
                            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                            icon={<Upload className="h-4 w-4" />}
                            title="Upload. Done."
                            description="Upload CSV or Excel files and instantly unlock intelligent dashboards."
                        />

                        <GridItem
                            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                            icon={<Database className="h-4 w-4" />}
                            title="AI That Understands Data"
                            description="Adro automatically detects structure, metrics, and patterns — no setup needed."
                        />

                        <GridItem
                            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/2/8]"
                            icon={<BarChart3 className="h-4 w-4" />}
                            title="Dashboards in Seconds"
                            description="Beautiful, interactive dashboards generated instantly from your data."
                        />

                        <GridItem
                            area="md:[grid-area:2/7/3/13] xl:[grid-area:2/5/3/8]"
                            icon={<LineChart className="h-4 w-4" />}
                            title="Actionable Insights"
                            description="Spot trends, anomalies, and growth opportunities with AI-powered analysis."
                        />

                        <GridItem
                            area="md:[grid-area:3/1/4/7] xl:[grid-area:1/8/2/13]"
                            icon={<Zap className="h-4 w-4" />}
                            title="Zero Complexity"
                            description="No coding. No BI tools. Just powerful analytics made simple."
                        />

                        <GridItem
                            area="md:[grid-area:3/7/4/13] xl:[grid-area:2/8/3/13]"
                            icon={<Shield className="h-4 w-4" />}
                            title="Enterprise-Grade Security"
                            description="Secure cloud infrastructure built for reliability and scale."
                        />
                    </ul>
                </motion.div>
            </div>
        </section>
    );
};

export default HomeSecTwo;
