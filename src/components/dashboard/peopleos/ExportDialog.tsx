import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  selectedCompany: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  activeTab,
  selectedCompany,
}: ExportDialogProps) {
  const handleExport = async (format: 'pdf' | 'excel' | 'word') => {
    try {
      // TODO: Implement actual export functionality
      // This would call an API endpoint or use a library like jsPDF, xlsx, docx
      
      toast.success(`Exporting ${activeTab} data as ${format.toUpperCase()}...`);
      
      // Simulate export
      setTimeout(() => {
        toast.success(`Report exported successfully as ${format.toUpperCase()}`);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose a format to export the {activeTab} data
            {selectedCompany && ` for ${selectedCompany}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="h-8 w-8" />
            <span>PDF</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6"
            onClick={() => handleExport('excel')}
          >
            <FileSpreadsheet className="h-8 w-8" />
            <span>Excel</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6"
            onClick={() => handleExport('word')}
          >
            <File className="h-8 w-8" />
            <span>Word</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

