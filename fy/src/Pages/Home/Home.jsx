import { useEffect } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import DesignDisplay from "../../components/DesignDisplay/DesignDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { toast } from "react-toastify";
import Bot from "../../components/Bot/Bot";
import Fleets from "../../components/Fleets/Fleets";
import Partners from "../../components/Partners/Partners";
import NotificationCenter from "../../components/NotificationCenter/NotificationCenter";
import SearchAvailable from "../../components/SearchAvailable/SearchAvailable";
const Home = () => {

  useEffect(() => {
    const handleVerified = (event) => {
      if (event.data?.verified) {
        toast.success("User Verified Successfully. Redirecting ...");

        window.location.href = "/";
      }
    };
    window.addEventListener("message", handleVerified, false);
    return () => window.removeEventListener("message", handleVerified, false);
  }, []);

  return (
    <div>
      <NotificationCenter/>
      <Header />
      <SearchAvailable/>
      <ExploreMenu/>
      <DesignDisplay />
      <Partners/>
      <Bot/>
      <Fleets/>
      <AppDownload />
    </div>
  );
};

export default Home;
