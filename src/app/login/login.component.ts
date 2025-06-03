import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Credential } from '../models/user/Credential';
import { Router } from '@angular/router';
import { Token } from '../models/user/Token';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

    constructor( private userService: UserService,
	         private router: Router
    ) 
    { } 

    email : String = "adsoft@live.com.mx";
    password : String = "123";
    myLogin = new Token();

    callLogin() {

      //alert("login..."); 
     
     var myCredential = new Credential();
      
     myCredential.email = this.email;
     myCredential.password = this.password;
 
     this.myLogin = this.userService.postLogin(
        myCredential 
       );   
     if (this.myLogin.token != "")
        this.router.navigate(['/home']);

     console.log(this.myLogin);

    } 
}