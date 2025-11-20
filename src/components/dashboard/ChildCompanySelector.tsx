import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="border-2 bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/50 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label className="text-base font-semibold text-foreground">
                Child Company Data View
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a company to view its data and metrics
              </p>
            </div>
          </div>
        </div>
        
        <Select value={selectedCompany} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-full h-12 bg-background border-2 hover:border-primary/50 transition-colors font-medium">
            <SelectValue placeholder="Choose a child company" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2">
            {accessibleCompanies.map((company) => (
              <SelectItem 
                key={company} 
                value={company} 
                className="cursor-pointer py-3"
              >
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{company}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={company === 'Seamless HR' 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-secondary/10 text-secondary border-secondary/20'
                    }
                  >
                    {company === 'Seamless HR' ? 'Live API' : 'Mock'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Currently viewing: <span className="font-semibold text-foreground">{selectedCompany}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
