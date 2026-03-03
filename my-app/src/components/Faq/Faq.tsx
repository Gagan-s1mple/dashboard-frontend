"use client";

import React from "react";
import { PhoneCall } from "lucide-react";
import { Badge } from "../ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        id: "faq-1",
        question: "What is Adro?",
        answer: "Adro is an AI-powered data analytics platform that converts CSV and Excel files into intelligent, interactive dashboards instantly. It enables businesses to gain actionable insights without complex BI tools or coding."
    },
    {
        id: "faq-2",
        question: "How does Adro generate dashboards?",
        answer: "Once you upload your dataset, Adro automatically analyzes the structure, identifies key metrics, detects trends, and generates real-time dashboards complete with KPIs and visual insights."
    },
    {
        id: "faq-3",
        question: "Do I need technical skills to use Adro?",
        answer: "No. Adro is designed for founders, analysts, operations teams, and business users. There is no coding required — simply upload your data and let AI handle the analytics."
    },
    {
        id: "faq-4",
        question: "What file formats are supported?",
        answer: "Adro supports CSV and Excel file formats. Enterprise plans may include extended integrations and direct data source connections."
    },
    {
        id: "faq-5",
        question: "Can I customize the dashboards?",
        answer: "Yes. Users can filter, segment, drill down into metrics, and refine dashboards based on their specific business requirements."
    },
    {
        id: "faq-6",
        question: "Is my data secure?",
        answer: "Yes. Adro processes data securely in the cloud with enterprise-grade protection standards to ensure privacy and reliability."
    },

    {
        id: "faq-7",
        question: "Can Adro support enterprise-level analytics?",
        answer: "Yes. Adro offers scalable enterprise solutions including higher data limits, advanced AI insights, custom integrations, and dedicated support."
    }
];

function FAQ() {
    return (
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                    <div className="flex gap-6 md:gap-10 flex-col">
                        <div className="flex gap-4 flex-col">
                            <div>
                                <Badge variant="outline">FAQ</Badge>
                            </div>
                            <div className="flex gap-2 flex-col">
                                <h4 className="text-3xl md:text-4xl lg:text-5xl tracking-tighter max-w-xl text-left font-regular">
                                    Your Questions About Adro, Answered
                                </h4>
                                <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                                    Adro helps you turn raw data into powerful AI-driven dashboards and actionable business insights.
                                </p>
                            </div>

                        </div>
                    </div>
                    <div className="w-full">
                        <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((item) => (
                                <AccordionItem key={item.id} value={item.id}>
                                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { FAQ };