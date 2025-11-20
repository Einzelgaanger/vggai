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
    <div className="mb-6 p-5 bg-gradient-to-br from-card via-card to-primary/5 border-2 border-border rounded-xl shadow-md">
      <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        Child Company Data View
      </Label>
      <Select value={selectedCompany} onValueChange={onCompanyChange}>
        <SelectTrigger className="w-full h-11 bg-background border-2 hover:border-primary/50 transition-colors">
          <SelectValue placeholder="Choose a child company" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-2">
          {accessibleCompanies.map((company) => (
            <SelectItem key={company} value={company} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{company}</span>
                <span className={`text-xs ml-auto ${company === 'Seamless HR' ? 'text-success' : 'text-secondary'}`}>
                  {company === 'Seamless HR' ? '(Live API)' : '(Mock)'}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
        Currently viewing: <strong className="text-foreground">{selectedCompany}</strong>
      </p>
    </div>
  );
};
