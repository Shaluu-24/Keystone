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


export default function Analytics(){

const navigate = useNavigate();

const { darkMode } = useTheme();



const cards = [

{
title:"Total Service Requests",
value:"125"
},

{
title:"Completed Work Orders",
value:"98"
},

{
title:"Average Response Time",
value:"2.1 hrs"
},

{
title:"SLA Compliance",
value:"95%"
}

];



const monthlyData=[

{month:"Jan",jobs:25},
{month:"Feb",jobs:40},
{month:"Mar",jobs:55},
{month:"Apr",jobs:48},
{month:"May",jobs:70}

];



const statusData=[

{name:"Completed",value:98},
{name:"In Progress",value:18},
{name:"Pending",value:9}

];



const technicianData=[

{name:"Arun Kumar",jobs:12},
{name:"Rahul Sharma",jobs:9},
{name:"Vijay Kumar",jobs:7},
{name:"Suresh Babu",jobs:5}

];



const locationData=[

{name:"Chennai",value:15},
{name:"Bangalore",value:8},
{name:"Other",value:5}

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

KEYSTONE Analytics

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

marginTop:"30px"

}}

>

Analytics Dashboard

</h2>



<p

style={{

color:darkMode ? "#94a3b8":"#64748b"

}}

>

Analyze field service performance and business metrics.

</p>









{/* KPI CARDS */}


<div

style={{

display:"grid",

gridTemplateColumns:"repeat(4,1fr)",

gap:"20px",

marginTop:"30px"

}}

>


{

cards.map((card)=>(


<div

key={card.title}

style={{

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px",

borderLeft:"5px solid #2563eb"

}}

>


<p>

{card.title}

</p>


<h2

style={{

color:"#2563eb"

}}

>

{card.value}

</h2>



</div>


))

}



</div>









{/* MONTHLY REQUESTS */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px"

}}

>


<h2>

Monthly Service Requests

</h2>



<ResponsiveContainer width="100%" height={300}>


<BarChart data={monthlyData}>


<CartesianGrid strokeDasharray="3 3"/>


<XAxis dataKey="month"/>


<YAxis/>


<Tooltip/>


<Bar

dataKey="jobs"

fill="#2563eb"

radius={[8,8,0,0]}

/>


</BarChart>


</ResponsiveContainer>



</div>









{/* STATUS */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px"

}}

>


<h2>

Work Order Status Distribution

</h2>



<ResponsiveContainer width="100%" height={300}>


<PieChart>


<Pie

data={statusData}

dataKey="value"

nameKey="name"

outerRadius={100}

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









{/* TECHNICIAN */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px"

}}

>


<h2>

Technician Productivity

</h2>



<ResponsiveContainer width="100%" height={300}>


<BarChart data={technicianData}>


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









{/* LOCATION */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px"

}}

>


<h2>

Service Requests by Location

</h2>



<ResponsiveContainer width="100%" height={300}>


<PieChart>


<Pie

data={locationData}

dataKey="value"

nameKey="name"

outerRadius={100}

label

>


{

locationData.map((item,index)=>(


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









{/* INSIGHTS */}



<div

style={{

marginTop:"40px",

background:darkMode ? "#111827":"white",

padding:"25px",

borderRadius:"18px"

}}

>


<h2>

Business Insights

</h2>


<p>• 95% of service requests were completed within SLA.</p>

<p>• Average technician response time is 2.1 hours.</p>

<p>• Chennai and Bangalore have the highest service demand.</p>

<p>• First-time fix rate remains above 90%.</p>

<p>• Customer satisfaction score is above 4.8/5.</p>



</div>






</div>


);

}