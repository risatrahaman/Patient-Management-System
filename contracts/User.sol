// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract User{

    // User Struct
    struct User {
        string id;
        string name;
        string pass;
        uint age;
        string gender;
        string vaccine_status;
        string district;
        string symptoms_details;
        bool is_dead;
        string mode;
    }

    // For checking if an user exists
    mapping(string => User) users;
    mapping(string => bool) userExists;

    // Patient List
    string[] patientList;
    uint patientCount;

    // Death Count
    uint deathCount = 0;
    
    // For checking if a district exists
    mapping (string => bool) districtExists;
    string[] districtList;

    // Covid count in each district
    mapping (string => uint) covidCountInDistrict;

    // Age List in each district
    mapping (string => uint[]) ageListInDistrict;

    // Age List for children
    uint[] ageListChildren;

    // Age List for teen
    uint[] ageListTeen;

    // Age List for young
    uint[] ageListYoung;

    // Age List for elder
    uint[] ageListElder;

    // Registers a user
    function registerUser(
        string memory _id,
        string memory _name,
        string memory _pass,
        uint _age,
        string memory _gender,
        string memory _vaccine_status,
        string memory _district,
        string memory _symptoms_details,
        bool _is_dead,
        string memory _mode
    ) public {
        // Create a new user
        users[_id] = User(_id,
        _name,
        _pass, 
        _age, 
        _gender,
        _vaccine_status,
        _district,
        _symptoms_details,
        _is_dead,
        _mode
        );

        userExists[_id] = true;


        // Checks if the user is patient or admin
        if (keccak256(abi.encodePacked(_mode)) == keccak256(abi.encodePacked("patient"))){

            // Checks if a district exists
            if (!(districtExists[_district])){
                districtExists[_district] = true;
                districtList.push(_district);
            }

            patientList.push(_id);
            patientCount++;
            
            // Increase covid count in each district by 1 when a patient registers
            covidCountInDistrict[_district]++;

            // Push user age in the age list for each district
            ageListInDistrict[_district].push(_age);

            // Push user age according to age
            if (_age < 13){
                ageListChildren.push(_age);
            }
            else if (_age >= 13 && _age < 20){
                ageListTeen.push(_age);
            }
            else if (_age >= 20 && _age < 50){
                ageListYoung.push(_age);
            }
            else{
                ageListElder.push(_age);
            }
            

            // Checks if the patient is is_dead
            if (_is_dead){
                deathCount++;
            }
        }
        
    }

    // For checking if a user has already registered
    function getUser(string memory _id) public view returns (string memory) {
        if (userExists[_id]){
            return users[_id].pass;
        }
        else{
            return "None";
        }
        
    }

    // Output the registered patient list
    function getPatientList() public view returns (string[] memory){
        
        string[] memory output = new string[](patientList.length+1);

        for (uint i = 0; i < patientList.length; i++) {
            output[i] = patientList[i];
        }

        output[patientList.length] = "";

        return output;
    }

    // Admin can update vaccine status of a patient
    function updatePatientVaccine(
        string memory _id,
        string memory _vaccine_status
        ) public {
            
            users[_id].vaccine_status = _vaccine_status;
    }

    // Admin can update the is_dead of a patient
    function updatePatientDead(
        string memory _id,
        bool _is_dead
    ) public {

        // Only change deathCount if the Admin updates to a new value
        if (keccak256(abi.encodePacked(_is_dead)) != keccak256(abi.encodePacked(users[_id].is_dead))){
             if (_is_dead){
                deathCount++;
            }
            else{
                deathCount--;
            }

            users[_id].is_dead = _is_dead;
        }
    }

    // Certificate output
    function getCertificate(string memory _id) public view returns (
        string memory, string memory, uint, string memory, bool){

        return (users[_id].name, 
        users[_id].id, users[_id].age,
         users[_id].vaccine_status, users[_id].is_dead);
    }

    // Get Death Count
    function getDeathCount() public view returns (uint){
        return deathCount;
    }
    
    // Get Patient Count
    function getPatientCount() public view returns (uint){
        return patientCount;
    }

    // Highest covid patient district
    function getHighestPatient() public view returns (string memory, uint){
        uint max = 0;
        string memory highestDistrict;

        for (uint i = 0; i < districtList.length; i++){
            if (covidCountInDistrict[districtList[i]] >= max){
                max = covidCountInDistrict[districtList[i]];
                highestDistrict = districtList[i];
            }
        }

        return (highestDistrict, max);
    }


    // Get district
    function getDistrictList() public view returns (string[] memory){
        string[] memory output = new string[](districtList.length+1);

        for (uint i = 0; i < districtList.length; i++) {
            output[i] = districtList[i];
        }

        output[districtList.length] = "";

        return output;
    }
    
    // Median age in each district 
    function getMedianAge() public view returns (uint[] memory){
        uint[] memory medianAgeList = new uint[](districtList.length);
        
        for (uint  i = 0; i < districtList.length; i++){
            uint[] memory ageList = ageListInDistrict[districtList[i]];
            
            // Sorting
            for (uint j = 0; j < ageList.length - 1; j++){
                for (uint k = 0; k < ageList.length - j - 1; k++){
                    if (ageList[k] > ageList[k + 1]){
                        (ageList[k], ageList[k + 1]) = (ageList[k + 1], ageList[k]);
                    }
                }
            }

            uint n = ageList.length;

            uint medianAge = 0;

            if (n % 2 != 0){
                uint term = (n + 1) / 2 - 1;
                medianAge = ageList[term]; 
            }
            else {
                uint term1 = n / 2;
                uint term2 = (n + 1) / 2;

                medianAge = (ageList[term1] + ageList[term2]) / 2 - 1;
                
            }
            medianAgeList[i] = medianAge;
        }
        
        return medianAgeList;
    }

    function getChildren() public view returns (uint[] memory){
        return ageListChildren;
    }

    function getTeen() public view returns (uint[] memory){
        return ageListTeen;
    }

    function getYoung() public view returns (uint[] memory){
        return ageListYoung;
    }

    function getElder() public view returns (uint[] memory){
        return ageListElder;
    }

    string sessionUser = "";
    function setSessionUser(string memory _userId) public{
        sessionUser = _userId;
    }

    function getSessionUser() public view returns (string memory){
        return sessionUser;
    }

    function getUserMode() public view returns (string memory){
        if (userExists[sessionUser]){
            return users[sessionUser].mode;
        }
    }

}
