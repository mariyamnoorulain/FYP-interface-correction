import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function CoursesPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Courses Page</h1>
        <p>This is the Courses page content for students.</p>
      </div>
    </div>
  );
}
