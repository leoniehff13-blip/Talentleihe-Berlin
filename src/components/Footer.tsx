import { useHistory } from "react-router-dom";

const Footer: React.FC = () => {
  const history = useHistory();

  return (
    <>
      <style>{`
        .ww-legal {
          background: #f0f2f7;
          padding: 24px clamp(20px, 6vw, 80px);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ww-legal-link {
          font-family: "Nunito", sans-serif;
          font-size: 0.78rem;
          color: #4a6080;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 4px;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
        }
        .ww-legal-link:hover { color: #47BCC2; }
        .ww-legal-sep {
          color: #c0c8d8;
          font-size: 0.7rem;
        }
        .ww-legal-copy {
          width: 100%;
          text-align: center;
          font-family: "Nunito", sans-serif;
          font-size: 0.72rem;
          color: #a0aabb;
          margin-top: 8px;
        }
      `}</style>
      <footer className="ww-legal">
        <button className="ww-legal-link" onClick={() => history.push("/datenschutz")}>Datenschutz</button>
        <span className="ww-legal-sep">·</span>
        <button className="ww-legal-link" onClick={() => history.push("/agb")}>AGB</button>
        <span className="ww-legal-sep">·</span>
        <button className="ww-legal-link" onClick={() => history.push("/impressum")}>Impressum</button>
        <p className="ww-legal-copy">© {new Date().getFullYear()} Talentleihe Berlin — Ein Angebot der Handwerkskammer Berlin</p>
      </footer>
    </>
  );
};

export default Footer;
