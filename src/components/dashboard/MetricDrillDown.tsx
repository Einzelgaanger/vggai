import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  department?: string;
  role?: string;
  status?: string;
  [key: string]: any;
}

interface MetricDrillDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  employees: Employee[];
  columns?: Array<{ key: string; label: string }>;
}

const MetricDrillDown = ({
  open,
  onOpenChange,
  title,
  description,
  employees,
  columns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' }
  ]
}: MetricDrillDownProps) => {
  
  const exportToCSV = () => {
    try {
      const headers = columns.map(col => col.label).join(',');
      const rows = employees.map(emp => 
        columns.map(col => emp[col.key] || 'N/A').join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const exportToPDF = () => {
    toast.info('PDF export will be implemented with jsPDF library');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <TableIcon className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {employees.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>No data available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp, index) => (
                  <TableRow key={emp.id || index}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {emp[col.key] || 'N/A'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricDrillDown;
