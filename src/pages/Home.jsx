import { useState } from 'react';
import { Button } from '../components';
import { Header, MainContent, Footer } from '../layout';

/**
 * Home Page Component
 * Example of a page component wrapped in a layout
 */
const Home = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="home-page">
      <Header />

      <MainContent>
        <h1>Welcome to Domu Frontend</h1>
        <p>This is a modern React application with a proper folder structure.</p>

        <div className="counter-section">
          <h2>Counter Example: {count}</h2>
          <Button onClick={() => setCount(count + 1)}>Increment</Button>
          <Button onClick={() => setCount(count - 1)}>Decrement</Button>
        </div>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Home;
