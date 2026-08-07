import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";


export default function WorkOrders(){


const navigate = useNavigate();

const { darkMode } = useTheme();


const [search,setSearch] = useState("");

const [filter,setFilter] = useState("ALL");




const orders=[


{
id:"WO-00001",
title:"AC Repair",
location:"Chennai Service Center",
priority:"HIGH",
status:"IN PROGRESS"
},


{
id:"WO-00002",
title:"AC Maintenance",
location:"Meridian HQ Tower",
priority:"HIGH",
status:"ASSIGNED"
},


{
id:"WO-00003",
title:"Cooling System Check",
location:"Bangalore Office",
priority:"MEDIUM",
status:"COMPLETED"
},


{
id:"WO-00004",
title:"Electrical Inspection",
location:"Chennai Branch",
priority:"LOW",
status:"NEW"
}


];






const filteredOrders = orders.filter((order)=>{


const matchSearch =

order.title.toLowerCase()
.includes(search.toLowerCase())

||

order.id.toLowerCase()
.includes(search.toLowerCase());



const matchStatus =

filter==="ALL"

||

order.status===filter;



return matchSearch && matchStatus;


});







return(


<div

style={{

minHeight:"100vh",

background:darkMode?"#020617":"#f8fafc",

color:darkMode?"white":"#1e293b",

padding:"35px",

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



<h2>

Work Orders

</h2>



<p

style={{

color:darkMode?"#94a3b8":"#64748b"

}}

>

Manage and monitor service requests

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

display:"flex",

gap:"15px",

marginTop:"30px"

}}

>


<input

placeholder="Search work orders..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

style={{

flex:1,

padding:"12px",

borderRadius:"10px",

border:"1px solid #cbd5e1",

background:darkMode?"#111827":"white",

color:darkMode?"white":"black"

}}

/>






<select

value={filter}

onChange={(e)=>setFilter(e.target.value)}

style={{

padding:"12px",

borderRadius:"10px",

background:darkMode?"#111827":"white",

color:darkMode?"white":"black",

border:"1px solid #cbd5e1"

}}

>


<option value="ALL">
All
</option>


<option value="NEW">
New
</option>


<option value="ASSIGNED">
Assigned
</option>


<option value="IN PROGRESS">
In Progress
</option>


<option value="COMPLETED">
Completed
</option>


</select>



</div>









<div

style={{

marginTop:"35px",

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"25px"

}}

>


{


filteredOrders.map((order)=>(


<div

key={order.id}

style={{

background:darkMode?"#111827":"white",

padding:"25px",

borderRadius:"18px",

boxShadow:"0 8px 20px rgba(0,0,0,0.25)",

borderTop:"5px solid #2563eb"

}}

>


<h2>

{order.id}

</h2>



<p>

<b>Service:</b> {order.title}

</p>


<p>

<b>Location:</b> {order.location}

</p>




<p>

<b>Priority:</b>

<span

style={{

marginLeft:"8px",

fontWeight:700,

color:

order.priority==="HIGH"

?

"#ef4444"

:

order.priority==="MEDIUM"

?

"#f59e0b"

:

"#22c55e"

}}

>

{order.priority}

</span>

</p>





<p

style={{

color:"#3b82f6",

fontWeight:700

}}

>

{order.status}

</p>





<button

onClick={()=>navigate(`/work-orders/${order.id}`)}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"10px 18px",

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


);


}