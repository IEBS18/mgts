// import React, { useMemo } from "react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { ArrowUpDown, ChevronDown, Download } from "lucide-react";
// import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
// import { toast } from "react-toastify"; // For user feedback

// const DiseaseTab = ({
//   diseaseInfo,
//   allowedKeys,
//   selectedTopics,
//   handleTopicSelection,
//   isDiseaseExporting,
//   handleDiseaseExport,
//   selectedDiseaseData,
//   handleRelevantDrugsSearch, // Function to fetch and display relevant drugs
// }) => {
//   // Define table data
//   const tableData = useMemo(() => {
//     return Object.entries(diseaseInfo)
//       .filter(([key]) => allowedKeys.includes(key))
//       .sort(([keyA], [keyB]) => allowedKeys.indexOf(keyA) - allowedKeys.indexOf(keyB))
//       .map(([key, value]) => ({
//         topic: key,
//         overview: value,
//       }))
//       .filter(({ topic }) =>
//         selectedTopics.length === 0 || selectedTopics.includes(topic)
//       );
//   }, [diseaseInfo, allowedKeys, selectedTopics]);

//   // Define table columns
//   const columns = useMemo(() => [
//     {
//       id: "select",
//       header: ({ table }) => (
//         <Checkbox
//           checked={table.getIsAllPageRowsSelected()}
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },
//     {
//       accessorKey: "topic",
//       header: ({ column }) => (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Topic
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       ),
//       cell: ({ row }) => <div className="font-medium">{row.getValue("topic")}</div>,
//     },
//     {
//       accessorKey: "overview",
//       header: "Overview",
//       cell: ({ row }) => {
//         const value = row.getValue("overview");
//         return (
//           <div className="max-w-[500px]">
//             {typeof value === 'object' ? (
//               Array.isArray(value) ? (
//                 <ul className="list-disc pl-6">
//                   {value.map((item, idx) => (
//                     <li key={idx}>{item}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div>
//                   {Object.entries(value).map(([subKey, subValue]) => (
//                     <p key={subKey}>
//                       <strong>{subKey}:</strong> {subValue}
//                     </p>
//                   ))}
//                 </div>
//               )
//             ) : (
//               <p>{value}</p>
//             )}
//           </div>
//         );
//       },
//     },
//   ], []);

//   // Initialize table with react-table
//   const tableInstance = useReactTable({
//     data: tableData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel({ pageSize: tableData.length }), // Show all rows
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     manualPagination: true, // Disable automatic pagination
//     pageCount: 1,
//     state: {
//       sorting: [],
//       columnFilters: [],
//       columnVisibility: {},
//       rowSelection: {},
//     },
//     onSortingChange: () => {}, // No-op since state is not managed here
//     onColumnFiltersChange: () => {},
//     onColumnVisibilityChange: () => {},
//     onRowSelectionChange: () => {},
//   });

//   // Handle export button click
//   const handleExportClick = () => {
//     if (selectedDiseaseData.length === 0) {
//       toast.warn("No rows selected for export.");
//       return;
//     }
//     handleDiseaseExport(selectedDiseaseData);
//   };

//   return (
//     <>
//       <div className="flex items-center mb-4 gap-4 justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Disease Overview: <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Select a Disease"}</span>
//         </h1>
//       </div>

//       <div className="space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg flex-1 flex flex-col overflow-y-auto scrollbar-hide max-h-[75vh]">
//         {diseaseInfo['Disease Overview'] && (
//           <h2 className="font-semibold text-gray-700">{diseaseInfo['Disease Overview']}</h2>
//         )}
//         <div className="flex items-center py-4 gap-2">
//           {/* Filter Topics Dropdown */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button className="rounded-lg bg-green hover:bg-darkBlue text-white">
//                 Filter Topics <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="bg-white pt-3" side="left" align="end">
//               {allowedKeys.map((topic) => (
//                 <DropdownMenuCheckboxItem
//                   key={topic}
//                   checked={selectedTopics.includes(topic)}
//                   onCheckedChange={() => handleTopicSelection(topic)}
//                 >
//                   {topic}
//                 </DropdownMenuCheckboxItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Columns Dropdown */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button className="ml-auto rounded-lg bg-green text-white hover:bg-darkBlue">
//                 Columns <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="bg-white pt-3">
//               {tableInstance.getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => (
//                   <DropdownMenuCheckboxItem
//                     key={column.id}
//                     className="capitalize"
//                     checked={column.getIsVisible()}
//                     onCheckedChange={(value) => column.toggleVisibility(!!value)}
//                   >
//                     {column.id}
//                   </DropdownMenuCheckboxItem>
//                 ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Export Button */}
//           <Button
//             className='bg-green rounded-lg hover:bg-darkBlue text-white'
//             disabled={isDiseaseExporting}
//             onClick={handleExportClick}
//           >
//             <Download className="mr-2 h-4 w-4" />
//             {isDiseaseExporting ? 'Exporting...' : 'Export Selected Rows'}
//           </Button>
//         </div>

//         {/* Data Table */}
//         <div className="rounded-md border overflow-y-auto flex-1">
//           <Table>
//             <TableHeader>
//               {tableInstance.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {tableInstance.getRowModel().rows?.length ? (
//                 tableInstance.getRowModel().rows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={3} className="h-24 text-center">
//                     No results.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Show Relevant Drugs Button */}
//         <div className="flex justify-center mt-4">
//           <Button
//             onClick={handleRelevantDrugsSearch} // Function passed as prop
//             className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
//           >
//             Show Relevant Drugs
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DiseaseTab;



// DiseaseTab.jsx

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, Download } from "lucide-react";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import { toast } from "react-toastify"; // For user feedback
import { cn } from "@/utils/cn"; // Adjust the import path as necessary

const DiseaseTab = ({
  diseaseInfo,
  allowedKeys,
  selectedTopics,
  handleTopicSelection,
  isDiseaseExporting,
  handleDiseaseExport,
  selectedDiseaseData,
  handleRelevantDrugsSearch, // Function to fetch and display relevant drugs
}) => {
  // Define table data
  const tableData = useMemo(() => {
    return Object.entries(diseaseInfo)
      .filter(([key]) => allowedKeys.includes(key))
      .sort(([keyA], [keyB]) => allowedKeys.indexOf(keyA) - allowedKeys.indexOf(keyB))
      .map(([key, value]) => ({
        topic: key,
        overview: value,
      }))
      .filter(({ topic }) =>
        selectedTopics.length === 0 || selectedTopics.includes(topic)
      );
  }, [diseaseInfo, allowedKeys, selectedTopics]);

  // Define table columns
  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "topic",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Topic
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("topic")}</div>,
    },
    {
      accessorKey: "overview",
      header: "Overview",
      cell: ({ row }) => {
        const value = row.getValue("overview");
        return (
          <div className="max-w-[500px]">
            {typeof value === 'object' ? (
              Array.isArray(value) ? (
                <ul className="list-disc pl-6">
                  {value.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div>
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <p key={subKey}>
                      <strong>{subKey}:</strong> {subValue}
                    </p>
                  ))}
                </div>
              )
            ) : (
              <p>{value}</p>
            )}
          </div>
        );
      },
    },
  ], []);

  // Initialize table with react-table
  const tableInstance = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel({ pageSize: tableData.length }), // Show all rows
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // Disable automatic pagination
    pageCount: 1,
    state: {
      sorting: [],
      columnFilters: [],
      columnVisibility: {},
      rowSelection: {},
    },
    onSortingChange: () => {}, // No-op since state is not managed here
    onColumnFiltersChange: () => {},
    onColumnVisibilityChange: () => {},
    onRowSelectionChange: () => {},
  });

  // Handle export button click
  const handleExportClick = () => {
    if (selectedDiseaseData.length === 0) {
      toast.warn("No rows selected for export.");
      return;
    }
    handleDiseaseExport(selectedDiseaseData);
  };

  return (
    <>
      <div className="flex items-center mb-4 gap-4 justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Disease Overview: <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Select a Disease"}</span>
        </h1>
      </div>

      <div className="space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg flex-1 flex flex-col overflow-y-auto scrollbar-hide max-h-[75vh]">
        {diseaseInfo['Disease Overview'] && (
          <h2 className="font-semibold text-gray-700">{diseaseInfo['Disease Overview']}</h2>
        )}
        <div className="flex items-center py-4 gap-2">
          {/* Filter Topics Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-lg bg-green hover:bg-darkBlue text-white">
                Filter Topics <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white pt-3" side="left" align="end">
              {allowedKeys.map((topic) => (
                <DropdownMenuCheckboxItem
                  key={topic}
                  checked={selectedTopics.includes(topic)}
                  onCheckedChange={() => handleTopicSelection(topic)}
                >
                  {topic}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Columns Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto rounded-lg bg-green text-white hover:bg-darkBlue">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white pt-3">
              {tableInstance.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Button */}
          <Button
            className='bg-green rounded-lg hover:bg-darkBlue text-white'
            disabled={isDiseaseExporting}
            onClick={handleExportClick}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDiseaseExporting ? 'Exporting...' : 'Export Selected Rows'}
          </Button>
        </div>

        {/* Data Table */}
        <div className="rounded-md border overflow-y-auto flex-1">
          <Table>
            <TableHeader>
              {tableInstance.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableInstance.getRowModel().rows?.length ? (
                tableInstance.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Show Relevant Drugs Button */}
        <div className="mt-auto flex justify-center">
          <Button
            onClick={handleRelevantDrugsSearch} // Function passed as prop
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            Show Relevant Drugs
          </Button>
        </div>
      </div>
    </>
  );
};

export default DiseaseTab;
