import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";


export default function Notifications(){


const navigate = useNavigate();

const { darkMode } = useTheme();




const [notifications,setNotifications]=useState([


{
id:1,
title:"New Service Request",
message:"Shalini submitted AC Repair request for Chennai Service Center.",
time:"5 mins ago",
read:false
},


{
id:2,
title:"Technician Assigned",
message:"Arun Kumar assigned to WO-00004.",
time:"20 mins ago",
read:false
},


{
id:3,
title:"Work Order Completed",
message:"WO-00002 completed successfully.",
time:"1 hour ago",
read:true
},


{
id:4,
title:"Customer Feedback",
message:"Customer rated service 5/5.",
time:"Today",
read:true
}


]);





const markRead=(id:number)=>{


setNotifications(

notifications.map((item)=>

item.id===id

?

{
...item,
read:true
}

:

item

)

);


};







return(


<div

style={{

minHeight:"100vh",

background:darkMode?"#020617":"#f8fafc",

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









<h1

style={{

marginTop:"40px"

}}

>

Notifications

</h1>



<p

style={{

color:darkMode?"#94a3b8":"#64748b"

}}

>

Latest system activities and customer alerts

</p>









{

notifications.map((item)=>(


<div

key={item.id}

style={{

background:

item.read

?

darkMode?"#111827":"white"

:

darkMode?"#1e293b":"#e0f2fe",


padding:"25px",

marginTop:"20px",

borderRadius:"15px",

borderLeft:

item.read

?

"5px solid #64748b"

:

"5px solid #2563eb",


boxShadow:"0 8px 20px rgba(0,0,0,0.2)"

}}

>


<h2>

{item.title}

</h2>



<p>

{item.message}

</p>




<small

style={{

color:darkMode?"#94a3b8":"#64748b"

}}

>

{item.time}

</small>






{

!item.read &&

<button

onClick={()=>markRead(item.id)}

style={{

display:"block",

marginTop:"15px",

background:"#16a34a",

color:"white",

border:"none",

padding:"10px 18px",

borderRadius:"8px",

cursor:"pointer"

}}

>

Mark as Read

</button>


}







{

item.read &&


<p

style={{

color:"#22c55e",

fontWeight:"bold"

}}

>

✓ Read

</p>


}




</div>



))


}







</div>


);


}