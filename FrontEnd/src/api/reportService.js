import { endpoints } from "./apiConfig";

const reportService = {
  getHistory: async (userId) => {
    try {
      const response = await fetch(endpoints.reports.history(userId));
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  getReportDetail: async (id) => {
    try {
      const response = await fetch(endpoints.reports.detail(id));
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default reportService;
