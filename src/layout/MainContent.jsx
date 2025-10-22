import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main className="app-main">
      <div className="container">{children}</div>
    </main>
  );
};

export default MainContent;
