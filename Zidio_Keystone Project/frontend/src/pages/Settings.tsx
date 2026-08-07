import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";


export default function Settings(){


const navigate = useNavigate();

const { darkMode, toggleDarkMode } = useTheme();



const [emailNotification,setEmailNotification] = useState(true);

const [smsNotification,setSmsNotification] = useState(true);

const [autoAssign,setAutoAssign] = useState(true);



const [newPassword,setNewPassword] = useState("");

const [confirmPassword,setConfirmPassword] = useState("");





return(


<div

style={{

minHeight:"100vh",

background:darkMode ? "#020617":"#f1f5f9",

color:darkMode ? "white":"#1e293b",

padding:"40px",

fontFamily:"Arial"

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

KEYSTONE Settings

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








<h2 style={{marginTop:"35px"}}>

Settings

</h2>


<p style={{color:"#94a3b8"}}>

Manage application preferences and account settings

</p>









<div className="card">


<h2 style={{color:"#3b82f6"}}>

Application Settings

</h2>




<SettingRow

title="Email Notifications"

value={emailNotification}

setValue={()=>setEmailNotification(!emailNotification)}

/>



<SettingRow

title="SMS Notifications"

value={smsNotification}

setValue={()=>setSmsNotification(!smsNotification)}

/>




<SettingRow

title="Dark Mode"

value={darkMode}

setValue={toggleDarkMode}

/>




<SettingRow

title="Auto Assign Technician"

value={autoAssign}

setValue={()=>setAutoAssign(!autoAssign)}

/>





<p>

Language : <b>English</b>

</p>




<button

style={buttonStyle}

>

Save Settings

</button>



</div>









<div className="card">


<h2 style={{color:"#3b82f6"}}>

Account Information

</h2>



<p>
Name : <b>Mike Manager</b>
</p>


<p>
Role : <b>MANAGER</b>
</p>


<p>
Email : <b>manager@keystone.demo</b>
</p>


</div>









<div className="card">


<h2 style={{color:"#3b82f6"}}>

Change Password

</h2>




<input

type="password"

placeholder="New Password"

value={newPassword}

onChange={(e)=>setNewPassword(e.target.value)}

style={inputStyle}

/>



<input

type="password"

placeholder="Confirm Password"

value={confirmPassword}

onChange={(e)=>setConfirmPassword(e.target.value)}

style={inputStyle}

/>





<button

style={{

...buttonStyle,

background:"#16a34a"

}}

>

Update Password

</button>



</div>







</div>


);

}








function SettingRow({

title,

value,

setValue

}:any){


return(


<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

margin:"20px 0"

}}

>


<span>

{title}

</span>



<button

onClick={setValue}

style={{

background:value ? "#16a34a":"#64748b",

color:"white",

border:"none",

padding:"8px 20px",

borderRadius:"20px",

cursor:"pointer"

}}

>

{value ? "ON":"OFF"}

</button>



</div>


);


}







const buttonStyle={

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 25px",

borderRadius:"10px",

cursor:"pointer"

};




const inputStyle={

width:"100%",

padding:"12px",

marginBottom:"15px",

borderRadius:"10px",

border:"1px solid #cbd5e1",

fontSize:"16px"

};