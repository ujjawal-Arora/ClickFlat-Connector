import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface StatusDisplayProps {
  status: string;
  progress: number;
  recordsIngested: number;
  onStart: () => Promise<void>;
  onReset: () => void;
}

export function StatusDisplay({
  status,
  progress,
  recordsIngested,
  onStart,
  onReset,
}: StatusDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status and Results</CardTitle>
        <CardDescription>
          Current status and progress of the ingestion process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <div className="p-2 bg-muted rounded-md mt-1">{status}</div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label>Progress</Label>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {progress > 0 && (
            <div>
              <Label>Records Ingested</Label>
              <div className="p-2 bg-muted rounded-md mt-1 font-mono">
                {recordsIngested.toLocaleString()}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
            <Button onClick={onStart} disabled={progress > 0}>
              Start Ingestion
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
