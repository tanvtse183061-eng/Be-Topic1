
import './Login.css'
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash,faHouse } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
const initFormValue = {
    username: "",
    password: ""
};
const isEmptyValue=(value) =>{
    return ! value || value.trim().length<1;
}
export default function Login(){
      const [showPassword,setShowPassword] =useState(false);
      const togglePassword =()=>{
        setShowPassword(!showPassword);
      }
      const [formValue, setFormValue]=useState(initFormValue);
    const handleChange =(event) =>{
        const {name,value} =event.target;
        setFormValue({
            ...formValue,
            [name]:value,

        })
    }
    
    const handleSubmit = (event) =>{
        event.preventDefault();
        if (validateForm()){
            console.log("form value",formValue);
        }
        else{
            console.log("errors:", formError);
        }
        
    };

    
 const [formError,setFormError]=useState({});
const validateForm = () =>{
    const error={};
    if(isEmptyValue(formValue.username)){
        error["username"]="Username is required"
    }
    if (isEmptyValue(formValue.password)) {
        error["password"] = "Password is required"
    }
    setFormError(error);
    return Object.keys(error).length === 0;
    
}

    return(
     <div className="Login-page">
       <div className="Login-form-container">
        <h1 >Login</h1>
        <form className='input-box' onSubmit={handleSubmit}>
            <div className="content">
                
                <label htmlFor="username" className="form-label">
                    UserName
                </label>
                <input
                id="username"
                className="form-control"
                type="text"
                name="username"
                value={formValue.username}
                onChange={handleChange}
                />

            
             <FontAwesomeIcon icon={faCircleUser} size="1.5x" color="navy" className='icon'/>
                             <div className='error'>
              {formError.username && <p className="error-text">{formError.username}</p>}
              </div>
                    
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            id="password"
                            className="form-control"
                            type={showPassword ?"text":"password"}
                            name="password"
                                value={formValue.password}
                                onChange={handleChange}
                        />  
                        <span onClick={togglePassword} style={{cursor:"pointer"}} className='icon' >
                            <FontAwesomeIcon icon={showPassword? faEyeSlash :faEye} size="1.5x" color='navy'></FontAwesomeIcon>

                        </span>
                        <div className='error'>
                            {formError.password && <p className="error-text">{formError.password}</p>}
                                  </div>
                 
                               </div>
                    
                        <div className='checkbox'>
                        <input type="checkbox" id="remember"  />
                            <label htmlFor="remember" >Remember me</label>
                        </div>
                        <div className='button'>
                           <button type="submit" className="btn-login">
                            Login
                        </button> 
                        </div>
                        
        </form>    <div className='Home'>
                    <Link to="/home"><FontAwesomeIcon icon={faHouse} size="2x" color='gray' /></Link>
                     </div>
                
       </div>
     </div>

    
    )
}


