import React from 'react';
import { Header, MainContent, Footer } from '../layout';

const About = () => {
  return (
    <div className="about-page">
      <Header />

      <MainContent>
        <h1>About Domu</h1>
        <p>This is an example About page. Add more content here.</p>
      </MainContent>

      <Footer />
    </div>
  );
};

export default About;
