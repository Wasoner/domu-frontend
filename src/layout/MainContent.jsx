import './MainContent.scss';

const MainContent = ({ children, fullWidth = false }) => {
  return (
    <main className="app-main">
      {fullWidth ? children : <div className="container">{children}</div>}
    </main>
  );
};

export default MainContent;
