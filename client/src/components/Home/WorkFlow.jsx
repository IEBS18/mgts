// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"

// export default function WorkFlow() {
//   const [hoveredTab, setHoveredTab] = useState(null)
//   const [activeTab, setActiveTab] = useState(null)

//   const workflowSteps = [
//     {
//       title: "Disease Overview",
//       description: "Understand disease biology, risks, and treatment protocols.",
//       dotPosition: "top",
//     },
//     {
//       title: "Competitive Landscape",
//       description: "Explore key players, product portfolios, and opportunities.",
//       dotPosition: "bottom",
//     },
//     {
//       title: "Price Prediction",
//       description: "Analyze clinical programs and discover key innovators.",
//       dotPosition: "top",
//     },
//     {
//       title: "Formulary Analysis",
//       description: "Review insurance coverage and preferred medications.",
//       dotPosition: "bottom",
//     },
//     {
//       title: "R&D Formulations",
//       description: "Analyze ingredients and uncover new therapeutic applications.",
//       dotPosition: "top",
//     },
//   ]

//   // Handle tab interaction
//   const handleTabInteraction = (index) => {
//     setHoveredTab(index)
//     // Optional: Add sound effect here
//   }

//   const handleTabClick = (index) => {
//     setActiveTab(activeTab === index ? null : index)
//   }

//   // Determine if a tab should show its description
//   const shouldShowDescription = (index) => {
//     return hoveredTab === index || activeTab === index
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
//       <div className="max-w-5xl w-full">
//         {/* Title */}
//         <motion.h1
//           className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           Pharmaceutical Research Workflow
//         </motion.h1>

//         {/* Workflow Arrow */}
//         <div className="relative flex items-center justify-center mb-40 mt-20">
//           {/* Arrow Body */}
//           <div className="w-full h-16 flex">
//             {workflowSteps.map((step, index) => (
//               <motion.div
//                 key={index}
//                 className="relative flex-1 flex items-center justify-center cursor-pointer"
//                 onMouseEnter={() => handleTabInteraction(index)}
//                 onMouseLeave={() => setHoveredTab(null)}
//                 onClick={() => handleTabClick(index)}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: index * 0.1,
//                   type: "spring",
//                   stiffness: 100,
//                 }}
//               >
//                 {/* Tab Background with Arrow Shape */}
//                 <div className="absolute inset-0 bg-orange-500 flex items-center">
//                   {/* White gap on the left (except for first tab) */}
//                   {index > 0 && (
//                     <div className="absolute left-0 h-full w-2 bg-slate-50 flex items-center justify-center">
//                       <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-slate-50 relative left-[2px]"></div>
//                     </div>
//                   )}

//                   {/* White gap on the right (except for last tab) */}
//                   {index < workflowSteps.length - 1 && (
//                     <div className="absolute right-0 h-full w-2 bg-slate-50 flex items-center justify-center z-10">
//                       <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-slate-50 relative right-[2px]"></div>
//                     </div>
//                   )}

//                   {/* Arrow Shape */}
//                   {index < workflowSteps.length - 1 && (
//                     <div className="absolute right-[-12px] w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-l-[12px] border-l-orange-500 z-20"></div>
//                   )}
//                 </div>

//                 {/* Tab Title with Glow Effect */}
//                 <motion.h3
//                   className="text-white font-medium text-sm md:text-base z-20 px-2 text-center"
//                   animate={{
//                     textShadow: shouldShowDescription(index)
//                       ? "0 0 8px rgba(255,255,255,0.8)"
//                       : "0 0 0px rgba(255,255,255,0)",
//                   }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {step.title}
//                 </motion.h3>

//                 {/* Active/Selected Indicator */}
//                 {activeTab === index && (
//                   <motion.div
//                     className="absolute inset-0 bg-orange-600 z-10 opacity-60"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 0.3 }}
//                     exit={{ opacity: 0 }}
//                   />
//                 )}

//                 {/* Dot */}
//                 <motion.div
//                   className={`absolute ${step.dotPosition === "top" ? "-top-8" : "-bottom-8"} left-1/2 transform -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full z-20 flex items-center justify-center`}
//                   initial={{ scale: 1, boxShadow: "0 0 0 rgba(239, 68, 68, 0)" }}
//                   animate={{
//                     scale: shouldShowDescription(index) ? [1, 1.2, 1] : 1,
//                     boxShadow: shouldShowDescription(index)
//                       ? "0 0 15px rgba(239, 68, 68, 0.7)"
//                       : "0 0 0 rgba(239, 68, 68, 0)",
//                   }}
//                   transition={{
//                     duration: 0.5,
//                     repeat: shouldShowDescription(index) ? Number.POSITIVE_INFINITY : 0,
//                     repeatType: "reverse",
//                   }}
//                 >
//                   {/* Inner dot pulse effect */}
//                   {shouldShowDescription(index) && (
//                     <motion.div
//                       className="absolute w-2 h-2 bg-white rounded-full"
//                       animate={{
//                         scale: [0.5, 1.5, 0.5],
//                         opacity: [0.7, 1, 0.7],
//                       }}
//                       transition={{
//                         duration: 1.5,
//                         repeat: Number.POSITIVE_INFINITY,
//                         ease: "easeInOut",
//                       }}
//                     />
//                   )}
//                 </motion.div>

//                 {/* Connecting Line Animation */}
//                 {shouldShowDescription(index) && (
//                   <motion.div
//                     className={`absolute ${step.dotPosition === "top" ? "top-0 h-[32px] -translate-y-full" : "bottom-0 h-[32px] translate-y-full"} left-1/2 transform -translate-x-1/2 w-[2px] bg-gradient-to-${step.dotPosition === "top" ? "t" : "b"} from-orange-500 to-orange-300 z-10`}
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: "32px", opacity: 1 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     {/* Traveling light effect */}
//                     <motion.div
//                       className="absolute w-full h-[10px] bg-gradient-to-b from-white/80 to-transparent"
//                       initial={{
//                         [step.dotPosition === "top" ? "bottom" : "top"]: 0,
//                         opacity: 0,
//                       }}
//                       animate={{
//                         [step.dotPosition === "top" ? "bottom" : "top"]: "100%",
//                         opacity: [0, 1, 0],
//                       }}
//                       transition={{
//                         duration: 0.8,
//                         repeat: Number.POSITIVE_INFINITY,
//                         ease: "easeInOut",
//                       }}
//                     />
//                   </motion.div>
//                 )}

//                 {/* Description Text Box */}
//                 <AnimatePresence>
//                   {shouldShowDescription(index) && (
//                     <motion.div
//                       className={`absolute ${step.dotPosition === "top" ? "-top-32" : "-bottom-32"} left-1/2 transform -translate-x-1/2 w-72 z-30`}
//                       initial={{ opacity: 0, y: step.dotPosition === "top" ? -20 : 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: step.dotPosition === "top" ? -10 : 10 }}
//                       transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
//                     >
//                       <motion.div
//                         className="bg-white rounded-lg p-4 shadow-xl border border-orange-200"
//                         initial={{ scale: 0.9 }}
//                         animate={{
//                           scale: 1,
//                           boxShadow: [
//                             "0 10px 25px -5px rgba(249, 115, 22, 0.1), 0 8px 10px -6px rgba(249, 115, 22, 0.1)",
//                             "0 20px 25px -5px rgba(249, 115, 22, 0.2), 0 8px 10px -6px rgba(249, 115, 22, 0.2)",
//                             "0 10px 25px -5px rgba(249, 115, 22, 0.1), 0 8px 10px -6px rgba(249, 115, 22, 0.1)",
//                           ],
//                         }}
//                         transition={{
//                           duration: 0.2,
//                           boxShadow: {
//                             duration: 2,
//                             repeat: Number.POSITIVE_INFINITY,
//                             repeatType: "reverse",
//                           },
//                         }}
//                       >
//                         <p className="text-gray-800 text-sm leading-relaxed">{step.description}</p>
//                         <div
//                           className={`absolute ${step.dotPosition === "top" ? "bottom-[-8px]" : "top-[-8px]"} left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-${step.dotPosition === "top" ? "b" : "t"} border-${step.dotPosition === "top" ? "r" : "l"} border-orange-200`}
//                         ></div>
//                       </motion.div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Interactive Particles on Hover */}
//                 {shouldShowDescription(index) && (
//                   <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
//                     {[...Array(5)].map((_, i) => (
//                       <motion.div
//                         key={i}
//                         className="absolute w-1 h-1 bg-white rounded-full opacity-70"
//                         initial={{
//                           x: `calc(50% + ${Math.random() * 40 - 20}px)`,
//                           y: "50%",
//                           opacity: 0,
//                         }}
//                         animate={{
//                           y: ["50%", `${step.dotPosition === "top" ? "0%" : "100%"}`, "50%"],
//                           opacity: [0, 0.8, 0],
//                           scale: [0.8, 1.2, 0.8],
//                         }}
//                         transition={{
//                           duration: 1 + Math.random() * 1.5,
//                           delay: Math.random() * 0.5,
//                           repeat: Number.POSITIVE_INFINITY,
//                           repeatType: "loop",
//                         }}
//                       />
//                     ))}
//                   </motion.div>
//                 )}
//               </motion.div>
//             ))}
//           </div>

//           {/* Arrow Tip */}
//           <motion.div
//             className="w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-l-[12px] border-l-orange-500"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.5 }}
//           />
//         </div>

//         {/* Instructions */}
//         <motion.div
//           className="text-center text-gray-600 text-sm mt-8"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5, delay: 1 }}
//         >
//           <p>Hover over or click on any section to explore details</p>
//         </motion.div>
//       </div>
//     </div>
//   )
// }


import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function WorkFlow() {
  const [hoveredTab, setHoveredTab] = useState(null)
  const [activeTab, setActiveTab] = useState(null)

  const workflowSteps = [
    {
      title: "Disease Overview",
      description: "Understand disease biology, risks, and treatment protocols.",
      dotPosition: "top",
    },
    {
      title: "Competitive Landscape",
      description: "Explore key players, product portfolios, and opportunities.",
      dotPosition: "bottom",
    },
    {
      title: "Price Prediction",
      description: "Analyze clinical programs and discover key innovators.",
      dotPosition: "top",
    },
    {
      title: "Formulary Analysis",
      description: "Review insurance coverage and preferred medications.",
      dotPosition: "bottom",
    },
    {
      title: "R&D Formulations",
      description: "Analyze ingredients and uncover new therapeutic applications.",
      dotPosition: "top",
    },
  ]

  // Handle tab interaction
  const handleTabInteraction = (index) => {
    setHoveredTab(index)
  }

  const handleTabClick = (index) => {
    setActiveTab(activeTab === index ? null : index)
  }

  // Determine if a tab should show its description
  const shouldShowDescription = (index) => {
    return hoveredTab === index || activeTab === index
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="max-w-5xl w-full">
        {/* Title */}
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Pharmaceutical Research Workflow
        </motion.h1>

        {/* Workflow Arrow */}
        <div className="relative flex items-center justify-center mb-40 mt-20">
          {/* Arrow Body */}
          <div className="w-full h-16 flex">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative flex-1 flex items-center justify-center cursor-pointer"
                onMouseEnter={() => handleTabInteraction(index)}
                onMouseLeave={() => setHoveredTab(null)}
                onClick={() => handleTabClick(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                {/* Tab Background with Arrow Shape */}
                <div className="absolute inset-0 bg-[#a6ce39] flex items-center">
                  {/* White gap on the left (except for first tab) */}
                  {index > 0 && (
                    <div className="absolute left-0 h-full w-2 bg-slate-50 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-slate-50 relative left-[2px]"></div>
                    </div>
                  )}

                  {/* White gap on the right (except for last tab) */}
                  {index < workflowSteps.length - 1 && (
                    <div className="absolute right-0 h-full w-2 bg-slate-50 flex items-center justify-center z-10">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-slate-50 relative right-[2px]"></div>
                    </div>
                  )}

                  {/* Arrow Shape */}
                  {index < workflowSteps.length - 1 && (
                    <div className="absolute right-[-12px] w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-l-[12px] border-l-[#a6ce39] z-20"></div>
                  )}
                </div>

                {/* Tab Title with Glow Effect */}
                <motion.h3
                  className="text-white font-medium text-sm md:text-base z-20 px-2 text-center"
                  animate={{
                    textShadow: shouldShowDescription(index)
                      ? "0 0 8px rgba(255,255,255,0.8)"
                      : "0 0 0px rgba(255,255,255,0)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.title}
                </motion.h3>

                {/* Active/Selected Indicator */}
                {activeTab === index && (
                  <motion.div
                    className="absolute inset-0 bg-[#8ccf3f] z-10 opacity-60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {/* Dot */}
                <motion.div
                  className={`absolute ${step.dotPosition === "top" ? "-top-12" : "-bottom-12"} left-1/2 transform -translate-x-1/2 w-5 h-5 bg-[#8ccf3f] rounded-full z-20 flex items-center justify-center`}
                  initial={{ scale: 1, boxShadow: "0 0 0 rgba(161, 206, 57, 0)" }}
                  animate={{
                    scale: shouldShowDescription(index) ? [1, 1.2, 1] : 1,
                    boxShadow: shouldShowDescription(index)
                      ? "0 0 15px rgba(161, 206, 57, 0.7)"
                      : "0 0 0 rgba(161, 206, 57, 0)",
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: shouldShowDescription(index) ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "reverse",
                  }}
                >
                  {/* Inner dot pulse effect */}
                  {shouldShowDescription(index) && (
                    <motion.div
                      className="absolute w-2 h-2 bg-white rounded-full"
                      animate={{
                        scale: [0.5, 1.5, 0.5],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Connecting Line Animation */}
                {shouldShowDescription(index) && (
                  <motion.div
                    className={`absolute ${step.dotPosition === "top" ? "top-0 h-[40px] -translate-y-full" : "bottom-0 h-[40px] translate-y-full"} left-1/2 transform -translate-x-1/2 w-[2px] bg-gradient-to-${step.dotPosition === "top" ? "t" : "b"} from-[#a6ce39] to-[#8ccf3f] z-10`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "40px", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Traveling light effect */}
                    <motion.div
                      className="absolute w-full h-[10px] bg-gradient-to-b from-white/80 to-transparent"
                      initial={{
                        [step.dotPosition === "top" ? "bottom" : "top"]: 0,
                        opacity: 0,
                      }}
                      animate={{
                        [step.dotPosition === "top" ? "bottom" : "top"]: "100%",
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                )}

                {/* Description Text Box */}
                <AnimatePresence>
                  {shouldShowDescription(index) && (
                    <motion.div
                      className={`absolute ${step.dotPosition === "top" ? "-top-40" : "-bottom-40"} left-1/2 transform -translate-x-1/2 w-72 z-30`}
                      initial={{ opacity: 0, y: step.dotPosition === "top" ? -20 : 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: step.dotPosition === "top" ? -10 : 10 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                    >
                      <motion.div
                        className="bg-white rounded-lg p-4 shadow-xl border border-[#a6ce39]"
                        initial={{ scale: 0.9 }}
                        animate={{
                          scale: 1,
                          boxShadow: [
                            "0 10px 25px -5px rgba(161, 206, 57, 0.1), 0 8px 10px -6px rgba(161, 206, 57, 0.1)",
                            "0 20px 25px -5px rgba(161, 206, 57, 0.2), 0 8px 10px -6px rgba(161, 206, 57, 0.2)",
                            "0 10px 25px -5px rgba(161, 206, 57, 0.1), 0 8px 10px -6px rgba(161, 206, 57, 0.1)",
                          ],
                        }}
                        transition={{
                          duration: 0.2,
                          boxShadow: {
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          },
                        }}
                      >
                        <p className="text-gray-800 text-sm leading-relaxed">{step.description}</p>
                        <div
                          className={`absolute ${step.dotPosition === "top" ? "bottom-[-8px]" : "top-[-8px]"} left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-${step.dotPosition === "top" ? "b" : "t"} border-${step.dotPosition === "top" ? "r" : "l"} border-[#a6ce39]`}
                        ></div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interactive Particles on Hover */}
                {shouldShowDescription(index) && (
                  <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                        initial={{
                          x: `calc(50% + ${Math.random() * 40 - 20}px)`,
                          y: "50%",
                          opacity: 0,
                        }}
                        animate={{
                          y: ["50%", `${step.dotPosition === "top" ? "0%" : "100%"}`, "50%"],
                          opacity: [0, 0.8, 0],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 1 + Math.random() * 1.5,
                          delay: Math.random() * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Arrow Tip */}
          <motion.div
            className="w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-l-[12px] border-l-[#a6ce39]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </div>

        {/* Instructions */}
        <motion.div
          className="text-center text-gray-600 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <p>Hover over or click on any section to explore details</p>
        </motion.div>
      </div>
    </div>
  )
}
