import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface FilterPanelProps {
  filters: {
    dateRange: { start: string; end: string } | null;
    entity: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
  dataScope: 'org-wide' | 'entity' | 'personal';
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onClose,
  dataScope,
}: FilterPanelProps) {
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      } as { start: string; end: string },
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: null,
      entity: null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Entity Filter (only for org-wide and entity scope) */}
        {(dataScope === 'org-wide' || dataScope === 'entity') && (
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select
              value={filters.entity || ''}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, entity: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="manco">ManCo</SelectItem>
                <SelectItem value="techcorp">TechCorp</SelectItem>
                <SelectItem value="financehub">FinanceHub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4">
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            Clear Filters
          </Button>
          <Button onClick={onClose} size="sm">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

