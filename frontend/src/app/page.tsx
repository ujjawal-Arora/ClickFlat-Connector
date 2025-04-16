"use client";

import { useState, useEffect } from "react";
import { SourceTargetSelector } from "@/components/data-ingestion/SourceTargetSelector";
import { ClickHouseConfig } from "@/components/data-ingestion/ClickHouseConfig";
import { FileUpload } from "@/components/data-ingestion/FileUpload";
import { TableColumnSelector } from "@/components/data-ingestion/TableColumnSelector";
import { DataPreview } from "@/components/data-ingestion/DataPreview";
import { StatusDisplay } from "@/components/data-ingestion/StatusDisplay";
import TableConfiguration from "@/components/data-ingestion/TableConfig";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function DataIngestionTool() {
  // Data source and destination configuration
  const [dataSource, setDataSource] = useState("");
  const [dataDestination, setDataDestination] = useState("");
  
  // Table and column selection state
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, string[]>>({});
  
  // Operation status and progress tracking
  const [operationStatus, setOperationStatus] = useState("Ready");
  const [operationProgress, setOperationProgress] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  
  // Data preview and file handling
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ClickHouse connection state
  const [isClickHouseConnected, setIsClickHouseConnected] = useState(false);
  const [tableMetadata, setTableMetadata] = useState<any>({
    headers: [],
    rows: [],
  });
  
  // ClickHouse data structure state
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [uploadedFileMetadata, setUploadedFileMetadata] = useState<any>(null);
  const [showTableConfiguration, setShowTableConfiguration] = useState(false);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({});
  const [showTableSelector, setShowTableSelector] = useState(false);

  // Sample data for demonstration purposes
  const sampleTables = ["users", "orders", "products", "transactions"];
  const sampleColumns = {
    users: ["id", "name", "email", "created_at"],
    orders: ["id", "user_id", "total", "status", "created_at"],
    products: ["id", "name", "price", "stock", "category"],
    transactions: ["id", "order_id", "amount", "status", "created_at"],
  };

  // Fetch available tables when ClickHouse connection is established
  useEffect(() => {
    if (isClickHouseConnected) {
      fetchAvailableTables();
    }
  }, [isClickHouseConnected]);

  const fetchAvailableTables = async () => {
    try {
      const tables = await apiService.getTables();
      setAvailableTables(tables);
      setShowTableSelector(dataSource === "clickhouse" && dataDestination === "flatfile");
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error("Failed to fetch tables from ClickHouse");
    }
  };

  const fetchTableColumns = async (tableName: string) => {
    if (tableColumns[tableName]) return; // Skip if already fetched

    try {
      const columns = await apiService.getColumns(tableName);
      setTableColumns((previousColumns) => ({
        ...previousColumns,
        [tableName]: columns,
      }));
    } catch (error) {
      console.error(`Failed to fetch columns for ${tableName}:`, error);
      toast.error(`Failed to fetch columns for table ${tableName}`);
    }
  };

  const handleDataSourceChange = (newSource: string) => {
    setDataSource(newSource);
    setDataDestination(newSource === "clickhouse" ? "flatfile" : "clickhouse");
    // Reset application state
    setShowTableConfiguration(false);
    setShowTableSelector(false);
    setTableMetadata({ headers: [], rows: [] });
    setSelectedTables([]);
    setSelectedColumns({});
    setPreviewData([]);
  };

  const handleDataDestinationChange = (newDestination: string) => {
    setDataDestination(newDestination);
    setDataSource(newDestination === "clickhouse" ? "flatfile" : "clickhouse");
    // Reset application state
    setShowTableConfiguration(false);
    setShowTableSelector(false);
    setTableMetadata({ headers: [], rows: [] });
    setSelectedTables([]);
    setSelectedColumns({});
    setPreviewData([]);
  };

  const handleTableSelection = (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables(selectedTables.filter((table) => table !== tableName));
      const updatedColumns = { ...selectedColumns };
      delete updatedColumns[tableName];
      setSelectedColumns(updatedColumns);
    } else {
      setSelectedTables([...selectedTables, tableName]);
      setSelectedColumns({
        ...selectedColumns,
        [tableName]: [],
      });

      // Fetch columns for the selected table if not already cached
      if (isClickHouseConnected && !tableColumns[tableName]) {
        fetchTableColumns(tableName);
      }
    }
  };

  const handleColumnSelection = (tableName: string, columnName: string) => {
    if (selectedColumns[tableName]?.includes(columnName)) {
      setSelectedColumns({
        ...selectedColumns,
        [tableName]: selectedColumns[tableName].filter((column) => column !== columnName),
      });
    } else {
      setSelectedColumns({
        ...selectedColumns,
        [tableName]: [...(selectedColumns[tableName] || []), columnName],
      });
    }
  };

  const handleDataPreview = async () => {
    if (selectedTables.length === 0) {
      toast.warning("Please select at least one table");
      return;
    }

    if (Object.values(selectedColumns).every((columns) => columns.length === 0)) {
      toast.warning("Please select at least one column");
      return;
    }

    setOperationStatus("Fetching preview data...");
    setOperationProgress(30);
    setIsProcessing(true);

    try {
      // Preview data from the first selected table
      const tableName = selectedTables[0];
      const columns = selectedColumns[tableName] || [];

      const previewResults = await apiService.previewData(tableName, columns);
      setPreviewData(previewResults);
      setOperationStatus("Preview ready");
      toast.success(`Loaded ${previewResults.length} rows from ${tableName}`);
    } catch (error) {
      console.error("Failed to fetch preview data:", error);
      toast.error("Failed to fetch preview data");
      setOperationStatus("Preview failed");
    } finally {
      setOperationProgress(100);
      setIsProcessing(false);
    }
  };

  const handlePreviewDataUpdate = (data: any[]) => {
    setPreviewData(data);
    setOperationStatus("Preview ready");
    setOperationProgress(100);
    setIsProcessing(false);
  };

  const handleDataIngestion = async () => {
    if (dataSource === "clickhouse") {
      if (selectedTables.length === 0) {
        toast.warning("Please select at least one table");
        return;
      }

      if (Object.values(selectedColumns).every((columns) => columns.length === 0)) {
        toast.warning("Please select at least one column");
        return;
      }
    } else if (dataSource === "flatfile" && !uploadedFileMetadata) {
      toast.warning("Please upload a file first");
      return;
    }

    setOperationStatus("Data ingestion in progress...");
    setOperationProgress(10);
    setProcessedRecords(0);
    setIsProcessing(true);

    try {
      let ingestionResult:
        | {
            success: boolean;
            records: number;
            message: string;
            filePath?: string;
          }
        | undefined;

      if (dataSource === "clickhouse" && dataDestination === "flatfile") {
        try {
          const exportFileName = `export_${Date.now()}.csv`;

          ingestionResult = await apiService.ingestData({
            source: dataSource,
            target: dataDestination,
            tables: selectedTables,
            columns: selectedColumns,
            targetFile: exportFileName,
            delimiter: ",",
          });

          if (ingestionResult && ingestionResult.success && ingestionResult.filePath) {
            const filePath = ingestionResult.filePath;
            apiService.downloadFile(filePath);

            toast.success("Export complete", {
              description: `${ingestionResult.records} records exported to ${filePath}`,
              action: {
                label: "Download Again",
                onClick: () => apiService.downloadFile(filePath),
              },
            });
          }
        } catch (error: any) {
          if (error.message && error.message.includes("Not connected")) {
            toast.error("Connection to ClickHouse lost", {
              description: "Please reconnect to ClickHouse and try again",
              action: {
                label: "Reconnect",
                onClick: () => setIsClickHouseConnected(false),
              },
            });
          } else {
            throw error;
          }
        }
      } else if (dataSource === "flatfile" && dataDestination === "clickhouse") {
        // Handled by handleTableConfiguration for new tables
      }

      if (ingestionResult) {
        setOperationStatus("Data ingestion completed");
        setProcessedRecords(ingestionResult.records || 0);
        toast.success(`Processed ${ingestionResult.records} records`);
      }
    } catch (error) {
      console.error("Data ingestion error:", error);
      toast.error("Failed to complete data ingestion");
      setOperationStatus("Data ingestion failed");
    } finally {
      setOperationProgress(100);
      setIsProcessing(false);
    }
  };

  const handleIngestionCompletion = (recordCount: number) => {
    setOperationStatus("Data ingestion completed");
    setOperationProgress(100);
    setProcessedRecords(recordCount);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setDataSource("");
    setDataDestination("");
    setSelectedTables([]);
    setSelectedColumns({});
    setOperationStatus("Ready");
    setOperationProgress(0);
    setProcessedRecords(0);
    setPreviewData([]);
    setSelectedFile(null);
    setIsClickHouseConnected(false);
    setShowTableConfiguration(false);
    setTableMetadata({ headers: [], rows: [] });
    setUploadedFileMetadata(null);
    setShowTableSelector(false);
  };

  const handleClickHouseConnection = (isConnected: boolean) => {
    setIsClickHouseConnected(isConnected);
    if (isConnected) {
      setOperationStatus("Connected to ClickHouse");

      if (dataSource === "clickhouse") {
        setShowTableSelector(true);
      }
    }
  };

  const handleFileUpload = async (file: File | null) => {
    setSelectedFile(file);
    setShowTableConfiguration(false);

    if (file) {
      setOperationStatus("Uploading file...");
      setOperationProgress(30);
      setIsProcessing(true);

      try {
        const uploadResult = await apiService.uploadFile(file);
        setUploadedFileMetadata(uploadResult.file);

        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;
          if (fileContent) {
            const lines = fileContent.split("\n");
            if (lines.length > 0) {
              const headers = lines[0].split(",").map((header) => header.trim());
              const dataRows = [];

              for (let i = 1; i < Math.min(lines.length, 6); i++) {
                if (lines[i].trim()) {
                  const values = lines[i].split(",").map((value) => value.trim());
                  const row: Record<string, string> = {};

                  headers.forEach((header, index) => {
                    row[header] = values[index] || "";
                  });

                  dataRows.push(row);
                }
              }

              setTableMetadata({
                headers,
                rows: dataRows,
              });

              setShowTableConfiguration(true);
              setOperationStatus("File uploaded successfully");
              setOperationProgress(100);
            }
          }
          setIsProcessing(false);
        };

        reader.readAsText(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
        setIsProcessing(false);
      }
    }
  };

  const handleTableConfiguration = async (configuration: any) => {
    if (!uploadedFileMetadata) {
      toast.error("No file uploaded");
      return;
    }

    setOperationStatus("Starting data ingestion...");
    setOperationProgress(10);
    setIsProcessing(true);

    try {
      const ingestionResult = await apiService.ingestData({
        source: "flatfile",
        target: "clickhouse",
        tables: [],
        columns: {},
        filePath: uploadedFileMetadata.path,
        targetTable: configuration.tableName,
        delimiter: ",",
      });

      setOperationStatus(ingestionResult.message || "Import completed");
      setOperationProgress(100);
      setProcessedRecords(ingestionResult.records || 0);
      toast.success("Data imported successfully", {
        description: `${ingestionResult.records} records imported to ${configuration.tableName}`,
      });

      if (isClickHouseConnected) {
        fetchAvailableTables();
      }
    } catch (error) {
      console.error("Data ingestion error:", error);
      toast.error("Failed to import data to ClickHouse");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Application Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-primary">Data Synchronization Platform</h1>
          <p className="mt-2 text-muted-foreground">Enterprise-grade data pipeline with intelligent schema mapping and real-time analytics</p>
        </div>
      </header>

      {/* Main Application Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Data Source and Destination Selection */}
          <div className="rounded-lg border border-border/40 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-primary">Data Pipeline Configuration</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <SourceTargetSelector
                source={dataSource}
                target={dataDestination}
                onSourceChange={handleDataSourceChange}
                onTargetChange={handleDataDestinationChange}
              />
            </div>
          </div>

          {/* Configuration Section */}
          <div className="rounded-lg border border-border/40 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-primary">Connection Parameters</h2>
            <div className="grid gap-6">
              {dataSource === "clickhouse" && (
                <ClickHouseConfig
                  onConnected={handleClickHouseConnection}
                  isConnected={isClickHouseConnected}
                />
              )}
              {dataSource === "flatfile" && (
                <FileUpload
                  onFileChange={handleFileUpload}
                  selectedFile={selectedFile}
                  uploadedFileInfo={uploadedFileMetadata}
                />
              )}

              {showTableSelector && (
                <TableColumnSelector
                  tables={availableTables}
                  columns={tableColumns}
                  selectedTables={selectedTables}
                  selectedColumns={selectedColumns}
                  onTableSelect={handleTableSelection}
                  onColumnSelect={handleColumnSelection}
                  onPreview={handleDataPreview}
                />
              )}
            </div>
          </div>

          {/* Data Preview Section */}
          {(previewData.length > 0 || isProcessing) && (
            <div className="rounded-lg border border-border/40 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-semibold text-primary">Data Visualization</h2>
              <DataPreview
                data={previewData}
                isLoading={isProcessing}
                onDataFetched={handlePreviewDataUpdate}
              />
            </div>
          )}

          {/* Operation Status Section */}
          <div className="rounded-lg border border-border/40 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-primary">Pipeline Execution</h2>
            <StatusDisplay
              status={operationStatus}
              progress={operationProgress}
              recordsIngested={processedRecords}
              onStart={handleDataIngestion}
              onReset={handleReset}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
