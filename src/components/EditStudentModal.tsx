import { useEffect } from 'react';
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

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
  student: StudentFormData | null;
}

export function EditStudentModal({ 
  isOpen, 
  onClose, 
  onStudentUpdated, 
  student 
}: EditStudentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: student?.name || '',
      roll_number: student?.roll_number || '',
      class_name: student?.class_name || '',
      grade: student?.grade || '',
    },
  });

  // Update form values when student prop changes
  useEffect(() => {
    if (student) {
      setValue('name', student.name);
      setValue('roll_number', student.roll_number);
      setValue('class_name', student.class_name);
      setValue('grade', student.grade);
    }
  }, [student, setValue]);

  const onSubmit = async (data: StudentFormData) => {
    if (!student) return;
    
    try {
      await studentApi.updateStudent(student.roll_number, data);
      toast.success('Student updated successfully');
      onStudentUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating student:', error);
      
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to update student. Please try again.';
      
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        error.response.data.detail.forEach((err: any) => {
          toast.error(`${err.loc?.[1] || 'Field'}: ${err.msg || 'Invalid value'}`);
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the student details below.
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
              disabled // Roll number is the identifier, so it shouldn't be changed
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
              placeholder="e.g., 10th"
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
              onValueChange={(value) => setValue('grade', value)}
              defaultValue={student?.grade}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((grade) => (
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
                  Updating...
                </>
              ) : (
                'Update Student'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
