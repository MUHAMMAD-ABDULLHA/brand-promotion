import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Sidebar = ({ navigationItems, activeTab, setActiveTab, role, isMobileOpen, setIsMobileOpen, sidebarCollapsed, setSidebarCollapsed }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen?.(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobileOpen]);

  // Close sidebar when clicking on a nav item on mobile
  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setIsMobileOpen?.(false);
    }
  };

  // Desktop sidebar classes
  const desktopSidebarClasses = `
    hidden lg:flex lg:flex-col lg:fixed lg:h-screen 
    bg-sidebar text-sidebar-foreground 
    border-r border-sidebar-border 
    overflow-y-auto 
    transition-all duration-300 ease-in-out
    ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
  `;

  // Mobile sidebar classes
  const mobileSidebarClasses = `
    fixed inset-y-0 left-0 z-50 
    w-72 
    bg-sidebar text-sidebar-foreground 
    border-r border-sidebar-border 
    overflow-y-auto 
    transform transition-transform duration-300 ease-in-out
    lg:hidden
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
  `;

  const SidebarContent = ({ isCollapsed }) => (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center">
          {!isCollapsed ? (
            <div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                {role === "administrator" ? "Admin" : "AdEngage"}
              </span>
              {role && (
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              )}
            </div>
          ) : (
            <span className="text-xl font-bold text-primary">
              A
            </span>
          )}
        </div>

        {/* Toggle button - only shown on desktop */}
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Close button - only shown on mobile */}
        {isMobile && (
          <button
            onClick={() => setIsMobileOpen?.(false)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Sidebar nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={`
                  flex items-center w-full px-3 py-2.5 rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  ${activeTab === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                  ${isCollapsed ? "justify-center" : "justify-start"}
                `}
              >
                <span className={`flex-shrink-0 ${!isCollapsed ? "mr-3" : ""}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar */}
      <div className={desktopSidebarClasses}>
        <SidebarContent isCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <div className={mobileSidebarClasses}>
        <SidebarContent isCollapsed={false} />
      </div>
    </>
  );
};

export default Sidebar;
