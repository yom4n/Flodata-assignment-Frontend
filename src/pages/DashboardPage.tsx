import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import StudentList from '../components/StudentList';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Logged in as <span className="font-medium">{user?.email}</span> ({user?.role})
            </span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Students</h2>
            {user?.role === 'admin' && (
              <Button asChild>
                <Link to="/students/new">Add New Student</Link>
              </Button>
            )}
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <StudentList isAdmin={user?.role === 'admin'} />
          </div>
        </div>
      </main>
    </div>
  );
}
