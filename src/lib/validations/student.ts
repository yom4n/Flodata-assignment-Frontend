import { z } from 'zod';

export const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  roll_number: z.string().min(1, 'Roll number is required'),
  class_name: z.string().min(1, 'Class is required'),
  grade: z.string().min(1, 'Grade is required'),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
