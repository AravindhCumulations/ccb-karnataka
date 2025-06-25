import "./ReactListPage.css";
import { useNavigate } from "react-router-dom";

const rehabCenters = [
  {
    name: "1. The Light House",
    link: "https://www.google.com/maps/search/?api=1&query=The+Light+House+rehab+Bangalore",
  },
  {
    name: "2. Cadabam's Hospitals",
    link: "https://www.google.com/maps/search/?api=1&query=Cadabam%27s+Hospitals+Bangalore+rehab",
  }
];

const RehabListPage = () => {
  const navigate = useNavigate();
  return (
    <div className="rehab-page">
      <button className="rehab-back-btn" onClick={() => navigate(-1)}>
        &#8592; Back
      </button>
      <h1>Drug Rehab Centres in Bangalore</h1>
      <ul className="rehab-list">
        {rehabCenters.map((center, index) => (
          <li key={index} className="rehab-item">
            <a href={center.link} target="_blank" rel="noopener noreferrer">
              {center.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RehabListPage;
