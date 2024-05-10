import React, { useContext } from "react";
import { Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";


const ProtectedRoute = ({ element: Element, ...rest }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    // You might want to render a loading spinner or message here while authentication status is being determined
    return <div>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      element={token ? <Element /> : <Navigate to="/" />}
    />
  );
};

export default ProtectedRoute;
