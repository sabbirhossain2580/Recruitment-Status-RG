/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RecruitmentProvider, useRecruitment } from './context/RecruitmentContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { ExecutiveDashboard } from './views/ExecutiveDashboard';
import { RecruitmentChecklistTable } from './views/RecruitmentChecklistTable';
import { HRPerformanceDashboard } from './views/HRPerformanceDashboard';
import { RecruitmentAnalyticsView } from './views/RecruitmentAnalyticsView';
import { RecruitmentCalendarView } from './views/RecruitmentCalendarView';
import { PendingRecruitmentView } from './views/PendingRecruitmentView';
import { ReportsExportView } from './views/ReportsExportView';
import { AddEditRequisitionModal } from './components/modals/AddEditRequisitionModal';
import { RecruitmentDetailModal } from './components/modals/RecruitmentDetailModal';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { RecruitmentRecord } from './types';

function AppContent() {
  const { deleteRecord } = useRecruitment();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecruitmentRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecruitmentRecord | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<RecruitmentRecord | null>(null);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('rghr_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rghr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rghr_theme', 'light');
    }
  }, [isDarkMode]);

  const handleOpenAddRequisition = () => {
    setEditingRecord(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditRequisition = (record: RecruitmentRecord) => {
    setEditingRecord(record);
    setIsAddEditModalOpen(true);
  };

  const handleOpenDetailModal = (record: RecruitmentRecord) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleNavigateTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop);
    } else {
      setIsSidebarOpenMobile(!isSidebarOpenMobile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenNewRequisition={handleOpenAddRequisition}
        onToggleSidebar={handleToggleSidebar}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarOpen={!isSidebarCollapsedDesktop}
      />

      {/* Main Container - Full Width Edge-to-Edge */}
      <div className="flex-1 flex w-full">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          isCollapsedDesktop={isSidebarCollapsedDesktop}
          onToggleCollapseDesktop={() => setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop)}
        />

        {/* Main View Area - Fluid Full Screen Width */}
        <main className="flex-1 min-w-0 p-2.5 sm:p-4 md:p-5 lg:p-6 w-full">
          {activeTab === 'overview' && (
            <ExecutiveDashboard
              onNavigateTab={handleNavigateTab}
              onOpenNewRequisition={handleOpenAddRequisition}
            />
          )}

          {activeTab === 'checklist' && (
            <RecruitmentChecklistTable
              onOpenAddModal={handleOpenAddRequisition}
              onOpenEditModal={handleOpenEditRequisition}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {activeTab === 'performance' && <HRPerformanceDashboard />}

          {activeTab === 'analytics' && <RecruitmentAnalyticsView />}

          {activeTab === 'calendar' && <RecruitmentCalendarView />}

          {activeTab === 'pending' && (
            <PendingRecruitmentView
              onOpenEditModal={handleOpenEditRequisition}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {activeTab === 'reports' && <ReportsExportView />}
        </main>
      </div>

      {/* Modals */}
      <AddEditRequisitionModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
      />

      <RecruitmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailRecord(null);
        }}
        record={detailRecord}
        onEdit={(rec) => {
          setIsDetailModalOpen(false);
          handleOpenEditRequisition(rec);
        }}
        onDelete={(rec) => {
          setIsDetailModalOpen(false);
          setRecordToDelete(rec);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirmDelete={async () => {
          if (recordToDelete) {
            await deleteRecord(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
        record={recordToDelete}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RecruitmentProvider>
        <AppContent />
      </RecruitmentProvider>
    </AuthProvider>
  );
}
