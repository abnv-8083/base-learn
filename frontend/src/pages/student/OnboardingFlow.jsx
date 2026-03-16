import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState({
        grade: null,
        subjects: [],
        goal: null
    });
    const navigate = useNavigate();

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else navigate('/student');
    };

    const handleSubjectToggle = (subject) => {
        setSelections(prev => {
            const current = [...prev.subjects];
            if (current.includes(subject)) {
                return { ...prev, subjects: current.filter(s => s !== subject) };
            }
            return { ...prev, subjects: [...current, subject] };
        });
    };

    return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
            {/* Progress Dots */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-blue' : 'bg-gray-300'}`} />
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
                {/* Step 1: Grade */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2">Welcome! Let's get started.</h2>
                        <p className="text-gray-500 mb-8">First, tell us which grade you are in so we can tailor your curriculum.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[8, 9, 10].map(g => (
                                <div 
                                    key={g}
                                    onClick={() => setSelections({...selections, grade: g})}
                                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${selections.grade === g ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="text-4xl mb-4">📚</div>
                                    <h3 className="text-xl font-bold text-gray-800">Grade {g}</h3>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={handleNext}
                            disabled={!selections.grade}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Subjects */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2">Pick your subjects</h2>
                        <p className="text-gray-500 mb-8">Select the subjects you want to focus on. You can always change these later.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {[
                                { id: 'math', icon: '➗', name: 'Mathematics' },
                                { id: 'physics', icon: '⚡', name: 'Physics' },
                                { id: 'chemistry', icon: '🧪', name: 'Chemistry' },
                                { id: 'biology', icon: '🧬', name: 'Biology' },
                                { id: 'english', icon: '📖', name: 'English' },
                                { id: 'social', icon: '🌍', name: 'Social Studies' }
                            ].map(sub => (
                                <div 
                                    key={sub.id}
                                    onClick={() => handleSubjectToggle(sub.id)}
                                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${selections.subjects.includes(sub.id) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <span className="text-2xl">{sub.icon}</span>
                                    <span className="font-semibold text-sm">{sub.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800 font-semibold px-4 py-2">Back</button>
                            <button 
                                onClick={handleNext}
                                disabled={selections.subjects.length === 0}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 transition"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Goal */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2">What's your main goal?</h2>
                        <p className="text-gray-500 mb-8">This helps us personalize your dashboard recommendations.</p>
                        
                        <div className="flex flex-col gap-4 mb-8 text-left">
                            {[
                                { id: 'score', icon: '🎯', text: 'Score 90%+ in my finals and boards' },
                                { id: 'understand', icon: '💡', text: 'Understand tough concepts clearly' },
                                { id: 'fast', icon: '⚡', text: 'Finish my syllabus ahead of time' },
                                { id: 'top', icon: '🏆', text: 'Top the class and climb the leaderboard' }
                            ].map(g => (
                                <div 
                                    key={g.id}
                                    onClick={() => setSelections({...selections, goal: g.id})}
                                    className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${selections.goal === g.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="text-2xl text-center w-8">{g.icon}</div>
                                    <span className="font-semibold text-gray-700 flex-1">{g.text}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selections.goal === g.id ? 'border-green-500 outline-green' : 'border-gray-300'}`}>
                                        {selections.goal === g.id && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-800 font-semibold px-4 py-2">Back</button>
                            <button 
                                onClick={handleNext}
                                disabled={!selections.goal}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 transition"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Finish */}
                {step === 4 && (
                    <div className="animate-fade-in text-center py-8">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="ph-fill ph-check-circle text-6xl text-green-500"></i>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">We've customized your dashboard. Now it's time to start learning, earning badges, and topping the charts.</p>
                        
                        <button 
                            onClick={handleNext}
                            className="bg-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
