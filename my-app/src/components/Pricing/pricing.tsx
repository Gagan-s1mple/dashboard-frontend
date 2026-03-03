"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
    Card,
    CardHeader,
    CardContent,
} from "../ui/card";

interface PricingProps {
    heading?: string;
    description?: string;
    price?: number;
    freeCredits?: number;
    features?: string[][];
    buttonText?: string;
}

const defaultFeatures = [
    [
        "Build dashboards at less than 0.1 credits",

    ],
    [
        "CSV & Excel Upload",
        "Instant AI Dashboards",
        "Smart KPI Detection",
    ],
    [
        "Interactive Charts & Filters",
        "Download & Export Reports",
        "Secure Cloud Processing",
    ],
    [
        "Unlimited Dashboard Views",
        "Team Collaboration",
        "Priority Email Support",
    ],
];

export const Pricing = ({
    heading = "Pricing",
    description = "Only pay for what you use. No subscriptions. No hidden fees.",
    price = 1,
    freeCredits = 10,
    features = defaultFeatures,
    buttonText = "Get Started",
}: PricingProps) => {
    return (
        <section className="">
            <div className="container">
                <div className="mx-auto max-w-4xl text-center space-y-8">

                    {/* Heading */}
                    <div className="space-y-3">
                        <h2 className="text-5xl font-semibold lg:text-5xl">
                            {heading}
                        </h2>
                        <p className="mx-auto max-w-md text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* Pricing Card */}
                    <Card className="mx-auto max-w-md shadow-sm border">
                        <CardHeader className="items-center text-center space-y-4 pb-4">

                            {/* Free Credits Badge */}
                            <div className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                                Pay-as-you-go
                            </div>

                            {/* Price */}
                            <div className="flex items-end justify-center gap-2">
                                <span className="text-2xl font-bold">
                                    Start with 10 credits from us
                                </span>
                                {/* <span className="text-muted-foreground text-base font-medium">
                                    / 1 Credit
                                </span> */}
                            </div>

                        </CardHeader>

                        <CardContent className="space-y-6 pt-0">
                            {features.map((featureGroup, idx) => (
                                <div key={idx}>
                                    <ul className="space-y-3">
                                        {featureGroup.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span>{feature}</span>
                                                <Check className="size-4 text-primary shrink-0" />
                                            </li>
                                        ))}
                                    </ul>
                                    {idx < features.length - 1 && (
                                        <Separator className="my-6" />
                                    )}
                                </div>
                            ))}

                            <Button asChild className="w-full" size="lg">
                                <Link href="/signup">
                                    {buttonText}
                                </Link>
                            </Button>
                        </CardContent>

                    </Card>
                    <p className="text-muted-foreground text-sm italic">
                        * Credit consumption depends on usage, i.e, number of rows, columns, and complexity of the data and also the length of input and output.
                    </p>
                </div>
            </div>
        </section>
    );
};