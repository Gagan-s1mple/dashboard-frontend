"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, Instagram, Linkedin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";



const sections = [
  {
    title: "Product",
    links: [
      { name: "Live Demo", href: "/#live-demo" },
      { name: "Guide", href: "/docs" },
      { name: "Pricing", href: "/pricing" },

    ],
  },
  {
    title: "Company",
    links: [
      { name: "About ADRO", href: "/" },
      { name: "Contact", href: "contact" }, // Special handling for contact
    ],
  },
  {
    title: "Support",
    links: [
      { name: "FAQs", href: "/faq" },
      
    ],
  },
];

const Footer = () => {
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="w-full relative -mt-8 z-20 text-slate-800  overflow-hidden">
      {/* Glassmorphism Layers */}
      {/* <div
        className="absolute inset-0 border-t border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
        }}
      /> */}

      {/* Light Glow Gradient */}




      <div className="relative px-8 md:px-12 pt-8 pb-8 bg-transparent backdrop-blur-xl text-slate-800">
        {/* Your Existing Footer Content Here */}
      </div>

      <div className="relative px-8 md:px-12 pt-8 pb-8 bg-transparent backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-24">
          {/* Logo and Description - Leftmost alignment and more width */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-0 w-fit transition-transform hover:scale-[1.02] active:scale-95">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-white/20 bg-white/10 shadow-sm backdrop-blur-sm">
                <Image
                  src="/logo.png"
                  alt="ADRO Logo"
                  width={40}
                  height={40}
                  className="object-cover rounded-full p-1"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent ml-3 tracking-tight">
                ADRO
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm font-medium opacity-90">
              ADRO is an AI-powered data analytics platform that transforms CSV and Excel files into intelligent dashboards and actionable insights in seconds.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-slate-200/50 hover:border-blue-500/50 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 group" aria-label="Instagram">
                <Instagram className="w-4 h-4 group-hover:scale-110" />
              </a>

              <a href="https://www.linkedin.com/company/equilibrate-ai" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-slate-200/50 hover:border-blue-500/50 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 group" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      {link.href === "contact" ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setShowContact(!showContact)}
                            className="text-sm text-left text-slate-600 hover:text-blue-600 transition-colors duration-200"
                          >
                            {link.name}
                          </button>
                          {showContact && (
                            <div className="flex flex-col gap-1.5 mt-1 border-l-2 border-blue-100 pl-3 py-1 bg-blue-50/30 rounded-r-lg">
                              <a href="mailto:support@equilibrateai.com" className="text-xs flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
                                <Mail className="w-3 h-3" /> support@equilibrateai.com
                              </a>
                              <a href="tel:+919606024155" className="text-xs flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
                                <Phone className="w-3 h-3" /> +91-9606024155
                              </a>
                            </div>
                          )}
                        </div>
                      ) : link.href === "terms" ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-sm text-left text-slate-600 hover:text-blue-600 transition-colors duration-200">
                              {link.name}
                            </button>
                          </DialogTrigger>
                         
                        </Dialog>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom Bar - Centered */}
        <div className="mt-6 pt-8 border-t border-slate-200/20 flex flex-col items-center justify-center gap-6">
          <div className="text-xs text-slate-500 font-medium text-center">
            © {new Date().getFullYear()} ADRO. All rights reserved. • Built for modern data teams
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;