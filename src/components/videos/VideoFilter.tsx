
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface VideoFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const VideoFilter = ({ activeCategory, onCategoryChange }: VideoFilterProps) => {
  const categories = [
    { id: 'all', name: 'All Videos' },
    { id: 'trending', name: 'Trending' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'music', name: 'Music' },
    { id: 'sports', name: 'Sports' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'education', name: 'Education' }
  ];

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="w-full h-auto flex overflow-x-auto no-scrollbar bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {categories.map(category => (
          <TabsTrigger 
            key={category.id}
            value={category.id} 
            className="px-3 py-1.5 text-sm"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default VideoFilter;
