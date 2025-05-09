
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type RelationshipDialogProps = {
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
  relationshipStatuses: any[];
  handleSaveRelationship: () => void;
};

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Relationship Status</DialogTitle>
          <DialogDescription>
            Update your relationship status and partners.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="status">Relationship Status</Label>
            <Select 
              value={selectedRelationshipStatus || ''} 
              onValueChange={setSelectedRelationshipStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not specified</SelectItem>
                {relationshipStatuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Relationship Partners</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {relationshipPartners.map(partnerId => {
                const partner = availablePartners.find(p => p.id === partnerId);
                return partner ? (
                  <Badge key={partnerId} variant="secondary" className="flex items-center gap-1">
                    {partner.full_name}
                    <button 
                      onClick={() => handleRemovePartner(partnerId)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </Badge>
                ) : null;
              })}
              
              <Popover open={partnerSearchOpen} onOpenChange={setPartnerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    Add Partner
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" side="right">
                  <Command>
                    <CommandInput 
                      placeholder="Search friends..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No results found</CommandEmpty>
                      <CommandGroup heading="Available Friends">
                        {availablePartners
                          .filter(partner => !relationshipPartners.includes(partner.id))
                          .filter(partner => 
                            partner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(partner => (
                            <CommandItem 
                              key={partner.id}
                              onSelect={() => handleAddPartner(partner.id)}
                            >
                              <Avatar className="h-6 w-6 mr-2">
                                {partner.avatar_url ? (
                                  <AvatarImage src={partner.avatar_url} />
                                ) : (
                                  <AvatarFallback>{partner.full_name.charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              {partner.full_name}
                            </CommandItem>
                          ))
                        }
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveRelationship}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipDialog;
