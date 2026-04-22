// Legacy index route — redirects to landing.
import { Navigate } from "react-router-dom";
const Index = () => <Navigate to="/" replace />;
export default Index;
