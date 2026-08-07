import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();


  const requests = [

    {
      id:"WO-00004",
      service:"AC Maintenance Request",
      location:"Meridian HQ Tower",
      priority:"HIGH",
      status:"ASSIGNED"
    },

    {
      id:"WO-00005",
      service:"AC Repair",
      location:"Chennai Service Center",
      priority:"MEDIUM",
      status:"COMPLETED"
    }

  ];



  return (

    <div

      style={{

        minHeight:"100vh",

        display:"flex",

        background:"#020617",

        color:"white",

        fontFamily:"Arial, sans-serif"

      }}

    >



      {/* SIDEBAR */}

      <aside

        style={{

          width:"260px",

          background:"#111827",

          padding:"30px 20px",

          borderRight:"1px solid #1e3a8a"

        }}

      >


        <h1

          style={{

            color:"#3b82f6",

            marginBottom:"40px"

          }}

        >

          KEYSTONE

        </h1>




        <Menu

          title="▦ Dashboard"

          onClick={()=>navigate("/")}

        />



        <Menu

          title="▤ My Service Requests"

        />




        <Menu

          title="＋ Create Request"

          onClick={()=>navigate("/customer-request")}

        />




        <Menu

          title="◉ Notifications"

          onClick={()=>navigate("/notifications")}

        />





        <Menu

          title="⚙ Settings"

          onClick={()=>navigate("/settings")}

        />





        <Menu

          title="? Help & Support"

          onClick={()=>navigate("/help")}

        />





        <Menu

          title="◯ Profile"

          onClick={()=>navigate("/profile")}

        />







        <button

          onClick={logout}

          style={{

            marginTop:"30px",

            width:"100%",

            background:"#dc2626",

            color:"white",

            border:"none",

            padding:"12px",

            borderRadius:"10px",

            cursor:"pointer"

          }}

        >

          ⇥ Logout

        </button>



      </aside>









      {/* MAIN */}


      <main

        style={{

          flex:1,

          padding:"40px"

        }}

      >

      <div>

  <h1
    style={{
      color:"#3b82f6",
      marginBottom:"15px"
    }}
  >
    Customer Dashboard
  </h1>

  <p
    style={{
      fontSize:"18px",
      color:"#cbd5e1",
      marginBottom:"8px"
    }}
  >
    Welcome Customer
  </p>

  <p
    style={{
      color:"#94a3b8",
      fontSize:"16px",
      marginBottom:"30px"
    }}
  >
    Create service requests, track progress, and manage your service history.
  </p>

</div>

       
      









        <button

          onClick={()=>navigate("/customer-request")}

          style={{

            marginTop:"30px",

            background:"#16a34a",

            color:"white",

            border:"none",

            padding:"14px 25px",

            borderRadius:"10px",

            cursor:"pointer"

          }}

        >

          ＋ Create New Request

        </button>








        <h2

          style={{

            marginTop:"40px"

          }}

        >

          My Service Requests

        </h2>








        <div

          style={{

            display:"grid",

            gridTemplateColumns:"repeat(2,1fr)",

            gap:"25px",

            marginTop:"25px"

          }}

        >


        {

          requests.map((request)=>(


            <div

              key={request.id}

              style={{

                background:"#111827",

                padding:"25px",

                borderRadius:"18px",

                borderTop:"5px solid #2563eb"

              }}

            >



              <h2

                style={{

                  color:"#3b82f6"

                }}

              >

                {request.id}

              </h2>




              <p>

                <b>Service:</b> {request.service}

              </p>



              <p>

                <b>Location:</b> {request.location}

              </p>



              <p>

                <b>Priority:</b> {request.priority}

              </p>




              <p

                style={{

                  color:"#22c55e",

                  fontWeight:"bold"

                }}

              >

                {request.status}

              </p>





              <button

                onClick={()=>navigate(`/customer-request/${request.id}`)}

                style={{

                  background:"#2563eb",

                  color:"white",

                  border:"none",

                  padding:"10px 20px",

                  borderRadius:"8px",

                  cursor:"pointer"

                }}

              >

                View Details

              </button>



            </div>


          ))

        }



        </div>




      </main>



    </div>

  );

}







function Menu({

  title,

  onClick

}:{

  title:string;

  onClick?:()=>void;

}){


return (

<div

onClick={onClick}

style={{

padding:"15px",

marginBottom:"12px",

background:"#1e293b",

borderRadius:"10px",

cursor:"pointer",

color:"white",

fontWeight:"500"

}}

>

{title}

</div>

);


}