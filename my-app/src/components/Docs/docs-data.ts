export interface DocStep {
    title: string;
    description: string;
    image: string;
}

export interface DocSubSection {
    id: string;
    title: string;
    badge?: string;
    content: DocContentBlock[];
    steps?: DocStep[];
    mainImage?: string;
}

export interface DocContentBlock {
    type: "paragraph" | "list" | "heading" | "code" | "callout" | "divider";
    text?: string;
    items?: string[];
    variant?: "info" | "tip" | "warning";
}

export interface DocSection {
    id: string;
    title: string;
    subSections: DocSubSection[];
}

export const docsData: DocSection[] = [
    {
        id: "getting-started",
        title: "Getting Started",
        subSections: [
            {
                id: "register-account",
                title: "Register an Account",
                badge: "Getting Started",
                mainImage: "/signup.png",
                content: [
                    {
                        type: "paragraph",
                        text: "To begin using Adro, you need to create an account. The registration process is straightforward and designed to get you up and running quickly.",
                    },
                ],
                steps: [
                    {
                        title: "Visit Website",
                        description: "Go to the Adro official website and click on Sign Up.",
                        image: "/signup-pic.png"
                    },
                    {
                        title: "Fill Details",
                        description: "Complete the registration form with your business email.",
                        image: "/signup-pic-2.png"
                    },
                    {
                        title: "Submit Request",
                        description: "Submit your request for account approval by the admin team.",
                        image: "/signup-pic.png"
                    }
                ]
            },
            {
                id: "login-credits",
                title: "Login & Initial Credits",
                badge: "Authentication",
                content: [
                    {
                        type: "paragraph",
                        text: "After your account is approved and you log in for the first time, you're ready to start exploring Adro's capabilities immediately.",
                    },
                    {
                        type: "heading",
                        text: "Complimentary Credits",
                    },
                    {
                        type: "list",
                        items: [
                            "You will receive 10 complimentary credits upon first login",
                            "1 credit = $1",
                            "Credits are consumed based on platform usage",
                        ],
                    },
                    {
                        type: "callout",
                        variant: "tip",
                        text: "These initial credits allow you to immediately explore Adro's AI-powered dashboard capabilities without any upfront cost.",
                    },
                ],
                steps: [
                    {
                        title: "Visit Login Page",
                        description: "Head to the login portal to access your Adro account.",
                        image: "/login-pic-1.png"
                    },
                    {
                        title: "Enter Credentials",
                        description: "Provide your registered email and password to sign in.",
                        image: "/login-pic-2.png"
                    },
                    {
                        title: "Explore Dashboard",
                        description: "Start analyzing your data with your complimentary credits.",
                        image: "/upload.png"
                    }
                ]
            },
        ],
    },
    {
        id: "uploading-data",
        title: "Uploading Your Data",
        subSections: [
            {
                id: "how-to-upload",
                title: "How to Upload Files",
                badge: "Data Management",
                mainImage: "/upload-pic-1.png",
                content: [
                    {
                        type: "paragraph",
                        text: "Uploading your data to Adro is a simple, guided process that takes just a few clicks.",
                    }
                ],
                steps: [
                    {
                        title: "Open Dashboard",
                        description: "Click the Upload button inside your main dashboard panel.",
                        image: "/upload.png"
                    },
                    {
                        title: "Select File",
                        description: "Choose a CSV or Excel file from your local system.",
                        image: "/upload-pic-2.png"
                    },
                    {
                        title: "Process Data",
                        description: "Wait for Adro to analyze and structure your data automatically.",
                        image: "/upload-pic-3.png"
                    }
                ]
            },
            {
                id: "supported-formats",
                title: "Supported Formats",
                badge: "Specifications",
                content: [
                    {
                        type: "paragraph",
                        text: "Adro supports structured datasets to ensure compatibility with a wide range of business data sources.",
                    },
                    {
                        type: "heading",
                        text: "Accepted File Types",
                    },
                    {
                        type: "list",
                        items: [
                            "CSV (.csv) — Comma-separated values",
                            "Excel (.xlsx) — Microsoft Excel workbooks",
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "asking-questions",
        title: "Asking Questions",
        subSections: [
            {
                id: "natural-language",
                title: "Natural Language Queries",
                badge: "AI Interaction",
                content: [
                    {
                        type: "paragraph",
                        text: "After selecting your dataset, you can begin asking questions in natural, everyday English. No SQL, no formulas, and no technical configuration required.",
                    },
                    {
                        type: "heading",
                        text: "Example Queries",
                    },
                    {
                        type: "list",
                        items: [
                            "\"Show revenue trends over time.\"",
                            "\"Which region performed best?\"",
                            "\"Compare monthly sales performance.\"",
                            "\"Plot a sales Dashboard\"",
                            "\"Show me Product Performance\"",
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "dashboard-generation",
        title: "Dashboard Generation",
        subSections: [
            {
                id: "auto-dashboards",
                title: "Automatic Dashboards",
                badge: "Visualization",
                mainImage: "/dashboard-pic.png",
                content: [
                    {
                        type: "paragraph",
                        text: "Adro automatically creates rich, interactive dashboards from your data — no manual configuration needed.",
                    },
                    {
                        type: "list",
                        items: [
                            "KPI cards — Key performance indicators at a glance",
                            "Interactive charts — Bar, line, pie, and more",
                            "Comparative visualizations — Side-by-side analysis",
                            "AI-generated summaries — Narrative insights from your data",
                        ],
                    },
                ],
                steps: [
                    {
                        title: "Generate Insights",
                        description: "Witness Adro turning your raw data into actionable insights.",
                        image: "/dashboard-pic.png"
                    },
                    {
                        title: "Interact & Explore",
                        description: "Drill down into specific metrics and trends with dynamic charts.",
                        image: "/pic-2.jpg"
                    }
                ]
            },
        ],
    },
    {
        id: "exporting-dashboards",
        title: "Exporting Dashboards",
        subSections: [
            {
                id: "export-formats",
                title: "Export Formats",
                badge: "Reporting",
                mainImage: "/export-pic.png",
                content: [
                    {
                        type: "paragraph",
                        text: "Adro allows you to export your generated dashboards in multiple formats, making it easy to share and present your insights.",
                    },
                    {
                        type: "list",
                        items: [
                            "PNG — High-resolution image export",
                            "Excel — Spreadsheet with underlying data",
                            "PDF — Print-ready document format",
                            "JPG — Image format for easy sharing",

                        ],
                    },
                ],
            },
        ],
    },

];

