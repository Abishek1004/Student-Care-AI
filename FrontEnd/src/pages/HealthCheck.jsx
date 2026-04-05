import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Clock, 
  Monitor, 
  Gamepad, 
  BookOpen, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  Brain,
  Hash,
  Heart,
  Droplets,
  Utensils,
  AlertCircle,
  Check,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import predictionService from '../api/predictionService';
import healthBanner from '../assets/health-banner.png';
import healthIcon from '../assets/health-check-icon.png';
import './HealthCheck.css';

const HealthCheck = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollToTop = () => {
    const card = document.querySelector('.form-card-wide');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStepClick = (s) => {
    if (s > 1 && !isAuthenticated) {
      openLoginModal();
      return;
    }
    setStep(s);
    scrollToTop();
  };

  const [formData, setFormData] = useState({
    age: 20,
    gender: 'Male',
    sleep_hours: 7,
    screen_time_hours: 5,
    social_media_hours: 2,
    gaming_hours: 1,
    study_hours_per_day: 6,
    play_time_hours_per_day: 2,
    exercise_per_week: 3,
    // Scales 1-5
    academic_stress: 3,
    social_support: 3,
    concentration_problem: 3,
    feels_lonely: 2,
    feels_hopeless: 2,
    overthinking: 3,
    time_waste: 3,
    distraction_level: 3,
    // Binary
    drug_usage: false,
    food_addiction: false,
    hypertension: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' || (e.target.tagName === 'INPUT' && e.target.type === 'range') ? Number(value) : value)
    }));
  };

  const handleNext = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setStep(s => Math.min(s + 1, totalSteps));
    scrollToTop();
  };
  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
    scrollToTop();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please login to submit your assessment.");
      return;
    }

    setLoading(true);
    setError("");

    // Map frontend camel_case to backend camelCase
    const payload = {
      userId: user.userId,
      age: formData.age,
      gender: formData.gender,
      sleepHours: formData.sleep_hours,
      screenTimeHours: formData.screen_time_hours,
      socialMediaHours: formData.social_media_hours,
      gamingHours: formData.gaming_hours,
      studyHoursPerDay: formData.study_hours_per_day,
      playTimeHoursPerDay: formData.play_time_hours_per_day,
      exercisePerWeek: formData.exercise_per_week,
      academicStress: formData.academic_stress,
      socialSupport: formData.social_support,
      concentrationProblem: formData.concentration_problem,
      feelsLonely: formData.feels_lonely,
      feelsHopeless: formData.feels_hopeless,
      overthinking: formData.overthinking,
      timeWaste: formData.time_waste,
      distractionLevel: formData.distraction_level,
      drugUsage: formData.drug_usage,
      foodAddiction: formData.food_addiction,
      hypertension: formData.hypertension
    };

    try {
      const response = await predictionService.predict(payload);
      if (response.success) {
        // Redirect to dashboard with the real result
        navigate('/', { state: { submissonResult: response.data } });
      } else {
        setError(response.message || "Failed to analyze data");
      }
    } catch (err) {
      setError(err.message || "Server error during analysis");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="form-step">
            <h2>Basic Information</h2>
            <div className="input-group">
              <label><Hash size={18} /> Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} min="10" max="100" />
            </div>
            <div className="input-group">
              <label><User size={18} /> Gender Identity</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h2>Daily Habits</h2>
            <div className="slider-group">
              <label><Clock size={18} /> Sleep Hours ({formData.sleep_hours}h)</label>
              <input type="range" name="sleep_hours" min="0" max="12" value={formData.sleep_hours} onChange={handleChange} />
              <div className="range-labels"><span>0h</span><span>12h</span></div>
            </div>
            <div className="slider-group">
              <label><Monitor size={18} /> Screen Time ({formData.screen_time_hours}h)</label>
              <input type="range" name="screen_time_hours" min="0" max="12" value={formData.screen_time_hours} onChange={handleChange} />
            </div>
            <div className="slider-group">
              <label><User size={18} /> Social Media ({formData.social_media_hours}h)</label>
              <input type="range" name="social_media_hours" min="0" max="12" value={formData.social_media_hours} onChange={handleChange} />
            </div>
            <div className="slider-group">
              <label><Gamepad size={18} /> Gaming ({formData.gaming_hours}h)</label>
              <input type="range" name="gaming_hours" min="0" max="10" value={formData.gaming_hours} onChange={handleChange} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h2>Academic & Play</h2>
            <div className="slider-group">
              <label><BookOpen size={18} /> Study Hours ({formData.study_hours_per_day}h)</label>
              <input type="range" name="study_hours_per_day" min="0" max="12" value={formData.study_hours_per_day} onChange={handleChange} />
            </div>
            <div className="slider-group">
              <label><Activity size={18} /> Play Time ({formData.play_time_hours_per_day}h)</label>
              <input type="range" name="play_time_hours_per_day" min="0" max="10" value={formData.play_time_hours_per_day} onChange={handleChange} />
            </div>
            <div className="slider-group">
              <label><Heart size={18} /> Exercise per Week ({formData.exercise_per_week} days)</label>
              <input type="range" name="exercise_per_week" min="0" max="7" value={formData.exercise_per_week} onChange={handleChange} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="form-step">
            <h2>Mental Wellness (1-5)</h2>
            {[
              { name: 'academic_stress', label: 'Academic Stress' },
              { name: 'social_support', label: 'Social Support' },
              { name: 'concentration_problem', label: 'Concentration' },
              { name: 'feels_lonely', label: 'Loneliness' }
            ].map(item => (
              <div className="radio-scale-group" key={item.name}>
                <label>{item.label}</label>
                <div className="scale-options">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} className={`scale-btn ${formData[item.name] === val ? 'active' : ''}`}>
                      <input type="radio" name={item.name} value={val} checked={formData[item.name] === val} onChange={handleChange} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="form-step">
            <h2>Mental Wellness Cont. (1-5)</h2>
            {[
              { name: 'feels_hopeless', label: 'Feeling Hopeless' },
              { name: 'overthinking', label: 'Overthinking' },
              { name: 'time_waste', label: 'Time Waste' },
              { name: 'distraction_level', label: 'Distraction' }
            ].map(item => (
              <div className="radio-scale-group" key={item.name}>
                <label>{item.label}</label>
                <div className="scale-options">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} className={`scale-btn ${formData[item.name] === val ? 'active' : ''}`}>
                      <input type="radio" name={item.name} value={val} checked={formData[item.name] === val} onChange={handleChange} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="form-step">
            <h2>Final Checks</h2>
            <div className="toggle-group">
              <div className="toggle-item">
                <label><Droplets size={18} /> Drug Usage</label>
                <input type="checkbox" className="toggle-checkbox" name="drug_usage" checked={formData.drug_usage} onChange={handleChange} />
              </div>
              <div className="toggle-item">
                <label><Utensils size={18} /> Food Addiction</label>
                <input type="checkbox" className="toggle-checkbox" name="food_addiction" checked={formData.food_addiction} onChange={handleChange} />
              </div>
              <div className="toggle-item">
                <label><AlertCircle size={18} /> Hypertension</label>
                <input type="checkbox" className="toggle-checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} />
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="form-step">
            <h2>Review & Submit</h2>
            <p className="submission-note">Almost there! You've completed all sections. Click below to analyze your health metrics and get your personalized wellness report.</p>
            <div className="review-summary">
              <p>✓ Basic Information</p>
              <p>✓ Daily Habits Profile</p>
              <p>✓ Academic & Lifestyle Data</p>
              <p>✓ Mental Wellness Indicators</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="health-check-container" data-step={step}>
      <div className="form-card-wide">
        <div className="card-banner">
          <img src={healthBanner} alt="Health Banner" className="banner-img" />
        </div>
        
        <header className="card-header-full">
          <div className="header-title-row">
            <div className="step-counter-badge">
              <span className="current">Step {step}</span>
              <span className="total">/ {totalSteps}</span>
            </div>
            <h1>Daily Well-being Check-in</h1>
          </div>
          <p className="header-subtitle">Help us provide personalized support and tools for your thriving student journey.</p>
          {error && <div className="form-error-banner">{error}</div>}
        </header>

        <div className="card-content-split">
          <aside className="form-sidebar-compact">
            <div className="stepper-vertical">
              {/* Background Curved Path - Straightened for vertical line */}
              <svg className="stepper-path-svg" viewBox="0 0 100 700" preserveAspectRatio="none">
                <path 
                  d="M38,20 L38,680" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="4" 
                />
                <path 
                  className="progress-path"
                  d="M38,20 L38,680" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="4" 
                  pathLength="100"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - (100 * ((step - 1) / (totalSteps - 1)))}
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>

              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div 
                  key={s}
                  className={`step-node ${s < step ? 'completed' : s === step ? 'active' : ''}`}
                  onClick={() => handleStepClick(s)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="step-circle">
                    {s < step ? (
                      <Check size={16} className="check-icon-animated" />
                    ) : (
                      <span className="step-number-display">{s}</span>
                    )}
                  </div>
                  <div className="step-label">
                    <span className="step-desc">
                      {s === 1 && 'Personal Info'}
                      {s === 2 && 'Daily Habits'}
                      {s === 3 && 'Academic Life'}
                      {s === 4 && 'Wellness 1'}
                      {s === 5 && 'Wellness 2'}
                      {s === 6 && 'Checks'}
                      {s === 7 && 'Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="form-main-content">
            <form onSubmit={handleSubmit}>
              <div className="form-step-inner">
                <div key={step} className="step-animation-wrapper">
                  {renderStep()}
                </div>
              </div>

              <div className="form-navigation-bottom">
                <div className="nav-left">
                  {step > 1 && (
                    <button type="button" onClick={handleBack} className="btn-secondary" disabled={loading}>
                      <ChevronLeft size={18} /> Back
                    </button>
                  )}
                </div>
                
                <div className="nav-right">
                  <button type="button" className="btn-ghost-minimal" onClick={() => alert("Progress saved!")}>
                    <Save size={16} /> Save
                  </button>
                  {step < totalSteps ? (
                    <button type="button" onClick={handleNext} className="btn-primary-wide" disabled={loading}>
                      Next <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button type="submit" className="btn-submit-wide" disabled={loading}>
                      {loading ? "Analyzing..." : "Complete Check-in"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
