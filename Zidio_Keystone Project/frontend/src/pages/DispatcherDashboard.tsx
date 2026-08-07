import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function DispatcherDashboard(){


const {user, logout}=useAuth();

const navigate=useNavigate();




const requests=[

{
id:"WO-00008",
customer:"Cara Customer",
service:"AC Repair",
location:"Chennai Service Center",
priority:"HIGH",
status:"NEW"
},

{
id:"WO-00009",
customer:"Shalini",
service:"Electrical Inspection",
location:"Bangalore",
priority:"MEDIUM",
status:"NEW"
}

];





return(


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

color:"#2563eb",

marginBottom:"35px"

}}

>

KEYSTONE

</h1>





<Menu

title="▦ Dashboard"

click={()=>navigate("/")}

/>



<Menu

title="▤ Work Orders"

click={()=>navigate("/work-orders")}

/>



<Menu

title="⌘ Service Requests"

click={()=>navigate("/service-requests")}

/>



<Menu

title="⚙ Technicians"

click={()=>navigate("/technicians")}

/>



<Menu

title="◉ Notifications"

click={()=>navigate("/notifications")}

/>



<Menu

title="⚙ Settings"

click={()=>navigate("/settings")}

/>





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
  color:"#2563eb"
}}
>
Dispatcher Dashboard
</h1>

<p
style={{
  fontSize:"18px",
  color:"#cbd5e1",
  marginTop:"15px",
  marginBottom:"8px"
}}
>
Welcome Dispatcher
</p>

<p
style={{
  color:"#94a3b8",
  fontSize:"16px",
  marginTop:0,
  marginBottom:"25px"
}}
>
Manage service requests, assign technicians, and coordinate field operations!
</p>









{/* CARDS */}



<div

style={{

display:"grid",

gridTemplateColumns:"repeat(4,1fr)",

gap:"20px",

marginTop:"30px"

}}

>


<Card title="Total Requests" value="25"/>


<Card title="Unassigned Jobs" value="6"/>


<Card title="Assigned Jobs" value="15"/>


<Card title="Completed Jobs" value="18"/>



</div>









<h2

style={{

marginTop:"40px"

}}

>

New Service Requests

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

Customer : <b>{req.customer}</b>

</p>


<p>

Service : <b>{req.service}</b>

</p>



<p>

Location : <b>{req.location}</b>

</p>



<p>

Priority :

<b style={{color:"#ef4444"}}>

{" "}{req.priority}

</b>

</p>



<p>

Status : <b>{req.status}</b>

</p>






<button

onClick={()=>navigate(`/work-orders/${req.id}/assign`)}

style={{

background:"#16a34a",

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

value:string

}){


return(


<div

style={{

background:"#111827",

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