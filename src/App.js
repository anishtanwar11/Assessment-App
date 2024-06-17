import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        fetch('/questions.json')
            .then(response => response.json())
            .then(data => setQuestions(data))
            .catch(error => console.error('Error loading questions:', error));

        const savedState = JSON.parse(localStorage.getItem('quizState'));
        if (savedState) {
            setCurrentQuestionIndex(savedState.currentQuestionIndex);
            setTimeLeft(savedState.timeLeft);
        }

        document.addEventListener('fullscreenchange', checkFullscreen);

        return () => {
            document.removeEventListener('fullscreenchange', checkFullscreen);
        };
    }, []);

    useEffect(() => {
        if (isFullscreen) {
            const timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
                    saveState();
                } else {
                    clearInterval(timerInterval);
                    endQuiz();
                }
            }, 1000);

            return () => clearInterval(timerInterval);
        }
    }, [isFullscreen, timeLeft]);

    const saveState = () => {
        const quizState = {
            currentQuestionIndex,
            timeLeft
        };
        localStorage.setItem('quizState', JSON.stringify(quizState));
    };

    const startQuiz = () => {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Error attempting to enable full-screen mode:', err);
        });
    };

    const checkFullscreen = () => {
        if (!document.fullscreenElement) {
            setIsFullscreen(false);
        } else {
            setIsFullscreen(true);
        }
    };

    const selectAnswer = (selectedChoice) => {
        const currentQuestion = questions[currentQuestionIndex];
        if (selectedChoice === currentQuestion.answer) {
            setScore(prevScore => prevScore + 1);
        }
        nextQuestion();
    };

    const nextQuestion = () => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        saveState();
    };

    const endQuiz = () => {
        alert(`Quiz finished! Your score is ${score} out of ${questions.length}`);
       
    };

    const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!isFullscreen) {
        return (
            <div className="fullscreen-warning">
                Please enable fullscreen mode to start the quiz.
                <button className='start-button' onClick={startQuiz}>Start Quiz</button>
            </div>
        );
    }

    if (questions.length === 0) {
        return <div>Loading...</div>;
    }

    if (currentQuestionIndex >= questions.length) {
        return <div>Quiz finished! Your score is {score} out of {questions.length}</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="quiz-container">
            <div className="timer">{updateTimer()}</div>
            <div className="question-container">
                <div className="question">Q) {currentQuestion.question}</div>
                <div className="choices">
                    {currentQuestion.choices.map(choice => (
                        <button key={choice} className="choice" onClick={() => selectAnswer(choice)}>
                            {choice}
                        </button>
                    ))}
                </div>
                <button className="next-btn" onClick={nextQuestion}>Next</button>
            </div>
        </div>
    );
};

export default App;
