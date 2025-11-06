import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Link } from 'react-router-dom';
import type { Student } from '../lib/api';
import { studentApi } from '../lib/api';
import { toast } from 'sonner';
import { AddStudentModal } from './AddStudentModal';
import { EditStudentModal } from './EditStudentModal';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { Search } from 'lucide-react';

type StudentListProps = {
  isAdmin: boolean;
};

export default function StudentList({ isAdmin }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{ rollNumber: string; name: string } | null>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentApi.getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.roll_number.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = () => {
    fetchStudents();
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete({
      rollNumber: student.roll_number,
      name: student.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      await studentApi.deleteStudent(studentToDelete.rollNumber);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to delete student';
      toast.error(errorMessage);
    } finally {
      setStudentToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="px-5 pt-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Students</h2>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add New Student
            </Button>
          )}
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or roll number..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Grade</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No matching students found' : 'No students found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentStudent(student);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(student)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStudentAdded={handleStudentAdded}
      />

      {currentStudent && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentStudent(null);
          }}
          onStudentUpdated={handleStudentAdded}
          student={currentStudent}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${studentToDelete?.name}?`}
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Student"
        cancelText="Cancel"
      />
    </div>
  );
}
