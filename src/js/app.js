App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
 
 
  init: function() {
    return App.initWeb();
  },

 
  initWeb: async function() {
    const provider = window.ethereum
    if( provider ){
      // currently window.web3.currentProvider is deprecated for known security issues.
      // Therefore it is recommended to use window.ethereum instance instead
      App.webProvider = provider;
    }
    App.account = await window.ethereum.request({ method: 'eth_requestAccounts' });

    return App.initContract()
  },
 
 
  initContract: function(user) {

    $.getJSON("User.json", function( user ){
      // instantiate a new truffle contract from the artifict
      App.contracts.User = TruffleContract( user );
 
 
      // connect provider to interact with contract
      App.contracts.User.setProvider( App.webProvider );
 
      var doc = document.URL;
      
      if (doc === "http://localhost:3000/register-patient.html"){
        return App.registerPatient();
      }
      else if (doc === "http://localhost:3000/register-admin.html"){
        return App.registerAdmin();
      }
      else if (doc === "http://localhost:3000/update-data.html"){
        return App.updateData();
      }
      else if (doc == "http://localhost:3000/certificate.html"){
        return App.certificate();
      }
      else if (doc == "http://localhost:3000/trend-table.html"){
        return App.trendTable();
      }
      else{
        return App.login();
      }
      
    })
  },
 
 // User Login
  login: async function(){
    const data = await App.contracts.User.deployed();
    
    $("#login-btn").bind("click", async function(){
      const userId = $("#id").val();
      const userPass = $("#pass").val();
      
      const value = await data.getUser(userId)
      
      if (value !== "None"){
        if (value === userPass){
          console.log("Successful")
          // Access remaining pages
          await data.setSessionUser(userId, {from: App.account[0]});

          window.location.replace("http://localhost:3000/trend-table.html");
          
        }else{
          alert("Wrong Password")
        }
      }
      else{
        alert("User ID not found")
      }
    }); 
 },

 // Patient Registration
 registerPatient: async function(){
  

  const data = await App.contracts.User.deployed();

  $("#reg-btn").bind("click", async function(){
    const userId = $("#id").val();

    const value = await data.getUser(userId);
    
    if (value !== "None"){
      alert("User already exists, write a different ID")
    }

    else{
      const name = await $("#name").val()
      const dob = await $("#dob").val();
      const gender = await $("#gender").val();
      const vaccine = await $("#vaccine").val();
      const district = await $("#district").val();
      const symptoms = await $("#symptoms").val();
      const pass = await $("#pass").val();
      const mode = "patient";

      let dead = false;
      
      if ($("#dead").val() === "true"){
        dead = true;
      }
      else{
        dead = false;
      }

      const date = new Date;
      let age = date.getFullYear() - dob.split("-")[0]; 

      console.log(age);
      await data.registerUser(userId, name, pass, age, gender, vaccine, district, symptoms, dead, mode, {from: App.account[0]});
      

      console.log("Registration done");
      window.location.replace("http://localhost:3000");
      }

    });
  },

  // Admin Registration
  registerAdmin: async function(){
    const data = await App.contracts.User.deployed();
  
    $("#reg-btn").bind("click", async function(){
      const userId = $("#id").val();
  
      const value = await data.getUser(userId);
      
      if (value !== "None"){
        alert("User already exists, write a different ID")
      }
  
      else{
        const name = await $("#name").val()
        const dob = await $("#dob").val();
        const gender = await $("#gender").val();
        const pass = await $("#pass").val();
        const mode = "admin";
  
        const date = new Date;
        let age = date.getFullYear() - dob.split("-")[0]; 
  
        console.log(age);
        await data.registerUser(userId, name, pass, age, gender, "NULL", "NULL", "NULL", false, mode, {from: App.account[0]});
        
  
        console.log("Registration done");
        window.location.replace("http://localhost:3000");
        }
  
      });
    },


  // Data Update
  updateData: async function(){
    const data = await App.contracts.User.deployed();

    const sessionUser = await data.getSessionUser();
    const sessionMode = await data.getUserMode();

    if (sessionUser === ""){
      window.location.replace("http://localhost:3000");
    }

    else if (sessionMode === "patient"){
      window.location.replace("http://localhost:3000/trend-table.html");
    }

    else{

      // Show Patient List
      const patientList = await data.getPatientList();

      for (let i = 1; i < patientList.length; i++){
        let element = $(`<li>${patientList[i]}</li>`);
        $("#patient-list").append(element);
      }

      // Update Patient Vaccine Status
      $("#update-vaccine").bind("click", async function(){
        const userId = $("#id").val();
        const vaccine = $("#vaccine").val();
        
        if (patientList.includes(userId)){
          await data.updatePatientVaccine(userId, vaccine, {from: App.account[0]});
          alert(`Vaccine status of the patient with ID '${userId}' has been updated`)
        } else{
          alert(`User ID does not exist`)
        }
      });

      // Update Patient Dead
      $("#update-dead").bind("click", async function(){
        const userId = $("#id").val();
        let dead = false;

        if ($("#dead").val() === "true"){
          dead = true;
        }
        else{
          dead = false;
        }

        if (patientList.includes(userId)){
          await data.updatePatientDead(userId, dead, {from: App.account[0]});
          alert(`Living status of the patient with ID '${userId}' has been updated`)
        }else{
          alert(`User ID does not exist`)
        }
      });
    }

  },

  // Show table
  trendTable: async function(){
    const data = await App.contracts.User.deployed();

    const sessionUser = await data.getSessionUser();
    const sessionMode = await data.getUserMode();

    if (sessionUser === ""){
      window.location.replace("http://localhost:3000");
    }

    
    else{
      const deathCount = await data.getDeathCount();
      const patientCount = await data.getPatientCount();
      
      $("#death-rate").append(deathCount/patientCount);

      const highestPatient = await data.getHighestPatient();
      $("#highest-district").append(highestPatient[0]);
      $("#highest-patient").append(highestPatient[1].c[0]);
      
      const medianAgeList = await data.getMedianAge();
      const districtList = await data.getDistrictList();
      
      for (let i = 0; i < medianAgeList.length; i++){
        $(median).append(`<tr> <td>${districtList[i+1]}</td> <td>${medianAgeList[i]}</td></tr>`);
      }

      const children = await data.getChildren();
      const teen = await data.getTeen();
      const young = await data.getYoung();
      const elder = await data.getElder();

      const childP = (children.length / patientCount) * 100;
      const teenP = (teen.length / patientCount) * 100;
      const youngP = (young.length / patientCount) * 100;
      const elderP = (elder.length / patientCount) * 100;
      
      $("#children").append(childP);
      $("#teen").append(teenP);
      $("#young").append(youngP);
      $("#elder").append(elderP);

      console.log(sessionMode);
      if (sessionMode === "patient"){
        $("#cert-or-update").append("<a href='./certificate.html'>Download Certificate</a>");
      }
      else{
        $("#cert-or-update").append("<a href='./update-data.html'>Update Patient Data</a>");
      }
      
    }

    $("#logout-btn").bind("click", async function(){
      await data.setSessionUser("", {from: App.account[0]});
      window.location.replace("http://localhost:3000");

    })
  },

  // Get Certificate
  certificate: async function(){
    const data = await App.contracts.User.deployed();

    const sessionUser = await data.getSessionUser();
    const sessionMode = await data.getUserMode();

    if (sessionUser === ""){
      window.location.replace("http://localhost:3000");
    }

    else if (sessionMode === "admin"){
      window.location.replace("http://localhost:3000/trend-table.html");
    }

    else{
      const val = await data.getCertificate(sessionUser);

      if (val[3] === "two_dose"){
        $("#name").append(val[0]);
        $("#id").append(val[1]);
        $("#age").append(val[2].c[0]);
        $("#vaccine").append(val[3]);

        if (val[4]){
          $("#dead").append("Dead");
        }else{
          $("#dead").append("Alive");
        }
      }else{
        alert(`Your vaccine status is ${val[3]}. You need to have two dose.`);
        window.location.replace("http://localhost:3000/trend-table.html");
      }
      }
    }
    

};
 
 
 $(function() {
  $(window).load(function() {
    App.init();
  });
 });
 