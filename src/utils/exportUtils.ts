import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Task } from '@/contexts/TaskContext';

export interface ExportOptions {
  includeCompleted?: boolean;
  includePending?: boolean;
  categories?: string[];
  priorities?: Task['priority'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const exportTasksToPDF = (tasks: Task[], options: ExportOptions = {}) => {
  const filteredTasks = filterTasks(tasks, options);
  
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Smart Productivity Planner - Task Report', 20, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Add summary statistics
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const pendingCount = filteredTasks.filter(t => !t.completed).length;
  const highPriorityCount = filteredTasks.filter(t => t.priority === 'high').length;
  
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text(`Total Tasks: ${filteredTasks.length}`, 20, 45);
  doc.text(`Completed: ${completedCount}`, 20, 55);
  doc.text(`Pending: ${pendingCount}`, 20, 65);
  doc.text(`High Priority: ${highPriorityCount}`, 20, 75);
  
  // Create table data
  const tableData = filteredTasks.map(task => [
    task.title,
    task.category,
    task.priority.toUpperCase(),
    task.completed ? 'Completed' : 'Pending',
    task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date',
    task.createdAt.toLocaleDateString()
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 85,
    head: [['Title', 'Category', 'Priority', 'Status', 'Due Date', 'Created']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [70, 130, 180],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 }
    }
  });
  
  // Save the PDF
  const fileName = `tasks-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

export const exportTasksToExcel = (tasks: Task[], options: ExportOptions = {}) => {
  const filteredTasks = filterTasks(tasks, options);
  
  // Prepare data for Excel
  const excelData = filteredTasks.map(task => ({
    'Title': task.title,
    'Description': task.description,
    'Category': task.category,
    'Priority': task.priority.toUpperCase(),
    'Status': task.completed ? 'Completed' : 'Pending',
    'Due Date': task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date',
    'Created Date': task.createdAt.toLocaleDateString(),
    'Updated Date': task.updatedAt.toLocaleDateString()
  }));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Add summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Tasks', filteredTasks.length],
    ['Completed Tasks', filteredTasks.filter(t => t.completed).length],
    ['Pending Tasks', filteredTasks.filter(t => !t.completed).length],
    ['High Priority Tasks', filteredTasks.filter(t => t.priority === 'high').length],
    ['Medium Priority Tasks', filteredTasks.filter(t => t.priority === 'medium').length],
    ['Low Priority Tasks', filteredTasks.filter(t => t.priority === 'low').length],
    ['Export Date', new Date().toLocaleDateString()]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Title
    { wch: 40 }, // Description
    { wch: 15 }, // Category
    { wch: 10 }, // Priority
    { wch: 10 }, // Status
    { wch: 12 }, // Due Date
    { wch: 12 }, // Created Date
    { wch: 12 }  // Updated Date
  ];
  
  summaryWs['!cols'] = [
    { wch: 20 }, // Metric
    { wch: 15 }  // Value
  ];
  
  // Generate file name and save
  const fileName = `tasks-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  return fileName;
};

const filterTasks = (tasks: Task[], options: ExportOptions): Task[] => {
  let filtered = [...tasks];
  
  // Filter by completion status
  if (options.includeCompleted === false) {
    filtered = filtered.filter(task => !task.completed);
  }
  if (options.includePending === false) {
    filtered = filtered.filter(task => task.completed);
  }
  
  // Filter by categories
  if (options.categories && options.categories.length > 0) {
    filtered = filtered.filter(task => options.categories!.includes(task.category));
  }
  
  // Filter by priorities
  if (options.priorities && options.priorities.length > 0) {
    filtered = filtered.filter(task => options.priorities!.includes(task.priority));
  }
  
  // Filter by date range
  if (options.dateRange) {
    filtered = filtered.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= options.dateRange!.start && taskDate <= options.dateRange!.end;
    });
  }
  
  return filtered;
};

export const generateTasksCSV = (tasks: Task[], options: ExportOptions = {}) => {
  const filteredTasks = filterTasks(tasks, options);
  
  const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Created Date'];
  const csvContent = [
    headers.join(','),
    ...filteredTasks.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.description.replace(/"/g, '""')}"`,
      `"${task.category}"`,
      `"${task.priority}"`,
      `"${task.completed ? 'Completed' : 'Pending'}"`,
      `"${task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date'}"`,
      `"${task.createdAt.toLocaleDateString()}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `tasks-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return `tasks-${new Date().toISOString().split('T')[0]}.csv`;
};