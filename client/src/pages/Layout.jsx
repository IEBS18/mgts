// import React from 'react'
// import Sidebar from '@/components/Sidebar'

// const Layout = ({ children }) => {
//   return (
//     <div className="flex">
//       <Sidebar/>
//       <div className="flex-1 overflow-y-auto">
//         {children}
//       </div>
//     </div>
//   )
// }

// export default Layout


import React from 'react';
import Sidebar from '@/components/Sidebar';

const Layout = ({ type, children }) => {
  return (
    <div className="flex">
      {/* Pass type prop to Sidebar */}
      <Sidebar type={type} /> 
      <div className="flex-1 overflow-y-auto bg-gray-100">{children}</div> {/* Apply bg-gray-100 for content area */}
    </div>
  );
};

export default Layout;
