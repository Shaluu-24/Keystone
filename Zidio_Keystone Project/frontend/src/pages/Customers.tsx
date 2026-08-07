import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';


export default function Customers() {


  const navigate = useNavigate();

  const { darkMode } = useTheme();




  const customers = [

    {
      id:'CUST-001',
      name:'Chennai Service Center',
      location:'Chennai',
      phone:'9876543210',
      requests:'5',
      status:'ACTIVE'
    },

    {
      id:'CUST-002',
      name:'Meridian HQ Tower',
      location:'Bangalore',
      phone:'9876543211',
      requests:'3',
      status:'ACTIVE'
    },

    {
      id:'CUST-003',
      name:'ABC Industries',
      location:'Coimbatore',
      phone:'9876543212',
      requests:'7',
      status:'ACTIVE'
    },

    {
      id:'CUST-004',
      name:'Green Tech Solutions',
      location:'Chennai',
      phone:'9876543213',
      requests:'2',
      status:'PENDING'
    }

  ];





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

        color:'#2563eb'

      }}

      >

      KEYSTONE

      </h1>



      <p

      style={{

        color:darkMode ? '#94a3b8':'#64748b'

      }}

      >

      Customer Management

      </p>


      </div>






      <button

      onClick={()=>navigate('/')}

      style={{

        background:'#2563eb',

        color:'white',

        border:'none',

        padding:'12px 22px',

        borderRadius:'10px',

        cursor:'pointer'

      }}

      >

      ← Back Dashboard

      </button>



      </div>









      <div

      style={{

        marginTop:'35px',

        display:'grid',

        gridTemplateColumns:'repeat(3,1fr)',

        gap:'25px'

      }}

      >





      {

      customers.map((customer)=>(



      <div

      key={customer.id}

      style={{

        background:darkMode ? '#111827':'white',

        padding:'25px',

        borderRadius:'18px',

        boxShadow:'0 8px 20px rgba(0,0,0,0.3)',

        borderTop:'5px solid #2563eb'

      }}

      >




      <h2>

      {customer.name}

      </h2>





      <p>

      <b>ID:</b> {customer.id}

      </p>




      <p>

      <b>Location:</b> {customer.location}

      </p>




      <p>

      <b>Phone:</b> {customer.phone}

      </p>




      <p>

      <b>Service Requests:</b> {customer.requests}

      </p>






      <p

      style={{

        color:

        customer.status==="ACTIVE"

        ?

        '#22c55e'

        :

        '#facc15',

        fontWeight:700

      }}

      >

      {customer.status}

      </p>







      <button

      onClick={()=>navigate(`/customers/${customer.id}`)}

      style={{

        background:'#2563eb',

        color:'white',

        border:'none',

        padding:'10px 18px',

        borderRadius:'8px',

        cursor:'pointer'

      }}

      >

      View Profile

      </button>






      </div>



      ))

      }





      </div>





    </div>


  );


}