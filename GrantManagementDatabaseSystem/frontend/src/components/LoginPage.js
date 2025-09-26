import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div>
      <h1>Welcome to EPIC-CURE</h1>

        <Link to="/documents">
          <button>Documents</button>
        </Link>
        <Link to="/grants">
          <button>Grants</button>
        </Link>     
    </div>
  );
}
export default LoginPage;
