import MusicNavbar from "../Headers and Footers/MusicNavbar";
import Footer from "../Headers and Footers/Footer";
import { createContext, useState, useEffect } from "react";

interface UserDetails {
  uid?: string;
  uusername: string;
  uemail: string;
  upassword: string;
}

interface UserDetailsType {
  userdetails: UserDetails | null;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
}

const defaultUserContext = createContext<UserDetailsType | undefined>(undefined);

function MusicLayout({ children }: { children: React.ReactNode }) {
  const [userdetails, setUserDetails] = useState<UserDetails | null>(() => {
    const storedUser = sessionStorage.getItem("userdetails");
    return storedUser ? JSON.parse(storedUser) : null;
  });


  useEffect(() => {
    if (userdetails) {
      sessionStorage.setItem("userdetails", JSON.stringify(userdetails));
    } else {
      sessionStorage.removeItem("userdetails");
    }
  }, [userdetails]);

  return (
    <defaultUserContext.Provider value={{ userdetails, setUserDetails }}>
      <MusicNavbar />
      {children}
      <Footer />
    </defaultUserContext.Provider>
  );
}

export default MusicLayout;
export { defaultUserContext };
