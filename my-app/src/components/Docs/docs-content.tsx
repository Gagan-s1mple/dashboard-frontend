"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/src/components/ui/badge";
import {
    Stepper,
    StepperDescription,
    StepperIndicator,
    StepperItem,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "@/src/components/ui/stepper";
import { DocSection, DocSubSection, DocContentBlock } from "./docs-data";

interface DocsContentProps {
    sections: DocSection[];
    activeSubSection: string;
}

function renderBlock(block: DocContentBlock, index: number) {
    switch (block.type) {
        case "paragraph":
            return (
                <p key={index} className="docs-paragraph text-base md:text-lg leading-relaxed tracking-tight text-muted-foreground">
                    {block.text}
                </p>
            );

        case "heading":
            return (
                <h4 key={index} className="text-xl font-bold mt-4 mb-2 tracking-tight text-foreground">
                    {block.text}
                </h4>
            );

        case "list":
            return (
                <ul key={index} className="docs-list space-y-3 my-4">
                    {block.items?.map((item, i) => {
                        const dashIndex = item.indexOf(" — ") !== -1 ? item.indexOf(" — ") : item.indexOf(" - ");
                        if (dashIndex !== -1) {
                            const title = item.substring(0, dashIndex);
                            const rest = item.substring(dashIndex);
                            return (
                                <li key={i} className="docs-list-item flex items-start gap-3 text-muted-foreground">
                                    <span className="docs-list-bullet mt-2" />
                                    <span className="text-base">
                                        <span className="font-bold text-foreground">{title}</span>{rest}
                                    </span>
                                </li>
                            );
                        }
                        return (
                            <li key={i} className="docs-list-item flex items-start gap-3 text-muted-foreground">
                                <span className="docs-list-bullet mt-2" />
                                <span className="text-base">{item}</span>
                            </li>
                        );
                    })}
                </ul>
            );

        case "callout":
            return (
                <div
                    key={index}
                    className={`docs-callout rounded-lg border p-4 my-6 ${block.variant === "tip"
                        ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                        : block.variant === "warning"
                            ? "bg-amber-50/50 border-amber-100 text-amber-900"
                            : "bg-blue-50/50 border-blue-100 text-blue-900"
                        }`}
                >
                    <p className="text-sm font-medium leading-relaxed">{block.text}</p>
                </div>
            );

        default:
            return null;
    }
}

function findActiveContent(
    sections: DocSection[],
    activeSubSectionId: string
): { section: DocSection; subSection: DocSubSection } | null {
    for (const section of sections) {
        for (const sub of section.subSections) {
            if (sub.id === activeSubSectionId) {
                return { section, subSection: sub };
            }
        }
    }
    return null;
}

export default function DocsContent({
    sections,
    activeSubSection,
}: DocsContentProps) {
    const [activeStep, setActiveStep] = useState<number>(1);
    const result = findActiveContent(sections, activeSubSection);

    if (!result) {
        return (
            <main className="docs-content">
                <div className="docs-content-inner">
                    <div className="flex flex-col gap-6 py-12 text-center items-center">
                        <Badge variant="outline" className="w-fit">Welcome</Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-regular tracking-tighter max-w-3xl">
                            Master Adro Analytics
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed tracking-tight">
                            Upload raw data and get instant AI-powered insights. No SQL, no configuration, just answers.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full">
                            {['Upload', 'Ask', 'Analyze', 'Export'].map((step, i) => (
                                <div key={step} className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
                                    <span className="text-xs font-bold text-primary mb-2 block uppercase tracking-widest">Step 0{i + 1}</span>
                                    <h5 className="font-semibold text-lg">{step}</h5>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const { section, subSection } = result;

    return (
        <main className="docs-content">
            <div className="docs-content-inner px-4 md:px-8 lg:px-12 py-10 md:py-16">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4">
                        {subSection.badge && (
                            <Badge variant="outline" className="w-fit">{subSection.badge}</Badge>
                        )}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl md:text-4xl lg:text-6xl tracking-tighter font-bold max-w-2xl">
                                {subSection.title}
                            </h1>
                            <div className="docs-breadcrumb flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <span>{section.title}</span>
                                <span>/</span>
                                <span className="text-foreground">{subSection.title}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stepper View if SubSection has steps */}
                    {subSection.steps && subSection.steps.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
                            <div className="lg:col-span-8 order-2 lg:order-1">
                                <div className="rounded-2xl border bg-muted/30 aspect-video overflow-hidden shadow-sm relative group">
                                    <Image
                                        src={subSection.steps[activeStep - 1]?.image || "/logo.png"}
                                        alt={`Step ${activeStep}`}
                                        fill
                                        className="object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                </div>
                                <div className="mt-8 space-y-6">
                                    {subSection.content.map((block, i) => renderBlock(block, i))}
                                </div>
                            </div>

                            <div className="lg:col-span-4 order-1 lg:order-2">
                                <Stepper
                                    value={activeStep}
                                    onValueChange={setActiveStep}
                                    orientation="vertical"
                                    className="min-w-[280px]"
                                >
                                    {subSection.steps.map(({ title, description }, idx) => {
                                        const stepNum = idx + 1;
                                        return (
                                            <StepperItem
                                                key={idx}
                                                step={stepNum}
                                                className="relative items-start"
                                            >
                                                <StepperTrigger
                                                    className="items-start pb-12 last:pb-0 group/trigger"
                                                    onClick={() => setActiveStep(stepNum)}
                                                >
                                                    <StepperIndicator className="group-hover/trigger:border-primary transition-colors" />
                                                    <div className="mt-0.5 space-y-1 px-2 text-left">
                                                        <StepperTitle className="text-sm md:text-base">{title}</StepperTitle>
                                                        <StepperDescription className="text-xs md:text-sm line-clamp-2">
                                                            {description}
                                                        </StepperDescription>
                                                    </div>
                                                </StepperTrigger>
                                                {stepNum < (subSection.steps?.length || 0) && (
                                                    <StepperSeparator className="absolute inset-y-0 left-4 top-[2.25rem] -order-1 m-0 -translate-x-1/2 h-[calc(100%-2.25rem)]" />
                                                )}
                                            </StepperItem>
                                        );
                                    })}
                                </Stepper>
                            </div>
                        </div>
                    ) : (
                        /* Regular View if no steps */
                        <div className="flex flex-col gap-10">
                            {subSection.mainImage && (
                                <div className="rounded-2xl border bg-muted/30 aspect-[21/9] overflow-hidden shadow-sm relative">
                                    <Image
                                        src={subSection.mainImage}
                                        alt={subSection.title}
                                        fill
                                        className="object-contain p-8"
                                    />
                                </div>
                            )}
                            <div className="max-w-3xl space-y-6">
                                {subSection.content.map((block, i) => renderBlock(block, i))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Navigation */}
                    <div className="docs-bottom-nav flex justify-between gap-4 mt-20 pt-8 border-t">
                        {(() => {
                            const allSubs = sections.flatMap((s) =>
                                s.subSections.map((sub) => ({
                                    ...sub,
                                    sectionTitle: s.title,
                                }))
                            );
                            const currentIndex = allSubs.findIndex((s) => s.id === activeSubSection);
                            const prev = currentIndex > 0 ? allSubs[currentIndex - 1] : null;
                            const next = currentIndex < allSubs.length - 1 ? allSubs[currentIndex + 1] : null;

                            return (
                                <>
                                    {prev ? (
                                        <button
                                            onClick={() => {
                                                setActiveStep(1);
                                                window.dispatchEvent(new CustomEvent("docs-navigate", { detail: prev.id }));
                                            }}
                                            className="group flex flex-col items-start gap-2 p-4 rounded-xl border hover:bg-muted/50 transition-all text-left max-w-[240px]"
                                        >
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Previous</span>
                                            <span className="font-semibold text-primary group-hover:underline">{prev.title}</span>
                                        </button>
                                    ) : <div />}
                                    {next && (
                                        <button
                                            onClick={() => {
                                                setActiveStep(1);
                                                window.dispatchEvent(new CustomEvent("docs-navigate", { detail: next.id }));
                                            }}
                                            className="group flex flex-col items-end gap-2 p-4 rounded-xl border hover:bg-muted/50 transition-all text-right max-w-[240px]"
                                        >
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next</span>
                                            <span className="font-semibold text-primary group-hover:underline">{next.title}</span>
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </main>
    );
}
