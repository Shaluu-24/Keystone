import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";


export default function Technicians(){


const navigate = useNavigate();

const {darkMode}=useTheme();




const technicians=[


{
id:1,
name:"Arun Kumar",
skill:"AC Technician",
experience:"5 Years",
status:"ACTIVE",
jobs:12
},


{
id:2,
name:"Rajesh Kumar",
skill:"Electrical Specialist",
experience:"4 Years",
status:"ACTIVE",
jobs:8
},


{
id:3,
name:"Vijay Kumar",
skill:"Maintenance Engineer",
experience:"3 Years",
status:"AVAILABLE",
jobs:5
},


{
id:4,
name:"Suresh Raj",
skill:"Field Technician",
experience:"6 Years",
status:"BUSY",
jobs:15
}


];





return(


<div

style={{

minHeight:"100vh",

background:darkMode?"#020617":"#f1f5f9",

color:darkMode?"white":"#1e293b",

padding:"40px",

fontFamily:"Arial, sans-serif"

}}

>





<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center"

}}

>


<div>

<h1

style={{

color:"#2563eb"

}}

>

KEYSTONE

</h1>


<p

style={{

color:"#94a3b8"

}}

>

Manage technician performance and availability

</p>


</div>





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









<div

style={{

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"20px",

marginTop:"35px"

}}

>


<StatCard

title="Total Technicians"

value="4"

/>


<StatCard

title="Available"

value="2"

/>


<StatCard

title="Assigned Jobs"

value="40"

/>



</div>









<h2

style={{

marginTop:"40px"

}}

>

Technician List

</h2>









<div

style={{

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"25px"

}}

>


{


technicians.map((tech)=>(



<div

key={tech.id}

style={{

background:darkMode?"#111827":"white",

padding:"25px",

borderRadius:"18px",

boxShadow:"0 8px 20px rgba(0,0,0,0.3)",

borderTop:"5px solid #2563eb"

}}

>


<h2>

{tech.name}

</h2>


<p>

<b>Skill:</b> {tech.skill}

</p>


<p>

<b>Experience:</b> {tech.experience}

</p>


<p>

<b>Assigned Jobs:</b> {tech.jobs}

</p>





<p>

<b>Status:</b>


<span

style={{

marginLeft:"8px",

fontWeight:"bold",

color:

tech.status==="ACTIVE"

?

"#22c55e"

:

tech.status==="BUSY"

?

"#ef4444"

:

"#f59e0b"

}}

>

{tech.status}

</span>


</p>






<button

onClick={()=>navigate(`/technicians/${tech.id}`)}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 20px",

borderRadius:"10px",

cursor:"pointer"

}}

>

View Profile

</button>




</div>



))

}



</div>





</div>


);

}







function StatCard({

title,

value

}:{

title:string;

value:string;

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