import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface TableColumnSelectorProps {
  tables: string[];
  columns: Record<string, string[]>;
  selectedTables: string[];
  selectedColumns: Record<string, string[]>;
  onTableSelect: (table: string) => void;
  onColumnSelect: (table: string, column: string) => void;
  onPreview: () => Promise<void>;
}

export function TableColumnSelector({
  tables,
  columns,
  selectedTables,
  selectedColumns,
  onTableSelect,
  onColumnSelect,
  onPreview,
}: TableColumnSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [columnsLoading, setColumnsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Use the tables and columns from props
  const displayTables = tables;
  const displayColumns = columns;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table and Column Selection</CardTitle>
        <CardDescription>
          Select tables and columns to include in the ingestion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-base">Select Tables</Label>
            {loading ? (
              <div className="text-sm text-muted-foreground my-2">
                Loading tables...
              </div>
            ) : error ? (
              <div className="text-sm text-red-500 my-2">{error}</div>
            ) : displayTables.length === 0 ? (
              <div className="text-sm text-muted-foreground my-2">
                No tables found. Please check your database connection.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {displayTables.map((table) => (
                  <div key={table} className="flex items-center space-x-2">
                    <Checkbox
                      id={`table-${table}`}
                      checked={selectedTables.includes(table)}
                      onCheckedChange={() => onTableSelect(table)}
                    />
                    <Label htmlFor={`table-${table}`} className="font-normal">
                      {table}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTables.length > 0 && (
            <div>
              <Label className="text-base">Select Columns</Label>
              <Tabs defaultValue={selectedTables[0]} className="mt-2">
                <TabsList className="mb-2">
                  {selectedTables.map((table) => (
                    <TabsTrigger key={table} value={table}>
                      {table}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {selectedTables.map((table) => (
                  <TabsContent key={table} value={table}>
                    {columnsLoading[table] ? (
                      <div className="text-sm text-muted-foreground my-2">
                        Loading columns for {table}...
                      </div>
                    ) : !displayColumns[table] ? (
                      <div className="text-sm text-muted-foreground my-2">
                        No columns found for this table.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {displayColumns[table]?.map((column) => (
                          <div
                            key={column}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${table}-${column}`}
                              checked={
                                selectedColumns[table]?.includes(column) ||
                                false
                              }
                              onCheckedChange={() =>
                                onColumnSelect(table, column)
                              }
                            />
                            <Label
                              htmlFor={`${table}-${column}`}
                              className="font-normal"
                            >
                              {column}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {selectedTables.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={onPreview} disabled={loading}>
                Preview Data
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
