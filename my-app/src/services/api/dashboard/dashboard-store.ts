import { create } from "zustand";
import { dashboardAPI, DashboardBackendResponse } from "./dashboard-api-store";

interface DashboardState {
  loading: boolean;
  hasData: boolean;
  dashboardData: DashboardBackendResponse;
  fetchDashboardData: (query: string,file_name:string) => Promise<void>;
  resetDashboard: () => void;
}

const INITIAL_DASHBOARD_DATA: DashboardBackendResponse = {
  kpis: [],
  charts: [],
};

export const useDashboardStore = create<DashboardState>((set) => ({
  loading: false,
  hasData: false,
  dashboardData: INITIAL_DASHBOARD_DATA,

  fetchDashboardData: async (query: string,file_name:string) => {
    
    set({ loading: true, hasData: false });

    try {

      const data = await dashboardAPI.fetchDashboardData(query,file_name);


      set({
        dashboardData: data,
        hasData: true,
        loading: false,
      });
    } catch (error) {
  
    
      set({
        dashboardData: INITIAL_DASHBOARD_DATA,
        hasData: false,
        loading: false,
      });

      // Show error to user
      throw error;
    }
  },

  resetDashboard: () => {
 
    set({
      hasData: false,
      dashboardData: INITIAL_DASHBOARD_DATA,
      loading: false,
    });
  },
}));
