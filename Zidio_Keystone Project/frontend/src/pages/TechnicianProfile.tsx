import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";


export default function TechnicianProfile(){


const navigate = useNavigate();

const {id}=useParams();

const {darkMode}=useTheme();




const technicians:any={


"1":{

name:"Arun Kumar",
skill:"AC Technician",
status:"ACTIVE",
phone:"9876543210",
experience:"4 Years",
completed:"12",
location:"Chennai",
email:"arun@keystone.demo"

},


"2":{

name:"Rajesh Kumar",
skill:"Electrical Specialist",
status:"ACTIVE",
phone:"9876543211",
experience:"5 Years",
completed:"8",
location:"Chennai",
email:"rajesh@keystone.demo"

},


"3":{

name:"Vijay Kumar",
skill:"Maintenance Engineer",
status:"AVAILABLE",
phone:"9876543212",
experience:"3 Years",
completed:"5",
location:"Bangalore",
email:"vijay@keystone.demo"

},


"4":{

name:"Suresh Raj",
skill:"Field Technician",
status:"BUSY",
phone:"9876543213",
experience:"6 Years",
completed:"15",
location:"Coimbatore",
email:"suresh@keystone.demo"

}


};





const tech = technicians[id || "1"];





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


<h1

style={{

color:"#2563eb"

}}

>

KEYSTONE

</h1>



<button

onClick={()=>navigate("/technicians")}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 22px",

borderRadius:"10px",

cursor:"pointer"

}}

>

← Back Technicians

</button>



</div>









<div

style={{

marginTop:"35px",

background:darkMode?"#111827":"white",

padding:"35px",

borderRadius:"20px",

boxShadow:"0 10px 25px rgba(0,0,0,0.3)"

}}

>


<h1

style={{

color:"#3b82f6"

}}

>

{tech.name}

</h1>



<p>

Technician Profile

</p>









<div

style={{

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"20px",

marginTop:"30px"

}}

>


<InfoCard title="Skill" value={tech.skill} darkMode={darkMode}/>

<InfoCard title="Status" value={tech.status} darkMode={darkMode}/>

<InfoCard title="Experience" value={tech.experience} darkMode={darkMode}/>

<InfoCard title="Phone" value={tech.phone} darkMode={darkMode}/>

<InfoCard title="Email" value={tech.email} darkMode={darkMode}/>

<InfoCard title="Location" value={tech.location} darkMode={darkMode}/>


</div>









<div

style={{

marginTop:"35px",

background:darkMode?"#1e3a5f":"#eff6ff",

padding:"25px",

borderRadius:"15px"

}}

>


<h2>

Performance Summary

</h2>


<p>

Completed Jobs : <b>{tech.completed}</b>

</p>


<p>

Customer Rating : <b>4.8 / 5</b>

</p>


<p>

Availability : <b>{tech.status}</b>

</p>



</div>









<div

style={{

marginTop:"30px",

background:darkMode?"#111827":"white",

padding:"25px",

borderRadius:"15px"

}}

>


<h2>

Assigned Work Orders

</h2>


<div

style={{

background:"#1e293b",

padding:"15px",

borderRadius:"10px",

marginTop:"15px"

}}

>

WO-00004 - AC Maintenance

<br/>

Status : ASSIGNED

</div>




<div

style={{

background:"#1e293b",

padding:"15px",

borderRadius:"10px",

marginTop:"15px"

}}

>

WO-00002 - Electrical Inspection

<br/>

Status : COMPLETED

</div>




</div>





</div>




</div>


);


}









function InfoCard({

title,

value,

darkMode

}:{

title:string;

value:string;

darkMode:boolean;

}){


return(


<div

style={{

background:darkMode?"#020617":"#f8fafc",

padding:"20px",

borderRadius:"15px",

borderLeft:"5px solid #2563eb"

}}

>


<p

style={{

color:"#94a3b8"

}}

>

{title}

</p>



<h3>

{value}

</h3>



</div>


);


}