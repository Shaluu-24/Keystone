import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";


export default function CustomerRequestDetails(){


const { id } = useParams();

const navigate = useNavigate();

const { darkMode } = useTheme();





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









<h2

style={{

marginTop:"40px"

}}

>

Service Request Details

</h2>









<div

style={{

background:darkMode?"#111827":"white",

padding:"30px",

borderRadius:"18px",

marginTop:"25px",

boxShadow:"0 8px 20px rgba(0,0,0,0.25)"

}}

>





<h2

style={{

color:"#3b82f6"

}}

>

{id}

</h2>







<p>

<b>Customer Name:</b> Cara Customer

</p>



<p>

<b>Service Type:</b> AC Maintenance Request

</p>



<p>

<b>Location:</b> Meridian HQ Tower

</p>



<p>

<b>Issue:</b> AC is not cooling properly

</p>







<p>

<b>Priority:</b>

<span

style={{

color:"#ef4444",

marginLeft:"8px",

fontWeight:"bold"

}}

>

HIGH

</span>


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

ASSIGNED

</span>


</p>








<hr

style={{

margin:"25px 0",

borderColor:darkMode?"#334155":"#cbd5e1"

}}

/>







<h3

style={{

color:"#3b82f6"

}}

>

Technician Information

</h3>







<p>

<b>Name:</b> Arun Kumar

</p>



<p>

<b>Contact:</b> +91 9876543210

</p>



<p>

<b>Expected Visit:</b> Tomorrow 10:00 AM

</p>







</div>








</div>


);


}