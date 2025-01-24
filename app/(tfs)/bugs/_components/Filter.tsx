import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  interface Props {
    setFilter: (val: string) => void;
    filter: string;
    data: any[];
    dataKey: string; // Nested keys should be dot-separated (e.g., "system.State")
  }
  
  const CustomFilter: React.FC<Props> = ({ filter, setFilter, data, dataKey }) => {
    // Helper to extract nested value by key path
    const extractValue = (item: any, keyPath: string) => {
      return keyPath.split(".").reduce((obj, key) => (obj ? obj[key] : undefined), item);
    };
  
    // Generate unique filter values
    const options = [
      ...new Set(
        data.map((item) => extractValue(item, dataKey)).filter((val) => val !== undefined)
      ),
    ].sort();
  
    return (
      <div>
        <Select onValueChange={setFilter} value={filter}>
          <SelectTrigger className="w-full dark:border-gray-700">
            <SelectValue placeholder={`All ${dataKey.split(".").pop()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{dataKey.split(".").pop()}</SelectLabel>
              <SelectItem value="N/A">All</SelectItem>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  export default CustomFilter;
  