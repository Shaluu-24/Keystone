import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';


export default function WorkOrderDetails() {


  const navigate = useNavigate();

  const { id } = useParams();

  const { darkMode } = useTheme();


  const [status,setStatus] = useState('IN PROGRESS');




  return (

    <div

      style={{

        minHeight:'100vh',

        background:darkMode ? '#020617':'#f1f5f9',

        color:darkMode ? 'white':'#1e293b',

        padding:'40px',

        fontFamily:'Arial, sans-serif'

      }}

    >





      <div

        style={{

          display:'flex',

          justifyContent:'space-between',

          alignItems:'center'

        }}

      >


        <div>


          <h1

          style={{

            color:'#2563eb',

            margin:0

          }}

          >

            KEYSTONE

          </h1>



          <p

          style={{

            color:darkMode ? '#94a3b8':'#64748b'

          }}

          >

            Field Service Management Platform

          </p>


        </div>






        <button

        onClick={()=>navigate('/work-orders')}

        style={{

          background:'#2563eb',

          color:'white',

          border:'none',

          padding:'12px 22px',

          borderRadius:'10px',

          cursor:'pointer'

        }}

        >

          ← Back Work Orders

        </button>



      </div>









      <div

      style={{

        marginTop:'35px',

        background:darkMode ? '#111827':'white',

        padding:'35px',

        borderRadius:'20px',

        boxShadow:'0 10px 25px rgba(0,0,0,0.3)'

      }}

      >



        <h2>

          Work Order Details

        </h2>







        <div

        style={{

          display:'grid',

          gridTemplateColumns:'1fr 1fr',

          gap:'20px',

          marginTop:'25px'

        }}

        >


        <InfoCard
        title="Work Order ID"
        value={id || 'WO-00001'}
        darkMode={darkMode}
        />



        <InfoCard
        title="Service"
        value="AC Repair"
        darkMode={darkMode}
        />



        <InfoCard
        title="Customer"
        value="Chennai Service Center"
        darkMode={darkMode}
        />



        <InfoCard
        title="Technician"
        value="Arun Kumar"
        darkMode={darkMode}
        />



        <InfoCard
        title="Priority"
        value="HIGH"
        darkMode={darkMode}
        />



        <InfoCard
        title="Status"
        value={status}
        darkMode={darkMode}
        />



        </div>








        <div

        style={{

          marginTop:'30px'

        }}

        >


          <h3>

            Description

          </h3>



          <p

          style={{

            color:darkMode ? '#94a3b8':'#64748b',

            lineHeight:'1.6'

          }}

          >

            Cooling system maintenance and AC repair service
            required at customer location.

          </p>


        </div>









        <div

        style={{

          display:'flex',

          gap:'15px',

          marginTop:'30px'

        }}

        >




        <button

        onClick={()=>setStatus('COMPLETED')}

        style={{

          background:'#16a34a',

          color:'white',

          border:'none',

          padding:'12px 25px',

          borderRadius:'10px',

          cursor:'pointer'

        }}

        >

        Mark Completed

        </button>







        <button

        onClick={()=>navigate(`/work-orders/${id}/assign`)}

        style={{

          background:'#f59e0b',

          color:'white',

          border:'none',

          padding:'12px 25px',

          borderRadius:'10px',

          cursor:'pointer'

        }}

        >

        Assign Technician

        </button>





        </div>





      </div>





    </div>


  );


}







function InfoCard({

title,

value,

darkMode

}:{

title:string;

value:string;

darkMode:boolean;

}){


return (

<div

style={{

background:darkMode ? '#020617':'#f8fafc',

padding:'20px',

borderRadius:'15px',

borderLeft:'4px solid #2563eb'

}}

>



<h4

style={{

color:'#64748b',

margin:0

}}

>

{title}

</h4>



<h3

style={{

marginTop:'10px'

}}

>

{value}

</h3>



</div>


);


}