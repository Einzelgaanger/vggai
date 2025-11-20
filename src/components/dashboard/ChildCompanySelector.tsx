import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface ChildCompanySelectorProps {
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  accessibleCompanies: string[];
}

export const ChildCompanySelector = ({ 
  selectedCompany, 
  onCompanyChange,
  accessibleCompanies 
}: ChildCompanySelectorProps) => {
  return (
    <div className="mb-6 p-4 bg-card border rounded-lg">
      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Select Child Company to View
      </Label>
      <Select value={selectedCompany} onValueChange={onCompanyChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a child company" />
        </SelectTrigger>
        <SelectContent>
          {accessibleCompanies.map((company) => (
            <SelectItem key={company} value={company}>
              {company} {company === 'Seamless HR' ? '(Live API)' : '(Mock Data)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-2">
        You are viewing data from <strong>{selectedCompany}</strong>
      </p>
    </div>
  );
};
