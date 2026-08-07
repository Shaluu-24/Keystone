import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";


export default function CustomerRequest(){


const navigate = useNavigate();

const { user } = useAuth();

const { darkMode } = useTheme();



const [submitted,setSubmitted] = useState(false);



const [form,setForm]=useState({

service:"",
location:"",
issue:"",
priority:"HIGH"

});





const handleChange=(e:any)=>{


setForm({

...form,

[e.target.name]:e.target.value

});


};






const submitRequest=()=>{


setSubmitted(true);


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

Create Service Request

</h1>




<p

style={{

color:darkMode?"#94a3b8":"#64748b"

}}

>

Submit your service issue and our manager will assign a technician.

</p>








<div

style={{

background:darkMode?"#111827":"white",

padding:"30px",

borderRadius:"18px",

maxWidth:"650px",

marginTop:"30px",

boxShadow:"0 8px 20px rgba(0,0,0,0.2)"

}}

>





<h2>

Customer Details

</h2>




<label>

Customer Name

</label>


<input

value={user?.name || ""}

readOnly

style={inputStyle(darkMode)}

/>





<label>

Service Type

</label>


<select

name="service"

value={form.service}

onChange={handleChange}

style={inputStyle(darkMode)}

>


<option value="">

Select Service

</option>


<option>

AC Repair

</option>


<option>

AC Maintenance

</option>


<option>

Electrical Inspection

</option>


<option>

Cooling System Check

</option>



</select>







<label>

Location

</label>


<input

name="location"

placeholder="Enter service location"

value={form.location}

onChange={handleChange}

style={inputStyle(darkMode)}

/>








<label>

Issue Description

</label>



<textarea

name="issue"

placeholder="Describe your issue"

value={form.issue}

onChange={handleChange}

style={inputStyle(darkMode)}

rows={5}

/>








<label>

Priority

</label>


<select

name="priority"

value={form.priority}

onChange={handleChange}

style={inputStyle(darkMode)}

>


<option>

HIGH

</option>


<option>

MEDIUM

</option>


<option>

LOW

</option>



</select>







<button

onClick={submitRequest}

style={{

marginTop:"20px",

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 25px",

borderRadius:"10px",

cursor:"pointer"

}}

>

Submit Request

</button>







{

submitted &&

<p

style={{

marginTop:"20px",

color:"#22c55e",

fontWeight:"bold"

}}

>

Service request submitted successfully

</p>


}



</div>





</div>


);


}








const inputStyle=(darkMode:boolean)=>({

width:"100%",

padding:"12px",

marginTop:"10px",

marginBottom:"20px",

borderRadius:"10px",

border:"1px solid #cbd5e1",

background:darkMode?"#020617":"white",

color:darkMode?"white":"black"

});