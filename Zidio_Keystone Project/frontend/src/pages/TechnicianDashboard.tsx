import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function TechnicianDashboard(){

const navigate = useNavigate();

const { darkMode } = useTheme();


const jobs = [

{
id:"WO-00001",
service:"AC Repair",
location:"Chennai Service Center",
status:"IN PROGRESS"
},

{
id:"WO-00004",
service:"Electrical Inspection",
location:"Bangalore Office",
status:"ASSIGNED"
}

];



return(

<div

style={{

minHeight:"100vh",

display:"flex",

background:darkMode ? "#020617":"#f1f5f9",

color:darkMode ? "white":"#1e293b",

fontFamily:"Arial, sans-serif"

}}

>



{/* SIDEBAR */}

<div

style={{

width:"250px",

background:darkMode ? "#111827":"white",

padding:"30px 20px",

boxShadow:"5px 0 15px rgba(0,0,0,0.2)"

}}

>


<h1

style={{

color:"#2563eb"

}}

>

KEYSTONE

</h1>



<p

style={{

color:"#64748b"

}}

>

Technician Panel

</p>





<MenuItem

text="▦ Dashboard"

onClick={()=>navigate("/")}

/>


<MenuItem

text="▤ My Work Orders"

onClick={()=>navigate("/work-orders")}

/>


<MenuItem

text="◉ Notifications"

onClick={()=>navigate("/notifications")}

/>


<MenuItem

text="⚙ Settings"

onClick={()=>navigate("/settings")}

/>


<MenuItem

text="⇥ Logout"

onClick={()=>navigate("/login")}

/>


</div>







{/* MAIN CONTENT */}


<div

style={{

flex:1,

padding:"40px"

}}

>





<h1
style={{
  color:"#2563eb"
}}
>
Technician Dashboard
</h1>

<p
style={{
  fontSize:"18px",
  color: darkMode ? "#cbd5e1" : "#475569",
  marginTop:"15px",
  marginBottom:"8px"
}}
>
Welcome Technician
</p>

<p
style={{
  color: darkMode ? "#94a3b8" : "#64748b",
  fontSize:"16px",
  marginTop:0,
  marginBottom:"25px"
}}
>
View assigned jobs, update progress, and complete service tasks.
</p>












{/* CARDS */}


<div

style={{

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"20px",

marginTop:"30px"

}}

>


<Card

title="Assigned Jobs"

value="5"

darkMode={darkMode}

/>


<Card

title="In Progress"

value="2"

darkMode={darkMode}

/>


<Card

title="Completed Jobs"

value="12"

darkMode={darkMode}

/>


</div>









{/* WORK ORDERS */}


<div

style={{

marginTop:"35px",

background:darkMode ? "#111827":"white",

padding:"30px",

borderRadius:"18px",

boxShadow:"0 8px 20px rgba(0,0,0,0.2)"

}}

>


<h2

style={{

color:"#2563eb"

}}

>

My Work Orders

</h2>



{

jobs.map((job)=>(


<div

key={job.id}

style={{

background:darkMode ? "#020617":"#f8fafc",

padding:"20px",

marginTop:"20px",

borderRadius:"12px",

borderLeft:"5px solid #2563eb"

}}

>


<h3>

{job.id}

</h3>


<p>

<b>Service:</b> {job.service}

</p>


<p>

<b>Location:</b> {job.location}

</p>


<p>

<b>Status:</b>

<span

style={{

color:"#22c55e",

marginLeft:"8px",

fontWeight:"bold"

}}

>

{job.status}

</span>

</p>



<button

onClick={()=>navigate(`/work-orders/${job.id}`)}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"10px 20px",

borderRadius:"8px",

cursor:"pointer"

}}

>

View Details

</button>



</div>


))

}



</div>



</div>



</div>

);

}





function MenuItem({

text,

onClick

}:any){

return(

<div

onClick={onClick}

style={{

padding:"15px",

marginTop:"10px",

borderRadius:"10px",

cursor:"pointer",

background:"transparent"

}}

>

{text}

</div>

)

}





function Card({

title,

value,

darkMode

}:any){


return(

<div

style={{

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px",

boxShadow:"0 5px 15px rgba(0,0,0,0.2)"

}}

>


<h3>

{title}

</h3>


<h1

style={{

color:"#2563eb"

}}

>

{value}

</h1>


</div>

)

}