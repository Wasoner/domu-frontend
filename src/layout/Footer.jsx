import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="separator sep-footer" aria-hidden />
      <div className="container">
        <small>© {new Date().getFullYear()} Domu. All rights reserved.</small>
      </div>
    </footer>
  );
};

export default Footer;
