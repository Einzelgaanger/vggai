import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface DrillDownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: string;
  data: {
    metric: string;
    employees: Array<{
      id: string;
      name: string;
      department: string;
      tenure: string;
      [key: string]: any;
    }>;
  };
}

export function DrillDownModal({
  open,
  onOpenChange,
  metric,
  data,
}: DrillDownModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = data.employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMetricTitle = () => {
    const titles: Record<string, string> = {
      'total-workforce': 'Total Workforce Details',
      'active-companies': 'Active Companies',
      'attrition-rate': 'Attrition Analysis',
      'avg-tenure': 'Average Tenure Breakdown',
    };
    return titles[metric] || 'Metric Details';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getMetricTitle()}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of {metric.replace('-', ' ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Employee List */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.tenure}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {data.employees.length} employees
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

