"use client";

import { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import ProjectCreation from './ProjectCreation';
import { useUser } from '../UserContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser(); // Now accessible if wrapped with UserProvider
  const [reset, setReset] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectStarted, setProjectStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.type != "expert_seeker") {
      // Redirect to login page if user is not authenticated
      router.push('/auth');
      return;
    }
    if (!projectStarted) {
      setProjectStarted(true);
    }
  }, [user, projectStarted, router]);

  const startNewProject = () => {
    setReset(true);
    setCurrentProjectId(null);
  };

  const selectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setReset(false);
  };

  const updateSidebar = () => {
    // Sidebar will automatically update due to the real-time listener
  };

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : '';

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        startNewProject={startNewProject}
        selectProject={selectProject}
      />
      <div className="flex-grow transition-all duration-300 relative">
        {/* Header with User Initials */}
        <div className="absolute top-4 right-4 z-10">
          {user && (
            <div
                onClick={() => router.push("/profile")}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 text-blue-500 hover:text-white cursor-pointer transition-all"
                style={{
                  backgroundColor: "transparent",
                  borderImage: "linear-gradient(to right, #0066ff, #00ccff) 1",
                }}
              >
                <span className="text-lg font-semibold">{userInitials}</span>
              </div>
          )}
        </div>

        {/* Main Content */}
        <div
          className="flex flex-col items-center justify-center min-h-screen transition-all duration-300"
          style={{ background: 'white' }}
        >
          {projectStarted && (
            <ProjectCreation
              collapsed={collapsed}
              updateSidebar={updateSidebar}
              projectId={currentProjectId}
              reset={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
