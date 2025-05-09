
import { Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryOption {
  id: string;
  name: string;
}

interface VideoFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: CategoryOption[];
}

const VideoFilter = ({ selectedCategory, setSelectedCategory, categories }: VideoFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter:</span>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <Tabs 
          value={selectedCategory} 
          onValueChange={setSelectedCategory} 
          className="w-full"
        >
          <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex flex-nowrap overflow-x-auto">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="whitespace-nowrap px-3 py-1 text-sm"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default VideoFilter;
