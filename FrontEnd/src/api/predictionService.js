import { endpoints } from "./apiConfig";

const predictionService = {
  predict: async (data) => {
    try {
      const response = await fetch(endpoints.prediction.predict, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default predictionService;
