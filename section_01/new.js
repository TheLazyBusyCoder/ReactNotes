import { useEffect, useState } from "react";

export default function App() {
  const [advice, setAdvice] = useState("");
  const [count, setCount] = useState(0);

  async function getAdv() {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    setAdvice(data.slip.advice);
    setCount((c) => c + 1);
  }

  // if a component changes it runs
  useEffect(function () {
    getAdv();
  }, []);

  // returning jsx
  return (
    <div>
      <h1>{advice}</h1>
      <button onClick={getAdv}>Click</button>
      <Message count={count} /> // adding a component in our component and
      passing the count variable to that component
    </div>
  );
}

function Message(props) {
  return <p>You clicked {props.count} times</p>;
}
