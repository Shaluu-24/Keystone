import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function ManagerDashboard(){

const { user, logout } = useAuth();

const navigate = useNavigate();



const requests = [

{
id:"WO-00006",
customer:"Shalini",
service:"AC Repair",
location:"Chennai Service Center",
issue:"AC is not cooling properly",
priority:"HIGH",
status:"NEW"
},

{
id:"WO-00007",
customer:"Sharma",
service:"Cooling System Check",
location:"Bangalore",
issue:"Cooling performance reduced",
priority:"MEDIUM",
status:"NEW"
}

];



return (

<div

style={{

minHeight:"100vh",

display:"flex",

background:"#020617",

color:"white",

fontFamily:"Arial, sans-serif"

}}

>


{/* SIDEBAR */}


<aside

style={{

width:"260px",

background:"#0f172a",

padding:"25px",

borderRight:"1px solid #1e293b"

}}

>


<h1

style={{

color:"#3b82f6",

marginBottom:"35px"

}}

>

KEYSTONE

</h1>



<Menu title="▦ Dashboard" click={()=>navigate("/")}/>

<Menu title="▤ Work Orders" click={()=>navigate("/work-orders")}/>

<Menu title="⌘ Service Requests" click={()=>navigate("/service-requests")}/>

<Menu title="⚙ Technicians" click={()=>navigate("/technicians")}/>

<Menu title="♙ Customers" click={()=>navigate("/customers")}/>

<Menu title="▣ Reports" click={()=>navigate("/reports")}/>

<Menu title="◫ Analytics" click={()=>navigate("/analytics")}/>

<Menu title="◉ Notifications" click={()=>navigate("/notifications")}/>

<Menu title="⚙ Settings" click={()=>navigate("/settings")}/>



<button

onClick={logout}

style={{

width:"100%",

marginTop:"30px",

padding:"12px",

background:"#dc2626",

color:"white",

border:"none",

borderRadius:"10px",

cursor:"pointer"

}}

>

⇥ Logout

</button>


</aside>







{/* MAIN */}


<main

style={{

flex:1,

padding:"35px"

}}

>

<h1
style={{
  color:"#3b82f6"
}}
>
Manager Dashboard
</h1>

<p
style={{
  marginTop:"15px",
  color:"#cbd5e1",
  fontSize:"18px"
}}
>
Welcome Manager
</p>

<p>
  Monitor customer requests and assign technicians efficiently!
</p>





{/* DASHBOARD CARDS */}


<div

style={{

display:"grid",

gridTemplateColumns:"repeat(4,1fr)",

gap:"20px",

marginTop:"35px"

}}

>


<Card title="Total Work Orders" value="25"/>

<Card title="Pending Jobs" value="7"/>

<Card title="Completed Jobs" value="18"/>

<Card title="New Requests" value="2"/>


</div>







{/* CUSTOMER REQUESTS */}


<h2

style={{

marginTop:"40px"

}}

>

New Customer Requests

</h2>




{

requests.map((req)=>(


<div

key={req.id}

style={{

background:"#111827",

padding:"25px",

marginTop:"20px",

borderRadius:"15px",

borderLeft:"5px solid #2563eb"

}}

>


<h2

style={{

color:"#3b82f6"

}}

>

{req.id}

</h2>



<p>

<b>Customer:</b> {req.customer}

</p>



<p>

<b>Service:</b> {req.service}

</p>



<p>

<b>Location:</b> {req.location}

</p>



<p>

<b>Issue:</b> {req.issue}

</p>



<p>

<b>Priority:</b>

<span style={{color:"#ef4444"}}>

{" "}{req.priority}

</span>

</p>



<p>

<b>Status:</b> {req.status}

</p>




<button

onClick={()=>navigate(`/work-orders/${req.id}/assign`)}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 22px",

borderRadius:"10px",

cursor:"pointer"

}}

>

Assign Technician

</button>



</div>



))

}



</main>


</div>

);

}






function Menu({

title,

click

}:{

title:string;

click:()=>void;

}){


return(

<div

onClick={click}

style={{

padding:"14px",

marginBottom:"12px",

background:"#1e293b",

borderRadius:"10px",

cursor:"pointer"

}}

>

{title}

</div>

);

}







function Card({

title,

value

}:{

title:string;

value:string;

}){


return(

<div

style={{

background:"#0f172a",

padding:"25px",

borderRadius:"15px",

borderLeft:"5px solid #2563eb"

}}

>


<h3>

{title}

</h3>


<h1

style={{

color:"#3b82f6"

}}

>

{value}

</h1>


</div>

);

}