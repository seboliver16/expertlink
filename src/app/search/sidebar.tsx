import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../UserContext';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  startNewProject: () => void;
  selectProject: (projectId: string) => void;
}

interface Project {
  id: string;
  title: string;
  pinned: boolean;
  lastOpened: Date;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, startNewProject, selectProject }) => {
  const router = useRouter();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      const projectsRef = collection(db, 'projects', user.id, 'userProjects');
      const projectDocs = await getDocs(projectsRef);

      const userProjects: Project[] = projectDocs.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Project',
          pinned: data.pinned || false,
          lastOpened: data.lastOpened?.toDate() || new Date()
        };
      });

      // Sort projects by pinned status and last opened date
      userProjects.sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1; // Pinned projects come first
        }
        return b.lastOpened.getTime() - a.lastOpened.getTime(); // Most recent first
      });

      setProjects(userProjects);
    };

    fetchProjects();
  }, [user]);

   

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navSearch = () => {
    router.push(`/search`);
    return;
  };

  

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
    router.push(`/project/${projectId}`);
    updateLastOpened(projectId);
  };

  const updateLastOpened = async (projectId: string) => {
    if (!user) return;

    const projectRef = doc(db, 'projects', user.id, 'userProjects', projectId);
    await updateDoc(projectRef, { lastOpened: new Date() });
  };

  const handlePin = async (projectId: string, pinned: boolean) => {
    if (!user) return;

    const projectRef = doc(db, 'projects', user.id, 'userProjects', projectId);
    await updateDoc(projectRef, { pinned: !pinned });

    // Re-fetch projects to update the list
    setProjects(prevProjects =>
      prevProjects.map(proj =>
        proj.id === projectId ? { ...proj, pinned: !pinned } : proj
      ).sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return b.lastOpened.getTime() - a.lastOpened.getTime();
      })
    );
  };

  const handleDelete = async (projectId: string) => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
      const projectRef = doc(db, 'projects', user.id, 'userProjects', projectId);
      await deleteDoc(projectRef);

      // Remove the project from the local state
      setProjects(prevProjects => prevProjects.filter(proj => proj.id !== projectId));
    }
  };

  const toggleMenu = (projectId: string) => {
    setMenuOpen(prev => (prev === projectId ? null : projectId));
  };

  return (
    <div className={`transition-all duration-300 h-screen flex flex-col ${collapsed ? 'w-20 bg-white' : 'w-60 bg-gray-50'} sticky top-0`}>
      <div className="flex items-center justify-between p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-gray-800"
        >
          {collapsed ? '>' : '<'}
        </button>
        {!collapsed && (
          <h1 className="text-md font-semibold text-gray-800">Minerva</h1>
        )}
        <button
          onClick={ navSearch}
          className="text-blue-600 hover:text-blue-800"
        >
          +
        </button>
      </div>
      {!collapsed && (
        <div className="px-4 flex-grow">
          <ul>
            {projects.map(({ id, title, pinned }) => (
              <li key={id} className="mb-2 relative">
                <button
                  onClick={() => handleProjectClick(id)}
                  className="block w-full text-left px-2 py-2 rounded-lg hover:bg-gray-200 transition text-gray-800 flex items-center"
                >
                  {title}
                  {pinned && <span className="ml-2 text-blue-500 text-sm"></span>}
                </button>
                <button
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-lg"
                  onClick={() => toggleMenu(id)}
                >
                  &#x22EE;
                </button>
                {menuOpen === id && (
                  <div ref={menuRef} className="absolute right-2 top-8 w-32 bg-white border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handlePin(id, pinned)}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      {pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setMenuOpen(null)}
                      className="block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
