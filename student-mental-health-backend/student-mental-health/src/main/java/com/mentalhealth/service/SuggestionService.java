package com.mentalhealth.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Generates personalized mental-health suggestions based on
 * the calculated risk level and individual input fields.
 */
@Service
public class SuggestionService {

    public List<String> getSuggestions(String riskLevel,
                                       int academicStress,
                                       double sleepHours,
                                       double screenTimeHours,
                                       int exercisePerWeek,
                                       int feelsLonely,
                                       int overthinking) {
        List<String> suggestions = new ArrayList<>();

        // ─── Risk-level base suggestions ─────────────────────────────────────
        switch (riskLevel.toUpperCase()) {
            case "HIGH" -> {
                suggestions.add("🆘 Please consider speaking with a mental health counselor or therapist immediately.");
                suggestions.add("📞 Reach out to a trusted friend, family member, or helpline today.");
                suggestions.add("🧘 Practice daily mindfulness or meditation for at least 10 minutes.");
                suggestions.add("📵 Take a complete digital detox for at least one day per week.");
                suggestions.add("🏥 Consult a healthcare professional about your mental health status.");
            }
            case "MEDIUM" -> {
                suggestions.add("📅 Build a structured daily routine including study, breaks, and recreation.");
                suggestions.add("🤝 Connect with friends or join a student support group.");
                suggestions.add("📓 Start journaling your thoughts and feelings each evening.");
                suggestions.add("⏰ Set clear boundaries between study time and personal time.");
                suggestions.add("🎯 Break big tasks into smaller, manageable goals to reduce overwhelm.");
            }
            case "LOW" -> {
                suggestions.add("✅ Great job maintaining your mental health! Keep up your healthy habits.");
                suggestions.add("💪 Continue your current routine — consistency is key.");
                suggestions.add("🌱 Explore new hobbies or activities to further enrich your well-being.");
                suggestions.add("🤗 Share your positive habits with peers to support your community.");
            }
        }

        // ─── Contextual suggestions ───────────────────────────────────────────
        if (sleepHours < 6) {
            suggestions.add("😴 You're sleeping less than 6 hours. Aim for 7–9 hours of quality sleep per night.");
        }

        if (academicStress >= 7) {
            suggestions.add("📚 High academic stress detected. Try the Pomodoro technique: 25 min study + 5 min break.");
        }

        if (screenTimeHours > 8) {
            suggestions.add("📱 Your screen time is very high. Use app timers and take a 20-20-20 eye break rule.");
        }

        if (exercisePerWeek < 2) {
            suggestions.add("🏃 You're barely exercising. Even a 20-minute walk daily can significantly improve mood.");
        }

        if (feelsLonely >= 7) {
            suggestions.add("🌍 Loneliness can be heavy. Try joining clubs, volunteering, or reaching out to one person today.");
        }

        if (overthinking >= 7) {
            suggestions.add("🌀 Overthinking is draining your energy. Try grounding techniques: name 5 things you can see.");
        }

        return suggestions;
    }
}
