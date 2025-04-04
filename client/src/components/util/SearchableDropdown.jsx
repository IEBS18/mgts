import ReactSelect from 'react-select';

// Reusable SearchableDropdown component
export const SearchableDropdown = ({ 
  options,          // options for the dropdown
  selectedValue,    // selected value in the dropdown
  setSelectedValue, // function to set selected value
  placeholder = "Select...", // default placeholder text
  label = "Select", // optional label text for the dropdown
}) => {
  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption ? selectedOption.value : null);
  };

  return (
    <div className="w-[280px]">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <ReactSelect
        value={options.find((option) => option.value === selectedValue)}  // Set the selected value
        onChange={handleChange}
        options={options}
        className="rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39] z-12"  // Maintain old green border and z-index fix
        placeholder={placeholder}
        isSearchable={true}  // Make it searchable
        styles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 20,  // Fix the dropdown behind the header issue
          }),
          control: (provided, state) => ({
            ...provided,
            borderColor: '#a6ce39',  // Green border for the input
            backgroundColor: 'transparent',  // Make the background transparent
            borderRadius: '16px',  // More rounded corners
            outline: 'none',  // Remove the default blue outline on focus
            '&:hover': { borderColor: '#a6ce39' },  // Hover effect for green border
            boxShadow: state.isFocused ? '0 0 0 3px rgba(166, 206, 57, 0.2)' : 'none', // Add a subtle green shadow on focus
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#a6ce39' : state.isFocused ? '#f1f8e9' : 'transparent',  // Green background when selected
            color: state.isSelected ? 'white' : 'black',  // White text on selected option
            '&:hover': { backgroundColor: '#a6ce39', color: 'white' },  // Green background on hover with white text
          }),
        }}
      />
    </div>
  );
};
