"use client";

import { motion } from 'framer-motion'
import React from "react";
import AnimatedBackground from '../../ui/animated-background';
import { Check } from "lucide-react";
import { Badge } from "../../ui/badge";

const ClaudeLogo = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            clipRule="evenodd"
            viewBox="0 0 512 512"
            className={className}
        >
            <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042" />
            <path
                fill="#1F1F1E"
                fillRule="nonzero"
                d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"
            />
        </svg>
    )
}

const DeepSeekLogo = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 509.64"
            className={className}
        >
            <rect width="512" height="509.64" rx="115" fill="#4D6BFE" />
        </svg>
    )
}

const OpenAILogo = ({ className }: { className?: string }) => {
    return (
        <svg
            className={className}
            width="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="14" cy="14" r="14" fill="currentColor" />
        </svg>
    )
}

/* ✅ Updated for ADRO */

const integrationDetails = {
    uploadData: {
        title: 'Upload Your Dataset',
        steps: [
            'Upload CSV or Excel files instantly',
            'Automatic column and data type detection',
            'No technical setup required'
        ]
    },
    generateDashboards: {
        title: 'Generate AI Dashboards',
        steps: [
            'Instant interactive dashboard creation',
            'Auto-generated KPIs and visual insights',
            'Trend and anomaly detection powered by AI'
        ]
    },
    customizeInsights: {
        title: 'Explore & Customize Insights',
        steps: [
            'Filter and drill down into key metrics',
            'Refine dashboards based on business needs',
            'Export insights for reporting and decisions'
        ]
    }
};

export default function LandingSecFive() {
    return (
        <div className="w-full py-16">
            <motion.div
                initial={{ opacity: 0.0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 1.0,
                    ease: "easeOut",
                }}
                className="container mx-auto"
            >
                <div className="grid rounded-lg container p-6 grid-cols-1 gap-6 items-center lg:grid-cols-2">
                    <div className="flex gap-6 flex-col">
                        <div className="flex gap-3 flex-col">
                            <div>
                                <Badge variant="outline">AI Data Analytics</Badge>
                            </div>
                            <div className="flex gap-2 flex-col">
                                <motion.h2
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="text-3xl lg:text-5xl tracking-tighter max-w-xl text-left font-regular"
                                >
                                    Turn Raw Data into Instant Dashboards with Adro.
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left"
                                >
                                    Upload your CSV or Excel file and let AI generate powerful dashboards and insights in seconds.
                                </motion.p>
                            </div>
                        </div>

                        <AnimatedBackground
                            className="rounded-lg bg-gray-100/80 dark:bg-gray-800/80 reltive"
                            transition={{
                                type: 'spring',
                                bounce: 0.2,
                                duration: 0.6,
                            }}
                            enableHover
                        >
                            {Object.values(integrationDetails).map((detail, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.2,
                                        ease: "easeOut"
                                    }}
                                    data-id={`detail-${index}`}
                                    className="w-full border-b last:border-0 border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex select-none flex-col gap-4 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            </div>
                                            <p className="font-medium text-zinc-800">
                                                {detail.title}
                                            </p>
                                        </div>
                                        <ul className="ml-7 space-y-2">
                                            {detail.steps.map((step, stepIndex) => (
                                                <li key={stepIndex} className="text-sm text-zinc-600 list-disc">
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatedBackground>
                    </div>

                    <motion.div
                        id="live-demo"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative aspect-square rounded-md overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-muted"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full relative">
                                <video
                                    className="w-full h-full object-cover"
                                    controls
                                    poster="/video-thumbnail.jpg"
                                    width="300"
                                    height="300"
                                    autoPlay
                                >
                                    <source src="/videos/CJS.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}