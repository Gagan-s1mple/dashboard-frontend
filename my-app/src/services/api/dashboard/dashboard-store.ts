
import { create } from "zustand";

interface DashboardState {
  loading: boolean;
  dashboardData: {
    productLineSales: Array<{ name: string; value: number; transactions: number; avgValue: number }>;
    branchData: Array<{ branch: string; city: string; sales: number; transactions: number; rating: number }>;
    monthlyData: Array<{ month: string; sales: number; transactions: number }>;
    customerData: Array<{ type: string; gender: string; sales: number; transactions: number; rating: number }>;
    paymentData: Array<{ method: string; sales: number; transactions: number }>;
  };
  kpis: {
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
    avgRating: number;
  };
  askQuestion: () => Promise<void>;
  calculateKPIs: () => void;
}

const INITIAL_DASHBOARD_DATA = {
  productLineSales: [
    { name: "Food & Beverages", value: 56144.84, transactions: 174, avgValue: 322.67 },
    { name: "Sports & Travel", value: 55122.83, transactions: 166, avgValue: 332.07 },
    { name: "Electronic Accessories", value: 54337.53, transactions: 170, avgValue: 319.63 },
    { name: "Fashion Accessories", value: 54305.9, transactions: 178, avgValue: 305.09 },
    { name: "Home & Lifestyle", value: 53861.91, transactions: 160, avgValue: 336.64 },
    { name: "Health & Beauty", value: 49193.74, transactions: 152, avgValue: 323.64 },
  ],

  branchData: [
    { branch: "C", city: "Naypyitaw", sales: 110568.71, transactions: 328, rating: 7.07 },
    { branch: "A", city: "Yangon", sales: 106200.37, transactions: 340, rating: 7.03 },
    { branch: "B", city: "Mandalay", sales: 106197.67, transactions: 332, rating: 6.82 },
  ],

  monthlyData: [
    { month: "2019-01", sales: 116291.87, transactions: 352 },
    { month: "2019-02", sales: 97219.37, transactions: 303 },
    { month: "2019-03", sales: 109455.51, transactions: 345 },
  ],

  customerData: [
    { type: "Member", gender: "Female", sales: 88146.94, transactions: 261, rating: 6.94 },
    { type: "Normal", gender: "Female", sales: 79735.98, transactions: 240, rating: 6.99 },
    { type: "Normal", gender: "Male", sales: 79007.32, transactions: 259, rating: 7.02 },
    { type: "Member", gender: "Male", sales: 76076.5, transactions: 240, rating: 6.94 },
  ],

  paymentData: [
    { method: "Cash", sales: 112206.57, transactions: 344 },
    { method: "E-wallet", sales: 109993.11, transactions: 345 },
    { method: "Credit Card", sales: 100767.07, transactions: 311 },
  ],
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: false,
  dashboardData: INITIAL_DASHBOARD_DATA,
  kpis: {
    totalSales: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    avgRating: 0,
  },

  calculateKPIs: () => {
    const { dashboardData } = get();
    const totalSales = dashboardData.productLineSales.reduce((sum, item) => sum + item.value, 0);
    const totalTransactions = dashboardData.productLineSales.reduce((sum, item) => sum + item.transactions, 0);
    const averageTransactionValue = totalSales / totalTransactions;
    const avgRating = dashboardData.branchData.reduce((sum, branch) => sum + branch.rating, 0) / dashboardData.branchData.length;

    set({
      kpis: {
        totalSales,
        totalTransactions,
        averageTransactionValue,
        avgRating,
      },
    });
  },

  askQuestion: async () => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, 600));
    get().calculateKPIs();
    set({ loading: false });
  },
}));