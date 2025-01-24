import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TagSelectorProps {
  tags: Record<string, number>;
  selectedTag: string;
  onTagChange: (tag: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, selectedTag, onTagChange }) => (
  <Select onValueChange={onTagChange} value={selectedTag}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select a tag" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Tags</SelectLabel>
        <SelectItem value="ALL_TAGS">All</SelectItem>
        {Object.entries(tags)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => (
            <SelectItem key={tag} value={tag}>
              {tag} ({count})
            </SelectItem>
          ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

export default TagSelector;
