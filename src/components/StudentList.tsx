import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Link } from 'react-router-dom';

// Mock data - in a real app, this would come from an API
const mockStudents = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 20, grade: 'A' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 22, grade: 'B+' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 21, grade: 'A-' },
];

type StudentListProps = {
  isAdmin: boolean;
};

export default function StudentList({ isAdmin }: StudentListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Grade</TableHead>
          {isAdmin && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockStudents.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.age}</TableCell>
            <TableCell>{student.grade}</TableCell>
            {isAdmin && (
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/students/${student.id}/edit`}>Edit</Link>
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
