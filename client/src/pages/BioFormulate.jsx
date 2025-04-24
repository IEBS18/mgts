// import { Link } from "react-router-dom"
// import { ArrowRight, Database, FlaskRoundIcon as Flask, Microscope, Search, Zap } from "lucide-react"

// export default function BioFormulate() {
//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Hero Section */}
//       {/* <section className="bg-gradient-to-b from-[#6b8e23] to-[#9ACD32] text-white py-16 md:py-24"> */}
//       <section className="bg-white text-[#9ACD32] py-16 md:py-24">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
//             <div className="flex-1 space-y-4 text-center md:text-left">
//               <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
//                 <div className="bg-[#6b8e23] rounded-full p-2">
//                   <Microscope className="h-8 w-8 text-white" />
//                 </div>
//                 <h1 className="text-3xl font-bold">BioFormulate</h1>
//               </div>
//               <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
//                 Unlock New Therapeutic Applications
//               </h2>
//               <p className="text-lg md:text-xl text-black/90 max-w-[600px]">
//                 Analyze pharmaceutical ingredients and uncover new therapeutic applications using patents and research
//                 insights.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
//                 <Link
//                   to="/search"
//                   className="inline-flex h-12 items-center justify-center bg-[#6b8e23] px-6 font-medium text-white shadow transition-colors hover:bg-[#6b8e23]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-lg"
//                 >
//                   Get Started
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Link>
//                 <Link
//                   to="#demo"
//                   className="inline-flex h-12 items-center justify-center rounded-md border border-[#9ACD32] bg-transparent px-6 font-medium text-black shadow-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
//                 >
//                   See Demo
//                 </Link>
//               </div>
//             </div>
//             <div className="flex-1 flex justify-center">
//             <div className="relative w-full max-w-md aspect-square">
//                 <img
//                   src="/placeholder.svg?height=400&width=400"
//                   alt="BioFormulate Visualization"
//                   className="rounded-lg shadow-xl w-full max-w-md aspect-square object-cover"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Why BioFormulate Section */}
//       <section className="py-16 bg-white" id="why">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why BioFormulate?</h2>
//             <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//               Traditional pharmaceutical research is time-consuming and costly. BioFormulate leverages AI and data
//               analytics to accelerate discovery and development.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
//             <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
//               <h3 className="text-xl font-bold text-gray-900 mb-3">The Problem</h3>
//               <ul className="space-y-3">
//                 <li className="flex gap-3">
//                   <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
//                     1
//                   </div>
//                   <p className="text-gray-700">Pharmaceutical research requires analyzing vast amounts of data</p>
//                 </li>
//                 <li className="flex gap-3">
//                   <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
//                     2
//                   </div>
//                   <p className="text-gray-700">Identifying new applications for existing ingredients is challenging</p>
//                 </li>
//                 <li className="flex gap-3">
//                   <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
//                     3
//                   </div>
//                   <p className="text-gray-700">Traditional methods are time-consuming and expensive</p>
//                 </li>
//               </ul>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Our Solution</h3>
//               <p className="text-gray-700 mb-4">
//                 BioFormulate provides a comprehensive platform that analyzes patents, research papers, and clinical data
//                 to uncover new therapeutic applications for existing pharmaceutical ingredients.
//               </p>
//               <p className="text-gray-700">
//                 Our AI-powered system identifies patterns and connections that human researchers might miss,
//                 accelerating the drug development process and reducing costs.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Key Features */}
//       <section className="py-16 bg-gray-50" id="features">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Key Features</h2>
//             <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//               Powerful tools to accelerate pharmaceutical research and development
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-8">
//             <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
//               <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
//                 <Zap className="h-6 w-6 text-[#6b8e23]" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Drug Repurposing Intelligence</h3>
//               <p className="text-gray-700">
//                 Discover new therapeutic applications for existing drugs by analyzing patterns across patents, clinical
//                 trials, and research papers. Our system identifies potential new indications that might have been
//                 overlooked.
//               </p>
//               <ul className="mt-4 space-y-2">
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
//                   <span>Cross-reference drugs with diseases and mechanisms</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
//                   <span>Identify potential off-label applications</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
//                   <span>Analyze justifications for drug use in various conditions</span>
//                 </li>
//               </ul>
//             </div>

//             <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
//               <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
//                 <Flask className="h-6 w-6 text-[#6b8e23]" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Ingredient Intelligence</h3>
//               <p className="text-gray-700">
//                 Analyze pharmaceutical ingredients to understand their properties, interactions, and potential
//                 applications. Our comprehensive database provides insights into stability, composition, and efficacy.
//               </p>
//               <ul className="mt-4 space-y-2">
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
//                   <span>Detailed stability and interaction data</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
//                   <span>Composition characteristics and solution forms</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
//                   <span>Safety and efficacy study results</span>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-16 bg-white" id="how-it-works">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
//             <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//               A simple, powerful workflow to accelerate your research
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="h-16 w-16 rounded-full bg-[#6b8e23] flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
//                 1
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Search</h3>
//               <p className="text-gray-700">
//                 Enter an ingredient or drug name to begin your research. Our system will search across our comprehensive
//                 database.
//               </p>
//             </div>
//             <div className="text-center">
//               <div className="h-16 w-16 rounded-full bg-[#6b8e23] flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
//                 2
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Filter</h3>
//               <p className="text-gray-700">
//                 Select relevant topics and parameters to narrow down your search and focus on specific aspects of
//                 interest.
//               </p>
//             </div>
//             <div className="text-center">
//               <div className="h-16 w-16 rounded-full bg-[#6b8e23] flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
//                 3
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze</h3>
//               <p className="text-gray-700">
//                 Review comprehensive insights, connections, and potential applications based on patents and research
//                 data.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Sample Output / Demo */}
//       <section className="py-16 bg-gray-50" id="demo">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Sample Output</h2>
//             <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//               See how BioFormulate delivers actionable insights
//             </p>
//           </div>

//           <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
//             <div className="bg-[#6b8e23] p-4 flex items-center gap-3">
//               <div className="bg-white rounded-full p-1.5">
//                 <Microscope className="h-6 w-6 text-[#6b8e23]" />
//               </div>
//               <h3 className="text-xl font-bold text-white">BioFormulate</h3>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <button className="py-2 px-4 rounded-md bg-[#6b8e23] text-white font-medium">
//                   Search by Ingredient
//                 </button>
//                 <button className="py-2 px-4 rounded-md bg-white border border-[#6b8e23] text-[#6b8e23] font-medium">
//                   Search by Drug
//                 </button>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Type Ingredient Name"
//                     className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10"
//                     defaultValue="Hyaluronic Acid"
//                   />
//                   <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Select Additional Topics (Tabs)</label>
//                 <div className="flex flex-wrap gap-2">
//                   <button className="py-1.5 px-3 rounded-md bg-[#6b8e23] text-white text-sm">Select All</button>
//                   <button className="py-1.5 px-3 rounded-md border border-[#6b8e23] text-[#6b8e23] text-sm">
//                     Stability Conditions
//                   </button>
//                   <button className="py-1.5 px-3 rounded-md border border-[#6b8e23] text-[#6b8e23] text-sm">
//                     Interaction
//                   </button>
//                   <button className="py-1.5 px-3 rounded-md border border-[#6b8e23] text-[#6b8e23] text-sm">
//                     Composition
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-md">
//                 <h4 className="font-bold text-gray-900 mb-2">Sample Results</h4>
//                 <p className="text-gray-700 mb-3">
//                   Hyaluronic Acid has been identified in 245 patents and 128 research papers.
//                 </p>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-white p-3 rounded border border-gray-200">
//                     <h5 className="font-medium text-gray-900">Key Applications</h5>
//                     <ul className="mt-2 text-sm text-gray-700 space-y-1">
//                       <li>• Dermal fillers</li>
//                       <li>• Osteoarthritis treatment</li>
//                       <li>• Wound healing</li>
//                       <li>• Ophthalmic solutions</li>
//                     </ul>
//                   </div>
//                   <div className="bg-white p-3 rounded border border-gray-200">
//                     <h5 className="font-medium text-gray-900">Emerging Research</h5>
//                     <ul className="mt-2 text-sm text-gray-700 space-y-1">
//                       <li>• Drug delivery systems</li>
//                       <li>• Tissue engineering</li>
//                       <li>• Cancer therapy</li>
//                       <li>• Neural regeneration</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Who It's For */}
//       <section className="py-16 bg-white" id="who-its-for">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
//               Built for Scientists, CDMOs, and R&D Teams
//             </h2>
//             <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//               BioFormulate empowers professionals across the pharmaceutical industry
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
//               <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
//                 <Microscope className="h-6 w-6 text-[#6b8e23]" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Formulators</h3>
//               <p className="text-gray-700">
//                 Optimize compositions with comprehensive data on ingredient interactions, stability conditions, and
//                 formulation characteristics.
//               </p>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
//               <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
//                 <Database className="h-6 w-6 text-[#6b8e23]" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Strategy Teams</h3>
//               <p className="text-gray-700">
//                 Explore drug repurposing opportunities by identifying new therapeutic applications for existing
//                 compounds based on research and patent data.
//               </p>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
//               <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
//                 <Search className="h-6 w-6 text-[#6b8e23]" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">R&D Scientists</h3>
//               <p className="text-gray-700">
//                 Accelerate research by accessing comprehensive data on pharmaceutical ingredients, their properties, and
//                 potential applications.
//               </p>
//             </div>
//           </div>

//           <div className="mt-12 text-center">
//             <div className="inline-flex items-center justify-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800 mb-4">
//               <span className="h-2 w-2 rounded-full bg-[#6b8e23]"></span>
//               Trusted by leading pharmaceutical companies
//             </div>
//             <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-70">
//               <img src="/placeholder.svg?height=40&width=120" alt="Company logo" width={120} height={40} />
//               <img src="/placeholder.svg?height=40&width=120" alt="Company logo" width={120} height={40} />
//               <img src="/placeholder.svg?height=40&width=120" alt="Company logo" width={120} height={40} />
//               <img src="/placeholder.svg?height=40&width=120" alt="Company logo" width={120} height={40} />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 bg-[#6b8e23] text-white">
//         <div className="container mx-auto px-4 md:px-6 text-center">
//           <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
//             Ready to transform your pharmaceutical research?
//           </h2>
//           <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
//             Join leading researchers and companies who are accelerating drug discovery and development with
//             BioFormulate.
//           </p>
//           <Link
//             to="/search"
//             className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 font-medium text-[#6b8e23] shadow transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
//           >
//             Get Started
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </Link>
//           <div className="mt-6 text-sm text-white/80">No credit card required • Free trial available</div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-gray-300 py-12">
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="flex flex-col md:flex-row justify-between gap-8">
//             <div className="md:w-1/3">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="bg-white rounded-full p-1.5">
//                   <Microscope className="h-5 w-5 text-[#6b8e23]" />
//                 </div>
//                 <span className="text-xl font-bold text-white">BioFormulate</span>
//               </div>
//               <p className="text-gray-400 mb-4">
//                 Analyze pharmaceutical ingredients and uncover new therapeutic applications using patents and research
//                 insights.
//               </p>
//               <div className="flex gap-4">
//                 <a href="#" className="text-gray-400 hover:text-white">
//                   <span className="sr-only">Twitter</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//                   </svg>
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white">
//                   <span className="sr-only">LinkedIn</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
//               <div>
//                 <h3 className="text-white font-bold mb-4">Product</h3>
//                 <ul className="space-y-2">
//                   <li>
//                     <a href="#features" className="hover:text-white">
//                       Features
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#demo" className="hover:text-white">
//                       Demo
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Pricing
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       API
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//               <div>
//                 <h3 className="text-white font-bold mb-4">Resources</h3>
//                 <ul className="space-y-2">
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Documentation
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Guides
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Case Studies
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Blog
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//               <div>
//                 <h3 className="text-white font-bold mb-4">Company</h3>
//                 <ul className="space-y-2">
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       About
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Careers
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Contact
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Privacy
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-gray-400">
//             <p>© {new Date().getFullYear()} BioFormulate. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }


import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Database, FlaskRoundIcon as Flask, Microscope, Search, Zap } from "lucide-react"
import bioformulate from './bioformulate.jpg'
import { motion } from 'framer-motion';
import { useState } from "react";

export default function BioFormulate() {
   const [selectedTabsDrug, setSelectedTabsDrug] = useState(["Disease",
      "Justification_for_Drug_Use",
      "Disease_Mechanism",
      "Disease_Microbes",
      "Drug_Mechanism",
      "Drug_Microbes",
      "Disease_Sources",
      "Drug_Sources",]);
  const navigate = useNavigate();
      
 
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-white text-[#6b8e23] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="bg-[#6b8e23] rounded-full p-2">
                  <Microscope className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold">BioFormulate</h1>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-gray-900">
                Rifaximin Reimagined
              </h2>
              <h4 className="text-xl md:text-xl lg:text-2xl font-bold tracking-tighter text-gray-900">
              Discovering New Applications via Mechanistic Analysis
              </h4>
              <p className="text-lg md:text-xl text-black/90 max-w-[600px]">
              Explore BioFormulate's AI-driven platform to
                evaluate Rifaximin's role in disease pathways, offering insights for drug repurposing in unexplored
                therapeutic areas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <button
                  onClick={() => {
                    navigate("/rnd-formulation-drugs", {
                      state: {
                        selectedTabs: selectedTabsDrug,
                      },
                    })}}
                  className="inline-flex h-12 items-center justify-center bg-[#6b8e23] px-6 font-medium text-white shadow transition-colors hover:bg-[#6b8e23]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-[20px]"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              
              <motion.div
          className="relative w-full max-w-md aspect-square"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img
            src={bioformulate}
            alt="BioFormulate Visualization"
            className="rounded-lg shadow-xl w-full max-w-md aspect-square object-cover"
          />
        </motion.div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Why BioFormulate Section */}
      <section className="py-16 bg-white" id="why">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why BioFormulate?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Traditional drug repurposing lacks depth, speed, and mechanistic clarity. BioFormulate is an AI-powered
              platform that brings precision, flexibility, and scientific rigor to the repurposing process—starting with
              Rifaximin and extending beyond.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">The Problem</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
                    1
                  </div>
                  <p className="text-gray-700">
                    Overwhelming Data: Pharmaceutical research requires processing massive volumes of unstructured
                    data—from research papers to clinical studies.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
                    2
                  </div>
                  <p className="text-gray-700">
                    Challenging Discovery: Identifying new applications for existing drugs is difficult without
                    mechanistic clarity or comprehensive cross-disease analysis.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
                    3
                  </div>
                  <p className="text-gray-700">
                    Most Efforts Lack Mechanistic Backing: Most repurposing efforts rely on generic associations without
                    mechanistic backing.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
                    4
                  </div>
                  <p className="text-gray-700">
                    Lack of Comparative Benchmarking: Difficulty in comparing multiple diseases against a drug on a
                    single standardized scale.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
                    5
                  </div>
                  <p className="text-gray-700">
                    Rigid & Manual Benchmarking: Traditional approaches lack flexibility—researchers can't easily adjust
                    key parameters (KPIs) to reprioritize diseases.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#6b8e23] flex items-center justify-center text-white font-medium">
                    6
                  </div>
                  <p className="text-gray-700">
                    Time-Consuming & Expensive: Manual literature reviews and traditional development paths are slow,
                    costly, and resource-intensive.
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Solution</h3>
              <p className="text-gray-700 mb-4">
                BioFormulate accelerates drug repurposing by providing an AI-powered intelligence layer that:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
                  <span>Maps drugs to diseases via mechanism-of-action and biological relevance</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
                  <span>
                    Analyzes real-world evidence, patents, research publications, and clinical trials to uncover
                    repurposing signals
                  </span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
                  <span>Identifies novel off-label opportunities and emerging therapeutic use-cases</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#6b8e23]"></div>
                  <span>Backs decisions with mechanistic justifications and cross-validation across data sources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gray-50" id="features">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Key Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven repurposing tool to accelerate pharmaceutical research and development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom KPI Weighting</h3>
              <p className="text-gray-700">
                Users can tailor how diseases are ranked based on priority indicators, allowing for personalized
                analysis that matches specific research goals.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Flask className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mechanism-Driven Insights</h3>
              <p className="text-gray-700">
                Go beyond symptoms—analyze and align drug mechanisms (like Rifaximin's) with disease biology at a
                molecular level to validate therapeutic relevance.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Full Visibility</h3>
              <p className="text-gray-700">
                Analyze both top-ranked and long-tail diseases with side-by-side benchmarking data for comprehensive
                evaluation of repurposing opportunities.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8 mx-20">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">End-to-End Justification</h3>
              <p className="text-gray-700">
                Get precise, mechanistic reasons for why a drug like Rifaximin should or should not work in each disease
                context. Each match is backed by microbe associations, mechanisms, and source references.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Faster Decision-Making</h3>
              <p className="text-gray-700">
                Streamlined platform reduces time from hypothesis to actionable insight, allowing researchers to make
                informed decisions about drug repurposing opportunities quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white" id="how-it-works">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              A simple, powerful workflow to accelerate your research
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="h-16 w-16 rounded-full bg-[#6b8e23] flex items-center justify-center mb-4 text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Column Selection & Filtering</h3>
              <p className="text-gray-700">
                Select which mapped columns (like disease mechanism, drug mechanism, microbes, sources, etc.) to include
                or exclude for analysis, helping narrow down the search and focus on specific aspects of interest.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="h-16 w-16 rounded-full bg-[#6b8e23] flex items-center justify-center mb-4 text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Benchmark and Analyze Diseases</h3>
              <p className="text-gray-700">
                View benchmarking of top diseases and customize KPI weightages, if needed, to match specific priorities.
                Analyze high-ranking diseases in detail to assess rifaximin's repurposing potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-gray-50" id="who-its-for">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Scientists, CDMOs, and R&D Teams Driving Drug Repurposing
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              BioFormulate empowers professionals across the pharmaceutical industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Microscope className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Strategy Teams</h3>
              <h2 className="text-[16px] font-bold text-gray-900 mb-3">Discover repurposing paths backed by biology</h2>
              <p className="text-gray-700">
                Use BioFormulate to explore new therapeutic applications for existing drugs like Rifaximin—grounded in mechanistic insights, disease pathways, and
                reference-backed associations, not just symptom overlaps.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">R&D Scientists</h3>
              <h2 className="text-[16px] font-bold text-gray-900 mb-3">Validate drug-disease fit with confidence</h2>
              <p className="text-gray-700">
                Accelerate research by comparing drug mechanisms with disease biology at the molecular level. Gain clarity on where and why a drug may work—or not—using microbiome
                links, pathways, and supporting evidence.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-[#6b8e23]/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-[#6b8e23]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">CDMOs & Translational Teams</h3>
              <h2 className="text-[16px] font-bold text-gray-900 mb-3">Support smarter development decisions</h2>
              <p className="text-gray-700">
                Help partners or clients prioritize repurposing opportunities
                with end-to-end biological justification, saving time and resources in early-stage R&D.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#6b8e23] text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to transform your pharmaceutical research?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Join leading researchers and companies who are uncovering new indications and validating drug potential
            using BioFormulate
          </p>
          <button
                  onClick={() => {
                    navigate("/rnd-formulation-drugs", {
                      state: {
                        selectedTabs: selectedTabsDrug,
                      },
                    })}}
                  className="inline-flex h-12 items-center justify-center bg-white px-6 font-medium text-[#6b8e23] shadow transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-[20px]"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white rounded-full p-1.5">
                  <Microscope className="h-5 w-5 text-[#6b8e23]" />
                </div>
                <span className="text-xl font-bold text-white">BioFormulate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Discover new therapeutic applications for known drugs through mechanistic evidence, microbial links, and
                real-world research
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#features" className="hover:text-white">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="hover:text-white">
                      How It Works
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Resources</h3>
                <ul className="space-y-2">
                  
                  <li>
                    <a href="https://insimine.com/case-studies" target="_blank" className="hover:text-white">
                      Case Studies
                    </a>
                  </li>
                  <li>
                    <a href="https://insimine.com/blogs" target="_blank" className="hover:text-white">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="https://insimine.com/aboutus" target="_blank" className="hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="https://insimine.com/bookings" target="_blank" className="hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} BioFormulate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
