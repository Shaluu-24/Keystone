import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";


export default function HelpSupport(){


const navigate = useNavigate();

const { darkMode } = useTheme();


const [issue,setIssue] = useState("");



const submitSupport=()=>{

alert("Support request submitted successfully");

setIssue("");

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

Help & Support

</h1>



<p

style={{

color:darkMode?"#94a3b8":"#64748b"

}}

>

Get assistance and resolve your issues quickly

</p>









<div

style={{

marginTop:"30px",

background:darkMode?"#111827":"white",

padding:"30px",

borderRadius:"18px",

boxShadow:"0 8px 20px rgba(0,0,0,0.25)"

}}

>


<h2

style={{

color:"#3b82f6"

}}

>

Frequently Asked Questions

</h2>




<p>

<b>How to create service request?</b>

<br/>

Navigate to Create Request and submit your service issue.

</p>




<p>

<b>How technician assignment works?</b>

<br/>

Dispatcher or Manager assigns available technicians.

</p>




<p>

<b>How to track service status?</b>

<br/>

Check Service Requests page for live updates.

</p>



</div>









<div

style={{

marginTop:"25px",

background:darkMode?"#111827":"white",

padding:"30px",

borderRadius:"18px",

boxShadow:"0 8px 20px rgba(0,0,0,0.25)"

}}

>


<h2

style={{

color:"#3b82f6"

}}

>

Contact Support

</h2>



<p>

Email : support@keystone.com

</p>



<p>

Response Time : Within 24 Hours

</p>



<p>

Support Hours : 9 AM - 6 PM

</p>




</div>









<div

style={{

marginTop:"25px",

background:darkMode?"#111827":"white",

padding:"30px",

borderRadius:"18px",

boxShadow:"0 8px 20px rgba(0,0,0,0.25)"

}}

>


<h2

style={{

color:"#3b82f6"

}}

>

Raise Support Ticket

</h2>




<textarea

placeholder="Describe your issue..."

value={issue}

onChange={(e)=>setIssue(e.target.value)}

style={{

width:"100%",

height:"120px",

padding:"15px",

borderRadius:"10px",

border:"1px solid #cbd5e1",

background:darkMode?"#020617":"white",

color:darkMode?"white":"black"

}}

/>





<button

onClick={submitSupport}

style={{

marginTop:"20px",

background:"#16a34a",

color:"white",

border:"none",

padding:"12px 25px",

borderRadius:"10px",

cursor:"pointer"

}}

>

Submit Ticket

</button>



</div>







</div>


);


}