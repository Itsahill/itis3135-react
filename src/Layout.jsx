import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    console.log("Route change:", location.pathname);
  }, [location]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}