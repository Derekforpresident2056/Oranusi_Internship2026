import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust this import path to match your tree

export default function Layout() {
  return (
    /* 1. Changed to flex-col so the Navbar sits nicely ON TOP of the content */
    <div className="flex flex-col w-full h-screen bg-slate-900 text-white overflow-hidden">
      
      {/* Top Navbar: 10% Height */}
      <div className="w-full h-[7.5%] shrink-0 z-10 sticky">
        <Navbar /> 
      </div>
      
      {/* Main Content View Container: 90% Height */}
      <main className="w-full h-[90%] overflow-y-auto flex-1">
        {/* 2. Outlet acts as the placeholder for {children} */}
        <Outlet />
      </main>
      
    </div>
  );
}