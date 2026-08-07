import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";

import ManagerDashboard from "./pages/ManagerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";


import CustomerRequest from "./pages/CustomerRequest";
import CustomerRequestDetails from "./pages/CustomerRequestDetails";


import WorkOrders from "./pages/WorkOrders";
import WorkOrderDetails from "./pages/WorkOrderDetails";
import AssignTechnician from "./pages/AssignTechnician";


import Technicians from "./pages/Technicians";
import TechnicianProfile from "./pages/TechnicianProfile";


import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";

import ServiceRequests from "./pages/ServiceRequests";


import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";



function DashboardRouter(){

const {user}=useAuth();


console.log("USER FROM CONTEXT:",user);



if(!user){

return <LoginPage/>;

}



const role=user.role?.toUpperCase();




// MANAGER

if(

role==="MANAGER" ||

role==="ROLE_MANAGER"

){

return <ManagerDashboard/>;

}





// CUSTOMER

if(

role==="CUSTOMER" ||

role==="ROLE_CUSTOMER"

){

return <CustomerDashboard/>;

}





// DISPATCHER

if(

role==="DISPATCHER" ||

role==="ROLE_DISPATCHER"

){

return <DispatcherDashboard/>;

}





// TECHNICIAN

if(

role==="TECHNICIAN" ||

role==="ROLE_TECHNICIAN"

){

return <TechnicianDashboard/>;

}





return <LoginPage/>;


}







export default function App(){


return(


<AuthProvider>

<ThemeProvider>

<BrowserRouter>

<Routes>



<Route

path="/login"

element={<LoginPage/>}

/>





<Route

path="/"

element={

<ProtectedRoute>

<DashboardRouter/>

</ProtectedRoute>

}

/>







<Route

path="/customer-request"

element={

<ProtectedRoute>

<CustomerRequest/>

</ProtectedRoute>

}

/>



<Route

path="/customer-request/:id"

element={

<ProtectedRoute>

<CustomerRequestDetails/>

</ProtectedRoute>

}

/>







<Route

path="/work-orders"

element={

<ProtectedRoute>

<WorkOrders/>

</ProtectedRoute>

}

/>



<Route

path="/work-orders/:id"

element={

<ProtectedRoute>

<WorkOrderDetails/>

</ProtectedRoute>

}

/>



<Route

path="/work-orders/:id/assign"

element={

<ProtectedRoute>

<AssignTechnician/>

</ProtectedRoute>

}

/>







<Route

path="/technicians"

element={

<ProtectedRoute>

<Technicians/>

</ProtectedRoute>

}

/>



<Route

path="/technicians/:id"

element={

<ProtectedRoute>

<TechnicianProfile/>

</ProtectedRoute>

}

/>







<Route

path="/customers"

element={

<ProtectedRoute>

<Customers/>

</ProtectedRoute>

}

/>



<Route

path="/customers/:id"

element={

<ProtectedRoute>

<CustomerProfile/>

</ProtectedRoute>

}

/>







<Route

path="/service-requests"

element={

<ProtectedRoute>

<ServiceRequests/>

</ProtectedRoute>

}

/>







<Route

path="/reports"

element={

<ProtectedRoute>

<Reports/>

</ProtectedRoute>

}

/>







<Route

path="/analytics"

element={

<ProtectedRoute>

<Analytics/>

</ProtectedRoute>

}

/>







<Route

path="/notifications"

element={

<ProtectedRoute>

<Notifications/>

</ProtectedRoute>

}

/>







<Route

path="/settings"

element={

<ProtectedRoute>

<Settings/>

</ProtectedRoute>

}

/>



</Routes>

</BrowserRouter>

</ThemeProvider>

</AuthProvider>


);


}