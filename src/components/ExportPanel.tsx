import { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, CheckCircle2, Filter } from 'lucide-react';
import { useTask, Task } from '@/contexts/TaskContext';
import { exportTasksToPDF, exportTasksToExcel, generateTasksCSV, ExportOptions } from '@/utils/exportUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export const ExportPanel = () => {
  const { tasks } = useTask();
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCompleted: true,
    includePending: true,
    categories: [],
    priorities: []
  });

  const availableCategories = [...new Set(tasks.map(task => task.category))].sort();
  const availablePriorities: Task['priority'][] = ['high', 'medium', 'low'];

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      let fileName = '';
      
      switch (format) {
        case 'pdf':
          fileName = exportTasksToPDF(tasks, exportOptions);
          break;
        case 'excel':
          fileName = exportTasksToExcel(tasks, exportOptions);
          break;
        case 'csv':
          fileName = generateTasksCSV(tasks, exportOptions);
          break;
      }

      toast({
        title: "✓ Export successful!",
        description: `Your tasks have been exported as ${fileName}`,
        className: "bg-green-600 border-green-500 text-white dark:bg-green-600 dark:text-white backdrop-blur-md",
      });
    } catch (error) {
      toast({
        title: "❌ Export failed",
        description: "There was an error exporting your tasks. Please try again.",
        className: "bg-red-600 border-red-500 text-white dark:bg-red-600 dark:text-white backdrop-blur-md",
      });
    }
  };

  const toggleCategory = (category: string) => {
    setExportOptions(prev => ({
      ...prev,
      categories: prev.categories?.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...(prev.categories || []), category]
    }));
  };

  const togglePriority = (priority: Task['priority']) => {
    setExportOptions(prev => ({
      ...prev,
      priorities: prev.priorities?.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...(prev.priorities || []), priority]
    }));
  };

  const getFilteredTasksCount = () => {
    let filtered = tasks;

    if (!exportOptions.includeCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }
    if (!exportOptions.includePending) {
      filtered = filtered.filter(task => task.completed);
    }
    if (exportOptions.categories && exportOptions.categories.length > 0) {
      filtered = filtered.filter(task => exportOptions.categories!.includes(task.category));
    }
    if (exportOptions.priorities && exportOptions.priorities.length > 0) {
      filtered = filtered.filter(task => exportOptions.priorities!.includes(task.priority));
    }

    return filtered.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Export Tasks</h2>
          <p className="text-muted-foreground">Download your tasks in different formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Export Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Filters */}
            <div>
              <h4 className="font-medium mb-3">Task Status</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-completed"
                    checked={exportOptions.includeCompleted}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeCompleted: !!checked }))
                    }
                  />
                  <label htmlFor="include-completed" className="text-sm">
                    Include completed tasks
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-pending"
                    checked={exportOptions.includePending}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includePending: !!checked }))
                    }
                  />
                  <label htmlFor="include-pending" className="text-sm">
                    Include pending tasks
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Category Filters */}
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                ) : (
                  availableCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={exportOptions.categories?.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {exportOptions.categories && exportOptions.categories.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  All categories will be included
                </p>
              )}
            </div>

            <Separator />

            {/* Priority Filters */}
            <div>
              <h4 className="font-medium mb-3">Priority Levels</h4>
              <div className="space-y-2">
                {availablePriorities.map(priority => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={exportOptions.priorities?.includes(priority)}
                      onCheckedChange={() => togglePriority(priority)}
                    />
                    <label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                      {priority} priority
                    </label>
                  </div>
                ))}
              </div>
              {exportOptions.priorities && exportOptions.priorities.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  All priorities will be included
                </p>
              )}
            </div>

            <Separator />

            {/* Preview */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Export Preview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getFilteredTasksCount()} of {tasks.length} tasks will be exported
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Formats */}
        <Card>
          <CardHeader>
            <CardTitle>Export Formats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PDF Export */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">PDF Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional formatted report with statistics
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleExport('pdf')} 
                className="w-full"
                disabled={getFilteredTasksCount() === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </div>

            {/* Excel Export */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Table className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Excel Spreadsheet</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed data with multiple sheets
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleExport('excel')} 
                className="w-full"
                disabled={getFilteredTasksCount() === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
            </div>

            {/* CSV Export */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">CSV File</h4>
                  <p className="text-sm text-muted-foreground">
                    Simple format for data import/export
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleExport('csv')} 
                className="w-full"
                disabled={getFilteredTasksCount() === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
            </div>

            {getFilteredTasksCount() === 0 && (
              <div className="text-center py-4">
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                  No tasks match your filters
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};