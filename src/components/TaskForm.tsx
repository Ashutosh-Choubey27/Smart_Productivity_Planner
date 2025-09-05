import { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Plus, Save } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VoiceTaskInput } from '@/components/VoiceTaskInput';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Enhanced task name validation (heuristic)
const validateTaskName = (title: string): boolean => {
  const t = title.trim();
  if (t.length < 3) return false;
  if (!/[A-Za-z]/.test(t)) return false; // must contain letters
  if (!/[aeiou]/i.test(t)) return false; // must contain a vowel
  if (/^(.)\1{3,}$/i.test(t)) return false; // same char repeated 4+ times
  if (/[^A-Za-z0-9\s\-\'&]/.test(t)) return false; // disallow weird symbols

  // Fast accept if starts with a common action verb
  const verbs = /(plan|write|read|review|fix|build|clean|study|prepare|update|email|call|design|implement|test|deploy|research|organize|schedule|draft)\b/i;
  if (verbs.test(t)) return true;

  // Accept multi-word phrases (likely meaningful)
  if (t.split(/\s+/).length >= 2) return true;

  // Additional checks for single-word titles
  const word = t.replace(/[^A-Za-z]/g, '');
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(word)) return false; // 5+ consonants in a row
  if (/(.)\1{2,}/i.test(word)) return false; // triple repeated letters
  if (word.length >= 12) return false; // very long single words are likely not descriptive

  return true;
};

const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .refine(validateTaskName, {
      message: 'Please enter a meaningful task name (e.g., "Complete math assignment", "Study for chemistry exam")'
    }),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.date().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'> & { progress?: number }) => void;
  editingTask?: Task;
  onEditComplete?: () => void;
  trigger?: React.ReactNode;
  defaultCategory?: string;
  academicMode?: boolean;
}

const commonCategories = [
  'Study',
  'Personal',
  'Work',
  'Health',
  'Projects',
  'Exams',
  'Assignments',
  'Research',
  'Reading',
  'Exercise'
];

export const TaskForm = ({ 
  onSubmit, 
  editingTask, 
  onEditComplete, 
  trigger, 
  defaultCategory = '',
  academicMode = false 
}: TaskFormProps) => {
  const [open, setOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const { toast } = useToast();
  const customInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: defaultCategory || '',
      dueDate: undefined
    }
  });

  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        category: editingTask.category,
        dueDate: editingTask.dueDate
      });
      setOpen(true);
    }
  }, [editingTask, form]);

  const handleSubmit = (data: TaskFormData) => {
    // Ensure custom category is named
    if (data.category === 'custom' && !customCategory.trim()) {
      toast({
        title: 'Please name your category',
        description: 'Enter a category name when selecting Custom.',
        variant: 'destructive',
      });
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'> & { progress?: number } = {
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      category: data.category === 'custom' ? customCategory.trim() : data.category,
      dueDate: data.dueDate,
      completed: editingTask?.completed || false
    };
    
    onSubmit(taskData);
    
    if (editingTask && onEditComplete) {
      onEditComplete();
    }
    
    form.reset();
    setCustomCategory('');
    setOpen(false);
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setCustomCategory('');
      form.setValue('category', 'custom');
    } else {
      form.setValue('category', value);
      setCustomCategory('');
    }
  };

  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      form.setValue('title', text.trim());
      toast({
        title: "Voice input captured!",
        description: "Task title filled from voice input.",
      });
    }
  };

  const defaultTrigger = (
    <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-medium">
      <Plus className="h-4 w-4 mr-2" />
      Add New Task
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingTask ? (
              <>
                <Save className="h-5 w-5" />
                Edit Task
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create New Task
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Title
                    <VoiceTaskInput onVoiceInput={handleVoiceInput} />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task title..." 
                      {...field} 
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add task details..."
                      className="resize-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-priority-low"></div>
                            Low
                          </span>
                        </SelectItem>
                        <SelectItem value="medium">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-priority-medium"></div>
                            Medium
                          </span>
                        </SelectItem>
                        <SelectItem value="high">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-priority-high"></div>
                            High
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={handleCategoryChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch('category') === 'custom' && (
              <div>
                <Input
                  ref={customInputRef}
                  autoFocus
                  placeholder="Enter custom category..."
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                  }}
                  className="focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                      <div className="flex items-center justify-between border-t p-2">
                        <Button variant="ghost" size="sm" onClick={() => field.onChange(new Date())}>
                          Today
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => field.onChange(undefined)}>
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:bg-primary-hover"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};