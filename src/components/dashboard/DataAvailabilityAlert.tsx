import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataAvailabilityAlertProps {
  message?: string;
  onRetry?: () => void;
}

const DataAvailabilityAlert = ({ 
  message = "Data not available for the selected company or time period",
  onRetry
}: DataAvailabilityAlertProps) => {
  return (
    <Alert variant="destructive" className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="text-orange-800 dark:text-orange-300">Data Unavailable</AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-400">
        {message}
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4 border-orange-500 text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40"
            onClick={onRetry}
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default DataAvailabilityAlert;
