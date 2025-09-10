import React, { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  goal: string;
  activityLevel: string;
  age: string;
  experience: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    goal: '',
    activityLevel: '',
    age: '',
    experience: '',
  });

  const totalSteps = 4;

  const goals = [
    { id: 'weight-loss', label: 'Weight Loss', icon: '🔥', description: 'Shed excess pounds and feel great' },
    { id: 'muscle-gain', label: 'Muscle Gain', icon: '💪', description: 'Build strength and muscle mass' },
    { id: 'endurance', label: 'Improve Endurance', icon: '🏃‍♀️', description: 'Boost stamina and cardiovascular health' },
    { id: 'general-fitness', label: 'General Fitness', icon: '⚡', description: 'Overall health and wellness' },
  ];

  const activityLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to fitness or getting back into it' },
    { id: 'intermediate', label: 'Intermediate', description: '2-3 workouts per week regularly' },
    { id: 'advanced', label: 'Advanced', description: '4+ workouts per week, experienced' },
    { id: 'athlete', label: 'Athlete', description: 'Competitive or elite level training' },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    
    // Show success animation
    setCurrentStep(5);
    
    // Close modal after delay
    setTimeout(() => {
      onClose();
      setCurrentStep(1);
      setFormData({
        name: '',
        email: '',
        goal: '',
        activityLevel: '',
        age: '',
        experience: '',
      });
    }, 3000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email;
      case 2:
        return formData.goal;
      case 3:
        return formData.activityLevel;
      case 4:
        return formData.age && formData.experience;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-light to-brand-dark text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Join FitLife</h2>
            <p className="text-white/90">Let's personalize your fitness journey</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-right text-sm text-white/80 mt-1">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-96 overflow-y-auto">
          
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👋</div>
                <h3 className="text-xl font-bold text-brand-dark">Welcome!</h3>
                <p className="text-brand-medium">Let's start with the basics</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-brand-accent rounded-xl focus:border-brand-light focus:outline-none transition-colors duration-200"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-brand-accent rounded-xl focus:border-brand-light focus:outline-none transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-xl font-bold text-brand-dark">What's Your Goal?</h3>
                <p className="text-brand-medium">Choose your primary fitness objective</p>
              </div>
              
              <div className="space-y-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleInputChange('goal', goal.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.goal === goal.id
                        ? 'border-brand-light bg-brand-light/10'
                        : 'border-brand-accent hover:border-brand-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <div className="font-semibold text-brand-dark">{goal.label}</div>
                        <div className="text-sm text-brand-medium">{goal.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Activity Level */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="text-xl font-bold text-brand-dark">Activity Level</h3>
                <p className="text-brand-medium">How would you describe your current fitness level?</p>
              </div>
              
              <div className="space-y-3">
                {activityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleInputChange('activityLevel', level.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.activityLevel === level.id
                        ? 'border-brand-light bg-brand-light/10'
                        : 'border-brand-accent hover:border-brand-medium'
                    }`}
                  >
                    <div className="font-semibold text-brand-dark">{level.label}</div>
                    <div className="text-sm text-brand-medium">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-xl font-bold text-brand-dark">Almost Done!</h3>
                <p className="text-brand-medium">Just a few more details</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-2">
                    Age Range
                  </label>
                  <select
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-brand-accent rounded-xl focus:border-brand-light focus:outline-none transition-colors duration-200"
                  >
                    <option value="">Select your age range</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="56+">56+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-2">
                    Fitness Experience
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-brand-accent rounded-xl focus:border-brand-light focus:outline-none transition-colors duration-200"
                  >
                    <option value="">How long have you been working out?</option>
                    <option value="0-6-months">0-6 months</option>
                    <option value="6-12-months">6-12 months</option>
                    <option value="1-2-years">1-2 years</option>
                    <option value="2-5-years">2-5 years</option>
                    <option value="5+-years">5+ years</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="text-center space-y-6 animate-scaleIn">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-brand-dark">Welcome to FitLife!</h3>
              <p className="text-brand-medium">
                Your personalized fitness plan is being created. Get ready to transform your life!
              </p>
              <div className="animate-spin w-8 h-8 border-4 border-brand-light border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="p-6 bg-gray-50 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-brand-dark hover:bg-brand-accent'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  canProceed()
                    ? 'bg-brand-dark text-white hover:bg-brand-light transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Complete Setup
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  canProceed()
                    ? 'bg-brand-light text-white hover:bg-brand-dark transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;