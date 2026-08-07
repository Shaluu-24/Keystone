import { useParams, useNavigate } from "react-router-dom";


export default function CustomerProfile(){

const {id}=useParams();

const navigate=useNavigate();



const customer={

id:id,

name:"Chennai Service Center",

location:"Chennai",

phone:"9876543210",

requests:5,

status:"ACTIVE"

};





return(

<div

style={{

minHeight:"100vh",

background:"#020617",

color:"white",

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

KEYSTONE Customer Profile

</h1>



<button

onClick={()=>navigate("/customers")}

style={{

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 22px",

borderRadius:"10px",

cursor:"pointer"

}}

>

← Back Customers

</button>



</div>









<div

style={{

background:"#111827",

padding:"30px",

borderRadius:"18px",

marginTop:"40px",

boxShadow:"0 8px 20px rgba(0,0,0,0.3)"

}}

>


<h2

style={{

color:"#3b82f6"

}}

>

Customer Details

</h2>




<p>

Customer ID :

<b> {customer.id}</b>

</p>



<p>

Customer Name :

<b> {customer.name}</b>

</p>



<p>

Location :

<b> {customer.location}</b>

</p>



<p>

Phone :

<b> {customer.phone}</b>

</p>



<p>

Service Requests :

<b> {customer.requests}</b>

</p>



<p

style={{

color:"#22c55e",

fontWeight:"bold"

}}

>

{customer.status}

</p>




</div>







<div

style={{

background:"#111827",

padding:"30px",

borderRadius:"18px",

marginTop:"25px"

}}

>


<h2

style={{

color:"#3b82f6"

}}

>

Service History

</h2>



<p>

WO-00004 - AC Maintenance Request - Completed

</p>


<p>

WO-00005 - AC Repair - Assigned

</p>



</div>






</div>


);

}