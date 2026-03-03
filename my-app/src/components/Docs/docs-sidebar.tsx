"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DocSection } from "./docs-data";

interface DocsSidebarProps {
    sections: DocSection[];
    activeSubSection: string;
    onSubSectionClick: (subSectionId: string) => void;
}

export default function DocsSidebar({
    sections,
    activeSubSection,
    onSubSectionClick,
}: DocsSidebarProps) {
    // Track which sections are expanded — all open by default
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(sections.map((s) => s.id))
    );

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    return (
        <aside className="docs-sidebar">


            <nav className="docs-sidebar-nav">
                {sections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const hasActiveChild = section.subSections.some(
                        (sub) => sub.id === activeSubSection
                    );

                    return (
                        <div key={section.id} className="docs-sidebar-section">
                            {/* Section header — click to expand/collapse */}
                            <button
                                className={`docs-sidebar-section-header ${hasActiveChild ? "active-parent" : ""
                                    }`}
                                onClick={() => toggleSection(section.id)}
                            >
                                <span className="docs-sidebar-section-header-text">
                                    {section.title}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`docs-sidebar-chevron ${isExpanded ? "rotated" : ""
                                        }`}
                                />
                            </button>

                            {/* Sub-section items — collapsible */}
                            <div
                                className={`docs-sidebar-subitems ${isExpanded ? "expanded" : ""
                                    }`}
                            >
                                {section.subSections.map((sub) => (
                                    <button
                                        key={sub.id}
                                        className={`docs-sidebar-subitem ${activeSubSection === sub.id ? "active" : ""
                                            }`}
                                        onClick={() => onSubSectionClick(sub.id)}
                                    >
                                        {sub.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
