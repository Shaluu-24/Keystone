import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);


export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {


  // Default application theme = Dark
  const [darkMode, setDarkMode] = useState(true);



  useEffect(() => {

    if (darkMode) {

      document.body.style.background = "#020617";
      document.body.style.color = "white";

    } else {

      document.body.style.background = "#f8fafc";
      document.body.style.color = "#1e293b";

    }


    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";


  }, [darkMode]);





  const toggleDarkMode = () => {

    setDarkMode(prev => !prev);

  };





  return (

    <ThemeContext.Provider

      value={{

        darkMode,

        toggleDarkMode

      }}

    >

      {children}

    </ThemeContext.Provider>

  );

}





export function useTheme(){

  const context = useContext(ThemeContext);


  if(!context){

    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );

  }


  return context;

}