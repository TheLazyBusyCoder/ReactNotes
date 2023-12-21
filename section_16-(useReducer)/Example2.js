/////////////////////////////////
/// APP.JS

import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";

import Timer from "./Timer";
import Footer from "./Footer";
import NextButton from "./NextButton";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";

const initialStage = {
    questions: [],
    status: "loading",
    index: 0,
    answer: null,
    points: 0,
    highscore: 0,
    secondsRemaining: null,
};

function reducer(state, action) {
    switch (action.type) {
        case "tick":
            return {
                ...state,
                secondsRemaining: state.secondsRemaining - 1,
                status: state.secondsRemaining === 0 ? "finish" : state.status,
            };
        case "reset":
            return { ...state, status: "ready", index: 0, points: 0, answer: null };
        case "finish":
            return {
                ...state,
                status: "finish",
                highscore: state.points >= state.highscore ? state.points : state.highscore,
            };
        case "active":
            return { ...state, status: "active" };
        case "dataReceived":
            return { ...state, questions: action.payload, status: "ready" };
        case "dataFailed":
            return { ...state, status: "error" };
        case "start":
            return {
                ...state,
                status: "active",
                secondsRemaining: state.questios.length * 30,
            };
        case "newAnswer":
            const question = state.questions.at(state.index);
            return {
                ...state,
                answer: action.payload,
                points: action.payload === question.correctOption ? state.points + question.points : state.points,
            };
        case "nextQuestion":
            return { ...state, index: state.index + 1, answer: null };
        default:
            throw new Error("Invalid Action");
    }
}

function App() {
    // using the reducer
    const [{ answer, questions, status, index, points, secondsRemaining, highscore }, dispatch] = useReducer(
        reducer,
        initialStage
    );

    const numQuestions = questions.length;
    const maxPoints = questions.reduce((ac, cur) => ac + cur.points, 0);
    /* fetch data from api */
    useEffect(function () {
        async function fun() {
            try {
                const res = await fetch(" http://localhost:8765/questions");
                if (!res.ok) throw new Error("Request fail");
                const data = await res.json();
                if (!data) throw new Error("Data Error");
                dispatch({ type: "dataReceived", payload: data });
            } catch (error) {
                dispatch({ type: "dataFailed" });
            }
        }

        fun();
    }, []);

    return (
        <div className="app">
            <Header />
            <Main>
                {status === "loading" && <Loader />}
                {status === "error" && <Error />}
                {status === "ready" && <StartScreen dispatch={dispatch} numLength={numQuestions} />}

                {status === "active" && (
                    <>
                        <Progress
                            index={index}
                            numQuestions={numQuestions}
                            points={points}
                            maxPoints={maxPoints}
                            answer={answer}
                        />
                        <Question question={questions[index]} dispatch={dispatch} answer={answer} />
                        <Footer>
                            <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
                            <NextButton index={index} numQuestions={numQuestions} answer={answer} dispatch={dispatch} />
                        </Footer>
                    </>
                )}
                {status === "finish" && (
                    <FinishScreen points={points} highscore={highscore} maxPoints={maxPoints} dispatch={dispatch} />
                )}
            </Main>
        </div>
    );
}

export default App;

//////////////////////////
/// TIMER.JS
import { useEffect } from "react";
function Timer({ dispatch, secondsRemaining }) {
    const min = Math.floor(secondsRemaining / 60);
    const sec = secondsRemaining % 60;
    useEffect(
        function () {
            const id = setInterval(() => {
                dispatch({ type: "tick" });
            }, 1000);
            return () => clearInterval(id);
        },
        [dispatch]
    );
    return (
        <div className="timer">
            {min < 10 && "0"}
            {min}:{sec < 10 && "0"}
            {sec}
        </div>
    );
}
