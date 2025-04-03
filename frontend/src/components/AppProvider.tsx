import type { ReactNode } from "react";
import { useEffect } from "react";
import { DEFAULT_THEME } from "../utils/constants";
import { AuthProvider } from "../utils/auth-context";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  // Set up dark theme
  useEffect(() => {
    // Set the theme on the document element
    const root = window.document.documentElement;
    root.classList.add(DEFAULT_THEME);
    
    // Add custom cursor styles
    const style = document.createElement('style');
    style.textContent = `
      body {
        cursor: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='10' fill='%238855FF' fill-opacity='0.5'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%23FFFFFF' fill-opacity='0.8'/%3E%3C/svg%3E") 16 16, auto;
        background-color: black;
        overflow-x: hidden;
      }
      
      a, button, [role="button"], .cursor-pointer {
        cursor: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='12' fill='%23FF88AA' fill-opacity='0.6'/%3E%3Ccircle cx='16' cy='16' r='8' fill='%23FFFFFF' fill-opacity='0.8'/%3E%3C/svg%3E") 16 16, pointer;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #8855FF 0%, #FF88AA 100%);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #9966FF 0%, #FF99BB 100%);
      }
      
      /* Text selection */
      ::selection {
        background: rgba(136, 85, 255, 0.3);
        color: white;
      }
      
      /* Input autofill styles */
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus, 
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #111 inset !important;
        -webkit-text-fill-color: white !important;
        caret-color: white;
        transition: background-color 5000s ease-in-out 0s;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return <AuthProvider>{children}</AuthProvider>;
};