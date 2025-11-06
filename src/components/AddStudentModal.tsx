import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { StudentFormData } from '../lib/validations/student';
import { studentFormSchema } from '../lib/validations/student';
import { studentApi } from '../lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loader2 } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

export function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      roll_number: '',
      class_name: '',
      grade: '',
    },
  });

  const grade = watch('grade');

  const onSubmit = async (data: StudentFormData) => {
    try {
      await studentApi.createStudent(data);
      toast.success('Student added successfully');
      onStudentAdded();
      reset();
      onClose();
    } catch (error: any) {
      console.error('Error adding student:', error);
      
      // Handle API error response
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to add student. Please try again.';
      
      // If it's a validation error with multiple messages
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        error.response.data.detail.forEach((err: any) => {
          toast.error(`${err.loc?.[1] || 'Field'}: ${err.msg || 'Invalid value'}`);
        });
      } else {
        // Single error message
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new student to the system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roll_number">Roll Number</Label>
            <Input
              id="roll_number"
              placeholder="e.g., 2023001"
              {...register('roll_number')}
            />
            {errors.roll_number && (
              <p className="text-sm font-medium text-destructive">
                {errors.roll_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_name">Class</Label>
            <Input
              id="class_name"
              placeholder="e.g., 10A"
              {...register('class_name')}
            />
            {errors.class_name && (
              <p className="text-sm font-medium text-destructive">
                {errors.class_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select
              onValueChange={(value) => {
                // @ts-ignore - This is a known issue with react-hook-form and shadcn/select
                setValue('grade', value);
              }}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                {['A', 'B', 'C', 'D', 'F'].map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.grade && (
              <p className="text-sm font-medium text-destructive">
                {errors.grade.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Student'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
