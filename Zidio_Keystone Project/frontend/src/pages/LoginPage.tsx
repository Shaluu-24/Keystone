import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage(){

const { login } = useAuth();

const navigate = useNavigate();


const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [error,setError] = useState<string | null>(null);

const [loading,setLoading] = useState(false);



async function handleSubmit(e:FormEvent){

e.preventDefault();

setError(null);

setLoading(true);


try{

await login(email,password);

navigate("/");

}

catch(err:any){

setError(err.response?.data?.message ?? "Login failed");

}

finally{

setLoading(false);

}

}




return(


<div

style={{

minHeight:"100vh",

display:"flex",

fontFamily:"Arial, sans-serif",

background:"#020617"

}}

>



{/* LEFT SIDE */}


<div

style={{

flex:1,

padding:"70px",

display:"flex",

flexDirection:"column",

justifyContent:"center",

color:"white"

}}

>


<h1

style={{

fontSize:"42px",

color:"#3b82f6"

}}

>

KEYSTONE

</h1>



<h2

style={{

fontSize:"32px",

marginTop:"20px"

}}

>

Field Service Management Platform

</h2>



<p

style={{

fontSize:"20px",

lineHeight:"1.6",

color:"#cbd5e1",

maxWidth:"500px"

}}

>

Smart operations for modern service teams.

Manage work orders, technicians, customers,
and service requests from one unified platform.

</p>




<div

style={{

marginTop:"25px",

color:"#94a3b8",

lineHeight:"2"

}}

>

✓ Work Order Management

<br/>

✓ Technician Scheduling

<br/>

✓ Customer Service Tracking

<br/>

✓ Performance Analytics


</div>



</div>









{/* LOGIN CARD */}


<div

style={{

flex:1,

display:"flex",

justifyContent:"center",

alignItems:"center"

}}

>


<div

style={{

width:"380px",

background:"#111827",

padding:"35px",

borderRadius:"20px",

boxShadow:"0 15px 35px rgba(0,0,0,0.5)"

}}

>


<h2

style={{

textAlign:"center",

color:"#3b82f6"

}}

>

KEYSTONE LOGIN

</h2>



<p

style={{

textAlign:"center",

color:"#94a3b8"

}}

>

Access your workspace

</p>







<form onSubmit={handleSubmit}>


<label>Email</label>


<input

type="email"

placeholder="Enter your email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

style={inputStyle}

/>





<label>Password</label>


<input

type="password"

placeholder="Enter your password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

style={inputStyle}

/>





{
error &&

<p

style={{

color:"#ef4444",

textAlign:"center"

}}

>

{error}

</p>

}





<button

disabled={loading}

style={{

width:"100%",

padding:"13px",

background:"#2563eb",

color:"white",

border:"none",

borderRadius:"10px",

fontWeight:"bold",

cursor:"pointer",

marginTop:"15px"

}}

>

{

loading ? "SIGNING IN..." : "SIGN IN"

}


</button>



</form>








<div

style={{

marginTop:"25px",

padding:"18px",

background:"#020617",

borderRadius:"12px",

color:"#cbd5e1",

fontSize:"14px"

}}

>


<b style={{color:"#3b82f6"}}>

DEMO ACCOUNTS

</b>


<br/><br/>


Dispatcher

<br/>

dispatcher@keystone.demo


<br/><br/>


Technician

<br/>

technician@keystone.demo


<br/><br/>


Manager

<br/>

manager@keystone.demo


<br/><br/>


Customer

<br/>

customer@keystone.demo


<br/><br/>


Password:

<br/>

Password123!


</div>



</div>


</div>


</div>


);


}



const inputStyle={

width:"100%",

padding:"12px",

marginTop:"8px",

marginBottom:"18px",

borderRadius:"8px",

border:"1px solid #334155",

background:"#020617",

color:"white"

};