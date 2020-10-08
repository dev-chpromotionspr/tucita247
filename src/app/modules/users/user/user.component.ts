import { Component, OnInit, Input } from '@angular/core';
import { User, Role } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService, RolesService, LocationService } from "@app/services";
import { AuthService } from '@core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Subscription, Observable, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  get f(){
    return this.userForm.controls;
  }

  userData: string = '';
  statTemp: number = 0;
  invalid: number = 0;
  userAct$: Observable<any>;
  businessId: string='';
  changesUser: Subscription;
  roles$: Observable<Role[]>;
  availability$: Observable<any>;
  userSave$: Observable<any>;
  user$: Observable<User>;
  hide = true;
  emailValidated: boolean = false;
  loadingUser: boolean = false;
  savingUser: boolean = false;
  userDataList: string="";
  textStatus: string ="";
  displayRole: number = 1;

  locs$: Observable<any[]>;
  // locations = [];

  readonly passKey = environment.passKey;
  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: UserService,
    private rolesService: RolesService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private data: MonitorService,
    private locationService: LocationService,
    private dialog: MatDialog
  ) { }
  // (?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&?])[a-zA-Z0-9!#$%&?]{8,}
  userForm = this.fb.group({
    UserId: [''],
    BusinessId: [''],
    Email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    First_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Last_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Password: ['',[Validators.minLength(8), Validators.maxLength(20), Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}")]],
    Avatar: [''],
    Phone: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(17)]],
    RoleId: ['', [Validators.required]],
    LocationId: ['', [Validators.required]],
    Is_Admin: [{value: 0, disabled: true}],
    Status: [1]
  })

  ngOnInit(): void {
    this.data.handleData('Add');
    this.userDataList = this.route.snapshot.paramMap.get('userId');

    // var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadingusersingle:`);
    this.businessId = this.authService.businessId();

    this.locs$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        if (res != null) {
          // this.locations = res.locs;
          return res.locs;
        }
      }),
      catchError(err => {
        // this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );

    this.roles$ = this.rolesService.getRoles(this.businessId + '/10/_/_').pipe(
      map((res: any) => {
        if (res != null) {
          // this.spinnerService.stop(spinnerRef);
          return res.roles;
        }
      }),
      catchError(err => {
        // this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.Message);
      })
    );
    
    this.onValueChanges();
    this.onDisplay();
  }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

  getErrorMessage(component: string) {
    const val200 = '200';
    const val3 = '3';
    const val100 = '100';
    const val6 = '6';
    const val17 = '17';
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? $localize`:@@login.error:` :
        this.f.Email.hasError('notUnique') ? $localize`:@@shared.emailregis:`:
          this.f.Email.hasError('maxlength') ? $localize`:@@shared.maximun: ${val200}` :
            this.f.Email.hasError('pattern') ? $localize`:@@forgot.emailformat:` :
            '';
    }
    if (component === 'First_Name'){
      return this.f.First_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
          this.f.First_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
            this.f.First_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
              '';
    }
    if (component === 'Last_Name'){
      return this.f.Last_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
          this.f.Last_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
            this.f.Last_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
              '';
    }
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val6}` :
            this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val17}` :
              '';
    }
    if (component === 'RoleId'){
      return this.f.RoleId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
    if (component === 'LocationId'){
      return this.f.LocationId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
  }

  onValueChanges(): void {
    this.changesUser = this.userForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.userForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.userForm.controls["Status"].setValue(0);
      }
      if (val.Is_Admin === true) {
        this.userForm.controls["Is_Admin"].setValue(1);
      }
      if (val.Is_Admin === false){
        this.userForm.controls["Is_Admin"].setValue(0);
      }
    })
  }

  onDisplay(){
    if (this.userDataList != undefined && this.userDataList != "0"){
      if (this.businessId == ''){
        this.businessId = this.authService.businessId();
      }
      this.statTemp = 0;
      var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadingusersingle:`);
      this.userForm.reset({UserId:'', BusinessId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', Phone: '', RoleId: 'None', LocationId: 'None', Is_Admin: 0, Status: 1});
      this.user$ = this.usersService.getUser(this.userDataList, this.businessId).pipe(
        tap(user => {
          if (user.User_Id != undefined){
            this.userForm.controls.Email.disable();
            if (user.Is_Admin === 1){
              this.displayRole = 0;
              this.userForm.controls['RoleId'].clearValidators();
            } else {
              this.userForm.controls['RoleId'].setValidators([Validators.required]);
            }
            this.userForm.setValue({
              UserId: user.User_Id,
              BusinessId: user.Business_Id,
              Email: user.Email,
              First_Name: user.First_Name,
              Last_Name: user.Last_Name,
              Password: '',
              Avatar: '',
              Phone: user.Phone,
              RoleId: (user.Is_Admin === 1 ? 'None' : user.Role_Id),
              LocationId: (user.Location_Id == '' ? '0' : user.Location_Id),
              Is_Admin: user.Is_Admin,
              Status: user.Status
            });
            this.textStatus = (user.Status == 0 ? $localize`:@@shared.disabled:` : $localize`:@@shared.enabled:`);
          } else {
            this.invalid = 1;
          }
          this.statTemp = user.Status;
          this.spinnerService.stop(spinnerRef);
          return user;   
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  onSubmit(){
    if (this.userForm.invalid) {
      return;
    }
    if (this.userForm.touched){
      let userId = this.userForm.value.UserId;
      var spinnerRef = this.spinnerService.start($localize`:@@users.savinguser:`);
      if (userId !== '' && userId !== null) {  
        let dataForm =  {
          "UserId": userId,
          "BusinessId": this.businessId,
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": '', //this.userForm.value.Password,
          "Phone": this.userForm.value.Phone,
          "RoleId": this.userForm.value.RoleId,
          "LocationId": (this.userForm.value.LocationId == '0' ? '' : this.userForm.value.LocationId),
          "Status": (this.statTemp === 3 ? 3 : this.userForm.value.Status)
        }
        this.userSave$ = this.usersService.updateUser(dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.spinnerService.stop(spinnerRef);
            this.emailValidated = false;
            this.userForm.controls.Email.enable();
            this.userData = '';
            this.statTemp = 0;
            this.userForm.reset({UserId:'', BusinessId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', Phone: '', RoleId: 'None', LocationId: 'None', Is_Admin: 0, Status: 1});
            this.data.changeData('users');
            this.openDialog($localize`:@@users.usertexts:`, $localize`:@@userloc.userupdated:`, true, false, false);
            this.router.navigate(['/users']);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingUser = false;
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let userLoggedId = this.authService.userId();
        var CryptoJS = require("crypto-js");
        var data = this.userForm.value.Password;
        var password = this.passKey;
        var ctObj = CryptoJS.AES.encrypt(data, password);
        var ctStr = ctObj.toString();
        let dataForm = { 
          "BusinessId": this.businessId,
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": ctStr,
          "Phone": this.userForm.value.Phone,
          "RoleId": this.userForm.value.RoleId,
          "LocationId": (this.userForm.value.LocationId == '0' ? '' : this.userForm.value.LocationId)
        }
        this.userSave$ = this.usersService.postUser(dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.spinnerService.stop(spinnerRef);
            this.emailValidated = false;
            this.userForm.controls.Email.enable();
            this.userData = '';
            this.statTemp = 0;
            this.userForm.reset({UserId:'', BusinessId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', Phone: '', RoleId: 'None', LocationId: 'None', Is_Admin: 0, Status: 1});
            this.data.changeData('users');
            this.openDialog($localize`:@@users.usertexts:`, $localize`:@@userloc.usercreated:`, true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingUser = false;
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  onCancel(){
    this.router.navigate(['/users']);
  }

  // allow only digits and dot
  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    this.changesUser.unsubscribe();
  }

  onSendCode(){
    let userId = this.userForm.value.UserId;
    let email = this.userData;
    if (email == '' && userId == '') {
      return;
    }
    
    var spinnerRef = this.spinnerService.start($localize`:@@users.sendingcode:`);
    let dataForm =  {
      "Email": email,
      "BusinessId": this.businessId,
      "Password": ""
    }
    // userName, '0', 
    this.userAct$ = this.usersService.putVerifCode('0', dataForm).pipe(
      tap((res: any) => { 
        this.spinnerService.stop(spinnerRef);
        if (res.Code == 200){
          this.openDialog($localize`:@@users.usertexts:`, $localize`:@@users.codesend:`, true, false, false);
        } else {
          this.openDialog($localize`:@@users.usertexts:`, $localize`:@@shared.wrong:`, false, true, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  checkEmailAvailability(data) { 
    this.emailValidated = false;
    if (data.target.value != ''){
      this.loadingUser = true;
      this.availability$ = this.usersService.validateEmail(data.target.value).pipe(
        tap((result: any) => { 
          this.emailValidated = true;
          if (result.Available == 0){
            this.userForm.controls.Email.setErrors({notUnique: true});
          } else {
            this.userForm.controls.Email.setErrors(null);
          }
          this.loadingUser = false;
          return result; 
        })
      );
    }
  }

}
