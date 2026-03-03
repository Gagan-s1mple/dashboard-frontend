"use client";

import { NavigationBar } from "@/src/components/dashboard/navigation-bar";
import Footer from "@/src/components/footer/footer";
import { Pricing } from "@/src/components/Pricing/pricing";

export default function PricingPage() {
    return (
        <main>
            <NavigationBar />
            <div className="max-w-4xl mx-auto px-6 py-16">
                <Pricing />
            </div>
            <Footer />
        </main>
    );
}
