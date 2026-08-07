import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";


export default function Reports(){

const navigate = useNavigate();

const { darkMode } = useTheme();



const summaryCards=[

{
title:"Total Requests",
value:"125"
},

{
title:"Completed Jobs",
value:"98"
},

{
title:"Pending Jobs",
value:"7"
},

{
title:"Completion Rate",
value:"92%"
}

];



const statusData=[

{
name:"Completed",
value:98
},

{
name:"In Progress",
value:18
},

{
name:"Pending",
value:7
}

];



const technicianData=[

{
name:"Arun",
jobs:32
},

{
name:"Rahul",
jobs:28
},

{
name:"Vijay",
jobs:24
},

{
name:"Suresh",
jobs:18
}

];



const monthlyData=[

{
month:"Jan",
requests:25
},

{
month:"Feb",
requests:40
},

{
month:"Mar",
requests:55
},

{
month:"Apr",
requests:48
}

];



const COLORS=[

"#2563eb",
"#22c55e",
"#f59e0b"

];





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

KEYSTONE Reports

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







<h2>

Reports Dashboard

</h2>


<p

style={{

color:"#64748b"

}}

>

Generate and analyze operational reports for field service performance.

</p>








{/* SUMMARY */}


<div

style={{

display:"grid",

gridTemplateColumns:"repeat(4,1fr)",

gap:"20px",

marginTop:"30px"

}}

>


{

summaryCards.map(card=>(


<div

key={card.title}

style={{

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px",

borderLeft:"5px solid #2563eb"

}}

>


<h3>

{card.title}

</h3>


<h1

style={{

color:"#2563eb"

}}

>

{card.value}

</h1>


</div>


))


}


</div>









{/* PIE CHART */}


<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"30px",

borderRadius:"18px"

}}

>


<h2>

Work Order Status Distribution

</h2>



<ResponsiveContainer width="100%" height={320}>


<PieChart>


<Pie

data={statusData}

dataKey="value"

nameKey="name"

outerRadius={110}

label

>


{

statusData.map((item,index)=>(

<Cell

key={index}

fill={COLORS[index]}

/>

))

}



</Pie>



</PieChart>


</ResponsiveContainer>



</div>









{/* TECHNICIAN BAR */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"30px",

borderRadius:"18px"

}}

>


<h2>

Technician Performance

</h2>



<ResponsiveContainer width="100%" height={320}>


<BarChart data={technicianData}>


<CartesianGrid strokeDasharray="3 3"/>


<XAxis dataKey="name"/>


<YAxis/>


<Tooltip/>


<Bar

dataKey="jobs"

fill="#22c55e"

radius={[8,8,0,0]}

/>


</BarChart>


</ResponsiveContainer>



</div>









{/* MONTHLY BAR */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"30px",

borderRadius:"18px"

}}

>


<h2>

Monthly Service Report

</h2>



<ResponsiveContainer width="100%" height={320}>


<BarChart data={monthlyData}>


<CartesianGrid strokeDasharray="3 3"/>


<XAxis dataKey="month"/>


<YAxis/>


<Tooltip/>


<Bar

dataKey="requests"

fill="#2563eb"

radius={[8,8,0,0]}

/>


</BarChart>


</ResponsiveContainer>



</div>









{/* CUSTOMER REPORT */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"30px",

borderRadius:"18px"

}}

>


<h2>

Customer Service Report

</h2>


<p>

<b>SLA Compliance:</b> 95%

</p>


<p>

<b>Customer Rating:</b> 4.8 / 5

</p>


<p>

<b>Average Response Time:</b> 2.1 hrs

</p>



</div>









{/* BUSINESS SUMMARY */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"30px",

borderRadius:"18px"

}}

>


<h2>

Business Summary

</h2>


<p>• Service completion rate is improving.</p>

<p>• Technician productivity is above target.</p>

<p>• SLA compliance remains high.</p>


</div>






</div>


);

}