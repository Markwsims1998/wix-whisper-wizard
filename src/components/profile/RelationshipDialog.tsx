
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, X, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RelationshipStatus } from "@/components/profile/types";

export interface RelationshipDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRelationshipStatus: string | null;
  setSelectedRelationshipStatus: (status: string | null) => void;
  relationshipPartners: string[];
  handleRemovePartner: (partnerId: string) => void;
  availablePartners: any[];
  partnerSearchOpen: boolean;
  setPartnerSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleAddPartner: (partnerId: string) => void;
  relationshipStatuses: RelationshipStatus[];
  handleSaveRelationship: () => void;
}

const RelationshipDialog = ({
  open,
  setOpen,
  selectedRelationshipStatus,
  setSelectedRelationshipStatus,
  relationshipPartners,
  handleRemovePartner,
  availablePartners,
  partnerSearchOpen,
  setPartnerSearchOpen,
  searchQuery,
  setSearchQuery,
  handleAddPartner,
  relationshipStatuses,
  handleSaveRelationship
}: RelationshipDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Relationship Status</DialogTitle>
          <DialogDescription>
            Update your relationship status here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={selectedRelationshipStatus || ''} 
            onValueChange={setSelectedRelationshipStatus}
            className="space-y-2"
          >
            {relationshipStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <RadioGroupItem value={status.name} id={status.id} />
                <Label htmlFor={status.id} className="cursor-pointer text-base">{status.name}</Label>
              </div>
            ))}
          </RadioGroup>
          
          {/* Partner section - only show if "In a relationship" or similar is selected */}
          {(selectedRelationshipStatus === 'In a relationship' || 
            selectedRelationshipStatus === 'Married' || 
            selectedRelationshipStatus === 'Engaged') && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-2">With:</h4>
              
              {relationshipPartners.length > 0 ? (
                <div className="space-y-2">
                  {relationshipPartners.map((partnerId) => {
                    const partner = availablePartners.find(p => p.id === partnerId);
                    return (
                      <div key={partnerId} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={partner?.avatar_url} alt={partner?.full_name} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{partner?.full_name || partnerId}</span>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={() => handleRemovePartner(partnerId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No partners added yet.
                </p>
              )}
              
              <Popover open={partnerSearchOpen} onOpenChange={setPartnerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-2">
                    <Search className="mr-2 h-4 w-4" />
                    Add Partner
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4">
                    <Input
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <ScrollArea className="h-72">
                      {availablePartners
                        .filter(partner => 
                          !relationshipPartners.includes(partner.id) && 
                          partner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((partner) => (
                          <div 
                            key={partner.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
                            onClick={() => handleAddPartner(partner.id)}
                          >
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={partner.avatar_url} alt={partner.full_name} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span>{partner.full_name}</span>
                            </div>
                          </div>
                        ))
                      }
                      
                      {availablePartners.filter(partner => 
                        !relationshipPartners.includes(partner.id) && 
                        partner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <p className="p-2 text-gray-500">No matches found.</p>
                      )}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleSaveRelationship} className="w-full sm:w-auto">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipDialog;
