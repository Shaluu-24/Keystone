import { useEffect, useState } from 'react';
import { api, WorkOrder } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


const STATUS_COLUMNS: WorkOrder['status'][] = [
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CLOSED',
];



export default function BoardPage() {


  const { user, logout } = useAuth();

  const { darkMode } = useTheme();



  const [orders,setOrders] = useState<WorkOrder[]>([]);

  const [loading,setLoading] = useState(true);





  useEffect(()=>{


    api

    .get('/work-orders',{params:{size:100}})

    .then((res)=>{

      console.log('WORK ORDERS RESPONSE:',res.data);

      const data = res.data.content ?? res.data;

      setOrders(data);

    })

    .catch((err)=>{

      console.log('WORK ORDER ERROR:',err.response);

    })

    .finally(()=>{

      setLoading(false);

    });


  },[]);








  return (


    <div

    style={{

      minHeight:'100vh',

      background:darkMode ? '#020617':'#f1f5f9',

      color:darkMode ? 'white':'#1e293b',

      fontFamily:'Arial, sans-serif',

      padding:'30px'

    }}

    >







    <header

    style={{

      display:'flex',

      justifyContent:'space-between',

      alignItems:'center',

      marginBottom:'30px'

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



    <span

    style={{

      color:darkMode ? '#94a3b8':'#64748b'

    }}

    >

    {user?.name} · {user?.role}

    </span>



    </div>







    <button

    onClick={logout}

    style={{

      background:'#dc2626',

      color:'white',

      border:'none',

      padding:'12px 25px',

      borderRadius:'10px',

      cursor:'pointer'

    }}

    >

    Logout

    </button>




    </header>









    {

    loading ? (

      <p>

      Loading work orders...

      </p>

    )

    :

    orders.length===0 ? (

      <p>

      No work orders to show yet.

      </p>

    )

    :

    (

    <div

    style={{

      display:'grid',

      gridTemplateColumns:`repeat(${STATUS_COLUMNS.length},1fr)`,

      gap:'12px'

    }}

    >





    {

    STATUS_COLUMNS.map((status)=>(



    <div

    key={status}

    style={{

      background:darkMode ? '#111827':'#e2e8f0',

      borderRadius:'12px',

      padding:'12px'

    }}

    >



    <h4>

    {status.replace('_',' ')}

    </h4>








    {

    orders

    .filter((o)=>o.status===status)

    .map((o)=>(



    <div

    key={o.id}

    style={{

      background:darkMode ? '#020617':'white',

      borderRadius:'10px',

      padding:'12px',

      marginBottom:'10px',

      boxShadow:'0 3px 10px rgba(0,0,0,0.2)',

      borderLeft:'4px solid #2563eb'

    }}

    >



    <strong>

    {o.code}

    </strong>



    <div>

    {o.title}

    </div>




    <small

    style={{

      color:darkMode ? '#94a3b8':'#64748b'

    }}

    >

    {o.siteName} · {o.priority}

    </small>




    </div>



    ))

    }





    </div>



    ))

    }





    </div>


    )


    }





    </div>


  );


}