import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CustomerRequest() {

  const navigate = useNavigate();

  const { user } = useAuth();


  const [service,setService] = useState("");

  const [location,setLocation] = useState("");

  const [issue,setIssue] = useState("");

  const [priority,setPriority] = useState("MEDIUM");

  const [submitted,setSubmitted] = useState(false);



  const submitRequest = () => {

    setSubmitted(true);


    const request = {

      customer:user?.name,

      service,

      location,

      issue,

      priority,

      status:"NEW",

      time:"Just now"

    };


    localStorage.setItem(
      "managerNotification",
      JSON.stringify(request)
    );


  };



  return (

    <div

      style={{

        minHeight:"100vh",

        background:"#020617",

        color:"white",

        padding:"40px",

        fontFamily:"Arial, sans-serif"

      }}

    >



      {/* HEADER */}


      <div

        style={{

          display:"flex",

          justifyContent:"space-between",

          alignItems:"center"

        }}

      >


        <h1

          style={{

            color:"#3b82f6"

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








      <h2

        style={{

          marginTop:"40px"

        }}

      >

        Create Service Request

      </h2>




      <p

        style={{

          color:"#94a3b8"

        }}

      >

        Submit your issue and request service support

      </p>








      <div

        style={{

          background:"#111827",

          padding:"30px",

          borderRadius:"18px",

          maxWidth:"600px",

          marginTop:"30px",

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

          Customer Name :

          <b style={{marginLeft:"10px"}}>

            {user?.name}

          </b>

        </p>







        <label>

          Service Type

        </label>


        <input

          placeholder="Example: AC Repair"

          value={service}

          onChange={(e)=>setService(e.target.value)}

          style={inputStyle}

        />







        <label>

          Location

        </label>


        <input

          placeholder="Service location"

          value={location}

          onChange={(e)=>setLocation(e.target.value)}

          style={inputStyle}

        />







        <label>

          Issue Description

        </label>


        <textarea

          placeholder="Describe your issue"

          value={issue}

          onChange={(e)=>setIssue(e.target.value)}

          style={{

            ...inputStyle,

            height:"100px"

          }}

        />








        <label>

          Priority

        </label>



        <select

          value={priority}

          onChange={(e)=>setPriority(e.target.value)}

          style={inputStyle}

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

            background:"#16a34a",

            color:"white",

            border:"none",

            padding:"14px 30px",

            borderRadius:"10px",

            cursor:"pointer",

            fontSize:"16px"

          }}

        >

          Send Request

        </button>







        {

          submitted &&

          (

            <div

              style={{

                marginTop:"25px",

                background:"#14532d",

                padding:"15px",

                borderRadius:"10px",

                color:"#bbf7d0"

              }}

            >

              Service request submitted successfully.

              <br/>

              Manager has been notified.

            </div>

          )

        }






      </div>



    </div>


  );

}





const inputStyle = {

  width:"100%",

  padding:"12px",

  marginTop:"10px",

  marginBottom:"20px",

  borderRadius:"10px",

  border:"1px solid #334155",

  background:"#020617",

  color:"white",

  fontSize:"16px"

};