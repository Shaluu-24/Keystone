import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";


export default function ServiceRequests(){


const navigate = useNavigate();

const { darkMode } = useTheme();



const requests = [

{
id:"WO-00001",
customer:"Chennai Service Center",
location:"Chennai",
issue:"AC is not cooling",
priority:"HIGH",
status:"NEW"
},

{
id:"WO-00002",
customer:"Chennai Service Center",
location:"Chennai",
issue:"Cooling system maintenance",
priority:"HIGH",
status:"ASSIGNED"
},

{
id:"WO-00004",
customer:"Meridian HQ Tower",
location:"Bangalore",
issue:"AC Maintenance Request",
priority:"HIGH",
status:"IN PROGRESS"
}

];





return(

<div

style={{

minHeight:"100vh",

background:darkMode ? "#020617":"#f8fafc",

color:darkMode ? "white":"#1e293b",

padding:"40px",

fontFamily:"Arial, sans-serif"

}}

>





<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

marginBottom:"30px"

}}

>


<h1

style={{

color:"#2563eb",

margin:0

}}

>

KEYSTONE

</h1>





<button

onClick={()=>navigate("/")}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 22px",

borderRadius:"10px",

cursor:"pointer"

}}

>

← Back Dashboard

</button>



</div>









<h2>

Service Requests

</h2>




<p

style={{

color:darkMode ? "#94a3b8":"#64748b"

}}

>

Manage customer service requests and work order status

</p>











{

requests.map((req)=>(


<div

key={req.id}

style={{

background:darkMode ? "#111827":"white",

padding:"25px",

marginTop:"20px",

borderRadius:"18px",

boxShadow:darkMode

?

"0 8px 20px rgba(0,0,0,0.3)"

:

"0 8px 20px rgba(0,0,0,0.12)",


borderLeft:"5px solid #2563eb"

}}

>






<h2>

{req.id}

</h2>






<p>

<b>Customer:</b> {req.customer}

</p>





<p>

<b>Location:</b> {req.location}

</p>





<p>

<b>Issue:</b> {req.issue}

</p>







<p>

<b>Priority:</b>


<span

style={{

color:"#ef4444",

fontWeight:700,

marginLeft:"8px"

}}

>

{req.priority}

</span>


</p>







<p>

<b>Status:</b>


<span

style={{

marginLeft:"8px",

color:

req.status==="COMPLETED"

?

"#22c55e"

:

req.status==="IN PROGRESS"

?

"#f59e0b"

:

"#3b82f6",

fontWeight:700

}}

>

{req.status}

</span>


</p>









<button

onClick={()=>navigate(`/work-orders/${req.id}/assign`)}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 25px",

borderRadius:"10px",

cursor:"pointer"

}}

>

Assign Technician

</button>







</div>


))

}







</div>


);


}