import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { interval, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, ReasonsService, BusinessService, AppointmentService, ServService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError, switchMap, mergeMap, tap } from 'rxjs/operators';
import { Appointment, Reason } from '@app/_models';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { VideoDialogComponent } from '@app/shared/video-dialog/video-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DirDialogComponent } from '@app/shared/dir-dialog/dir-dialog.component';
import { MonitorService } from '@app/shared/monitor.service';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostComponent implements OnInit {
  locations$: Observable<Location[]>;
  appointmentsSche$: Observable<Appointment[]>;
  appointmentsWalk$: Observable<Appointment[]>;
  appointmentsPre$: Observable<Appointment[]>;
  appointmentsPrevious$: Observable<Appointment[]>;
  getWalkIns$: Observable<any[]>;
  messages$: Observable<any>;
  newAppointment$: Observable<any>;
  updAppointment$: Observable<any>;
  getMessages$: Observable<any[]>;
  quantityPeople$: Observable<any>;
  checkOutQR$: Observable<any>;
  checkIn$: Observable<any>;
  comments$: Observable<any>;
  opeHours$: Observable<any>;
  getLocInfo$: Observable<any>;
  reasons$: Observable<any>;
  openLoc$: Observable<any>;
  closedLoc$: Observable<any>;
  manualCheckOut$: Observable<any>;
  newTime$: Observable<any>;
  resetLoc$: Observable<any>;

  showMessageSche=[];
  showMessageWalk=[];
  showMessageCheck=[];
  showMessagePrev=[];

  getCommentsSche=[];
  getCommentsWalk=[];
  getCommentsCheck=[];
  getCommentsPrev=[];

  showDetailsSche=[];
  showDetailsWalk=[];
  showDetailsCheck=[];
  showDetailsPrev=[];

  showCancelOptionsCheck=[];
  showCancelOptionsWalk=[];
  showCancelOptionsSche=[];
  showCancelOptionsPrev=[];

  showPrevious: boolean = false;
  
  selectedCheck=[];
  selectedWalk=[];
  selectedSche=[];
  selectedPrev=[];

  getWalkInstoCheckOut=[];

  buckets=[];
  currHour: number = 0;
  prevHour: number = 0;
  firstHour: number = 0;
  bucketInterval: number = 0;
  manualCheckOut: number = 0;
  qtyPeople: number = 0;
  perLocation: number = 0;
  totLocation: number = 0;
  reasons: Reason[]=[];

  doors: string[]=[];
  businessId: string = '';
  userId: string = '';
  showDoorInfo: boolean = false;
  showApp: boolean = false;
  locationStatus: number = 0;
  checkInModule: number = 0;
  checkOutModule: number = 0;
  numGuests: number = 1;
  textOpenLocation: string = '';
  locName: string = '';
  maxGuests: number = 1;

  locations: any[]=[];
  locationId: string = '';
  doorId: string = '';
  qrCode: string = '';

  onError: string = '';
  manualGuests: number =  1;
  operationText: string = '';

  Providers: any[]=[];
  services: any[]=[];
  providerId: string = '';
  panelOpenState = false;
  seeDetails: string = $localize`:@@shared.seedetails:`;
  hideDetails: string = $localize`:@@shared.hidedetails:`;
  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  liveData$ = this.monitorService.syncMessage.pipe(
    map((message: any) => {
      this.syncData(message);
    })
  );
  // liveData$ = this.webSocketService.messages$.pipe(
  //   map((res: any) => {
  //     console.log(res);
  //     this.syncData(res);
  //   }),
  //   catchError(error => { throw error }),
  //   tap({
  //     error: error => console.log('[Live Table component] Error:', error),
  //     complete: () => console.log('[Live Table component] Connection Closed')
  //   })
  // );

  // readonly PUSH_URL = 'wss://1wn0vx0tva.execute-api.us-east-1.amazonaws.com/prod?businessId=12345';
  constructor(
    private domSanitizer: DomSanitizer,
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private businessService: BusinessService,
    private reasonService: ReasonsService,
    private locationService: LocationService,
    private serviceService: ServService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private router: Router,
    private monitorService: MonitorService
  ) {
    this.matIconRegistry.addSvgIcon('cancel',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancel.svg'));
    this.matIconRegistry.addSvgIcon('clock',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/clock.svg'));
    this.matIconRegistry.addSvgIcon('expand',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand.svg'));
    this.matIconRegistry.addSvgIcon('handicap',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/handicap.svg'));
    this.matIconRegistry.addSvgIcon('older',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/older.svg'));
    this.matIconRegistry.addSvgIcon('pregnant',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/pregnant.svg'));
    this.matIconRegistry.addSvgIcon('readycheck',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/readycheck.svg'));
    this.matIconRegistry.addSvgIcon('sms',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/sms.svg'));
    this.matIconRegistry.addSvgIcon('mas',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/mas.svg'));
    this.matIconRegistry.addSvgIcon('menos',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/menos.svg'));
  }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ServiceId: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: ['1'],
    Disability: [''],
    Guests: ['1', [Validators.required, (control: AbstractControl) => Validators.max(this.maxGuests)(control), Validators.min(1)]],
    ProviderId: ['']
  })

  schedule = [];
  walkIns = [];
  preCheckIn =[]
  previous=[];

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
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

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  syncData(msg: any){
    //NEW APPOINTMENT
    if (msg == null) {return;}
    console.log(msg);
    if (msg['Tipo'] == 'APPO'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        if (this.schedule.filter(x => x.AppId ==  msg['AppId']).length == 0){
          let hora = msg['DateAppo'];
          let data = {
            AppId: msg['AppId'],
            ClientId: msg['CustomerId'],
            ProviderId: msg['ProviderId'],
            Name: msg['Name'].toLowerCase(),
            OnBehalf: msg['OnBehalf'],
            Guests: msg['Guests'],
            Door: msg['Door'],
            Disability: msg['Disability'],
            Phone: msg['Phone'],
            DateFull: msg['DateFull'],
            Type: msg['Type'],
            DateAppo: hora,
            Unread: 0
          }
          if (msg['Type'] == '1'){
            var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
            if (verifSche >= 0){return;}
            this.schedule.push(data);
          }
          if (msg['Type'] == '2'){
            var verifWalk = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
            if (verifWalk >= 0){return;}
            this.walkIns.push(data);
          }
        }
      }  
    }
    if (msg['Tipo'] == 'MESS'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1 && msg['User'] == 'H'){
        let resScheMess = this.schedule.findIndex(x => x.AppId === msg['AppId']);
        if (resScheMess >= 0){
          this.schedule[resScheMess].Unread = "H";
        }
        let resWalkInsMess = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
        if (resWalkInsMess >= 0){
          this.walkIns[resWalkInsMess].Unread = "H";
        }
        let resPreviousMess = this.previous.findIndex(x => x.AppId === msg['AppId']);
        if (resPreviousMess >= 0){
          this.previous[resPreviousMess].Unread = "H";
        }
        let resPreCheckInMess = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
        if (resPreCheckInMess >= 0){
          this.preCheckIn[resPreCheckInMess].Unread = "H";
        }
      }
    }
    if (msg['Tipo'] == 'CANCEL'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
        if (verifSche >= 0){this.schedule.splice(verifSche, 1);}

        var verifWalkIns = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
        if (verifWalkIns >= 0){this.walkIns.splice(verifWalkIns, 1);}

        var verifpreCheck = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
        if (verifpreCheck >= 0){this.preCheckIn.splice(verifpreCheck, 1);}

        var verifprevious = this.previous.findIndex(x => x.AppId === msg['AppId']);
        if (verifprevious >= 0){this.previous.splice(verifprevious, 1);}
      }
    }
    if (msg['Tipo'] == 'MOVE'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        if (msg['To'] == 'PRECHECK'){
          var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
          if (verifSche >= 0){
            var dataSche = this.schedule[verifSche];
            this.schedule.splice(verifSche, 1);
            let data = {
              AppId: dataSche['AppId'],
              ClientId: dataSche['ClientId'],
              ProviderId: dataSche['ProviderId'],
              Name: dataSche['Name'].toLowerCase(),
              OnBehalf: dataSche['OnBehalf'],
              Guests: dataSche['Guests'],
              Door: dataSche['Door'],
              Disability: dataSche['Disability'],
              Phone: dataSche['Phone'],
              DateFull: dataSche['DateFull'],
              DateAppo: dataSche['DateAppo'],
              Type: dataSche['Type'],
              Unread: dataSche['Unread'],
              CheckInTime: msg['Time'],
              ElapsedTime: "0"
            }
            this.preCheckIn.push(data);
          }

          var verifWalkIns = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
          if (verifWalkIns >= 0){
            var dataWalk = this.walkIns[verifWalkIns];
            this.walkIns.splice(verifWalkIns, 1);
            let data = {
              AppId: dataWalk['AppId'],
              ClientId: dataWalk['ClientId'],
              ProviderId: dataWalk['ProviderId'],
              Name: dataWalk['Name'].toLowerCase(),
              OnBehalf: dataWalk['OnBehalf'],
              Guests: dataWalk['Guests'],
              Door: dataWalk['Door'],
              Disability: dataWalk['Disability'],
              Phone: dataWalk['Phone'],
              DateFull: dataWalk['DateFull'],
              DateAppo: dataWalk['DateAppo'],
              Type: dataWalk['Type'],
              Unread: dataWalk['Unread'],
              CheckInTime: msg['Time'],
              ElapsedTime: "0"
            }
            this.preCheckIn.push(data);
          }
          
          var verifprevious = this.previous.findIndex(x => x.AppId === msg['AppId']);
          if (verifprevious >= 0){
            var dataPrev = this.previous[verifprevious];
            this.previous.splice(verifprevious, 1);
            let data = {
              AppId: dataPrev['AppId'],
              ClientId: dataPrev['ClientId'],
              ProviderId: dataPrev['ProviderId'],
              Name: dataPrev['Name'].toLowerCase(),
              OnBehalf: dataPrev['OnBehalf'],
              Guests: dataPrev['Guests'],
              Door: dataPrev['Door'],
              Disability: dataPrev['Disability'],
              Phone: dataPrev['Phone'],
              DateFull: dataPrev['DateFull'],
              DateAppo: dataPrev['DateAppo'],
              Type: dataPrev['Type'],
              Unread: dataPrev['Unread'],
              CheckInTime: msg['Time'],
              ElapsedTime: "0"
            }
            this.preCheckIn.push(data);
          }
        }
        if (msg['To'] == 'CHECKIN'){
          var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
          if (verifSche >= 0){
            this.schedule.splice(verifSche, 1);
          }

          var verifpreCheck = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
          if (verifpreCheck >= 0){
            this.preCheckIn.splice(verifpreCheck, 1);
          }
          if (this.checkInModule == 0){
            this.qtyPeople = +this.qtyPeople+msg['Guests'];
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }
          this.checkInModule = 0;
        }
        if (msg['To'] == 'CHECKOUT'){
          if (this.checkOutModule == 0){
            this.qtyPeople = +this.qtyPeople-msg['Guests'];
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }
          this.checkOutModule = 0;
        }
      }
    }
    if (msg['Tipo'] == 'CLOSED'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        this.locationStatus = 0;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        this.previous = [];
        this.schedule = [];
        this.walkIns = [];
        this.preCheckIn = [];
        this.closedLoc$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
          map((res: any) => {
            if (res.Locs != null){
              if (res.Locs.length > 0){
                this.locations = res.Locs;
                let indexLoc = this.locations.findIndex(x=>x.LocationId == this.locationId);
                if (indexLoc < 0) { indexLoc = 0; }
                this.locationId = res.Locs[indexLoc].LocationId;
                this.doorId = res.Locs[indexLoc].Door;
                this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
                this.totLocation = res.Locs[indexLoc].MaxCustomers;
                this.Providers = res.Locs[indexLoc].Providers;
                this.locName = res.Locs[indexLoc].Name;
                this.locationStatus = res.Locs[indexLoc].Open;
                this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                if (this.Providers.length > 0){
                  this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                  this.providerId = this.Providers[0].ProviderId;
                  this.providerId = "0";
                }
              }
              return res;
            } else {
              // this.spinnerService.stop(spinnerRef);
              this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
              this.router.navigate(['/']);
              return;
            }
          })
        );
        this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.locationclosed:`, false, true, false);
      }
    }
    if (msg['Tipo'] == 'RESET'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        this.qtyPeople = 0;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }
    }
    if (msg['Tipo'] == 'OPEN'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 0){
        this.locationStatus = 1;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        this.getAppointmentsSche();
        this.getAppointmentsWalk();
        this.getAppointmentsPre();

        var spinnerRef = this.spinnerService.start($localize`:@@host.loadingopeloc:`);
        this.openLoc$ = this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          }),
          switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
            map((res: any) => {
              if (res.Locs != null){
                // this.Providers = res.Locs.Providers;
                // return res;
                if (res.Locs.length > 0){
                  this.locations = res.Locs;
                  let indexLoc = this.locations.findIndex(x=> x.LocationId == this.locationId);
                  if (indexLoc < 0) { indexLoc = 0;}
                  this.locationId = res.Locs[indexLoc].LocationId;
                  this.doorId = res.Locs[indexLoc].Door;
                  this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
                  this.totLocation = res.Locs[indexLoc].MaxCustomers;
                  this.Providers = res.Locs[indexLoc].Providers;
                  this.locName = res.Locs[indexLoc].Name;
                  this.locationStatus = res.Locs[indexLoc].Open;
                  this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                  if (this.Providers.length > 0){
                    this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                    // this.providerId = this.Providers[0].ProviderId;
                    this.providerId = "0";
                  }
                }
                this.spinnerService.stop(spinnerRef);
                return res;
              } else {
                this.spinnerService.stop(spinnerRef);
                this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
                this.router.navigate(['/']);
                return;
              }
            })
          )),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.locationStatus = 0;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
            this.onError = err.Message;
            return this.onError;
          })
        );
      }
    }
  }

  ngAfterViewInit(){
    // this.webSocketService.connect();
  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this.userId = this.authService.userId();

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocs:`);
    this.getLocInfo$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
      map((res: any) => {
        if (res.Locs != null){
          if (res.Locs.length > 0){
            this.locations = res.Locs;
            this.locationId = res.Locs[0].LocationId;
            this.doorId = res.Locs[0].Door;
            this.manualCheckOut = res.Locs[0].ManualCheckOut;
            this.totLocation = res.Locs[0].MaxCustomers;
            this.Providers = res.Locs[0].Providers;
            this.locName = res.Locs[0].Name;
            this.locationStatus = res.Locs[0].Open;  //0 CLOSED, 1 OPEN
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
            if (this.Providers.length > 0){
              this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
              // this.providerId = this.Providers[0].ProviderId;
              this.providerId = "0";
            }
          }
          return res;
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
          this.router.navigate(['/']);
          return;
        }
      }),
      switchMap(val => val = this.businessService.getBusinessOpeHours(this.businessId, this.locationId)),
      map((res: any) => {
        if (res.Code == 200) {
          this.bucketInterval = 1;//parseFloat(res.BucketInterval);
          this.currHour = parseFloat(res.CurrHour);
          let hours = res.Hours;
          this.buckets = [];
          for (var i=0; i<=hours.length-1; i++){
            let horaIni = parseFloat(hours[i].HoraIni);
            let horaFin = parseFloat(hours[i].HoraFin);
            if (i ==0){
              this.firstHour = horaIni;
            }
            for (var x=horaIni; x<=horaFin; x+=this.bucketInterval){
              let hora = '';
              if (x % 1 != 0){
                hora = (x - (x%1)).toString().padStart(2,'0') + ':30';
              } else {
                hora = x.toString().padStart(2, '0') + ':00';
              }
              this.buckets.push({ TimeFormat: hora, Time: x });
              if (x == this.currHour) {
                if (x-this.bucketInterval>= horaIni){
                  this.prevHour = this.currHour-this.bucketInterval;
                }
              }
            }
          }
          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          return;
        }
      }),
      switchMap((value: any) => {
        value = this.locationService.getLocationQuantity(this.businessId, this.locationId);
        return value;
      }),
      map((res: any) => {
        this.qtyPeople = res.Quantity;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }),
      map(_ => {
        if (this.locationId != '' && this.locationStatus == 1){
          this.getAppointmentsSche();
          this.getAppointmentsWalk();
          this.getAppointmentsPre();
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );

    this.reasons$ = this.reasonService.getReasons(this.businessId).pipe(
      map((res: any) => {
        if (res != null ){
          if (res.Code == 200){
            this.reasons = res.Reasons.split(',');
            return res.Reasons.split(',');
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );

    this.newTime$ = interval(60000).pipe(
      map(() => {
        this.preCheckIn.forEach(res => {
          let options = {
            timeZone: 'America/Puerto_Rico',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
          },
          formatter = new Intl.DateTimeFormat([], options);
          var actual = formatter.format(new Date());
          var d = new Date();
          d.setHours(+res.CheckInTime.substring(11,13));
          d.setMinutes(+res.CheckInTime.substring(14,16));
          
          var a = new Date();
          a.setHours(+actual.substring(0,2));
          a.setMinutes(+actual.substring(3,5));
          
          var diff = (+a - +d); 
          var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
          var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
          var diff = (diffHrs*60)+diffMins;
          res.ElapsedTime = diff.toString();
        })
      })
    );

    setInterval(() => {
      for (var i=0; i<=this.buckets.length-1; i++){
        if (this.buckets[i].Time == this.currHour){
          this.currHour = this.buckets[i].Time;
          if (i-1 >= 0){
            this.prevHour = this.buckets[i-1].Time;
          }
        }
      }
    }, 1200000);
  }

  openLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingopeloc:`);
    this.openLoc$ = this.locationService.updateOpenLocation(this.locationId, this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          if (res['Business'].OPEN == 1){
            this.locationStatus = 1;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
            this.spinnerService.stop(spinnerRef);
            this.getAppointmentsSche();
            this.getAppointmentsWalk();
            this.getAppointmentsPre();
          }
        }
      }),
      mergeMap(v => 
        //ACTUALIZA NUMERO DE PERSONAS
        this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
        map((res: any) => {
          if (res.Locs != null){
            if (res.Locs.length > 0){
              this.locations = res.Locs;
              let indexLoc = this.locations.findIndex(x=> x.LocationId == this.locationId);
              if (indexLoc < 0) { indexLoc = 0;}
              this.locationId = res.Locs[indexLoc].LocationId;
              this.doorId = res.Locs[indexLoc].Door;
              this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
              this.totLocation = res.Locs[indexLoc].MaxCustomers;
              this.Providers = res.Locs[indexLoc].Providers;
              this.locName = res.Locs[indexLoc].Name;
              this.locationStatus = res.Locs[indexLoc].Open;
              this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
              if (this.Providers.length > 0){
                this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                // this.providerId = this.Providers[0].ProviderId;
                this.providerId = "0";
              }
            }
            return res;
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
            this.router.navigate(['/']);
            return;
          }
        })
      )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.locationStatus = 0;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  resetLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocs:`);
    this.resetLoc$ = this.locationService.updateClosedLocation(this.locationId, this.businessId, 0, this.authService.businessLanguage()).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.qtyPeople = 0;
        }
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err =>{
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  closedLocation(){
    const dialogConfigClosed = new MatDialogConfig();
    dialogConfigClosed.autoFocus = false;
    dialogConfigClosed.data = {
      header: $localize`:@@host.closedlocheader:`, 
      message: $localize`:@@host.closedloc:`, 
      success: false, 
      error: false, 
      warn: false,
      ask: true
    };
    dialogConfigClosed.width ='280px';
    dialogConfigClosed.minWidth = '280px';
    dialogConfigClosed.maxWidth = '280px';

    const dialogRefClosed = this.dialog.open(DialogComponent, dialogConfigClosed);
    let valueSel;
    var spinnerRef: any;
    this.closedLoc$ = dialogRefClosed.afterClosed().pipe(
      map(result => {
        if (!result) {
          throw 'exit process';
        }
        spinnerRef = this.spinnerService.start($localize`:@@shared.closingLoc:`);
        return result;
      }),
      switchMap(x => this.locationService.updateClosedLocation(this.locationId, this.businessId, 1, this.authService.businessLanguage()).pipe(
          map((res: any) => {
            if (res != null){
              if (res['Business'].OPEN == 0){
                this.locationStatus = 0;
                this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                this.previous = [];
                this.schedule = [];
                this.walkIns = [];
                this.preCheckIn = [];
              }
            }
          }),
          switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
            map((res: any) => {
              if (res.Locs != null){
                if (res.Locs.length > 0){
                  this.locations = res.Locs;
                  let indexLoc = this.locations.findIndex(x=>x.LocationId == this.locationId);
                  if (indexLoc < 0) { indexLoc = 0;}
                  this.locationId = res.Locs[indexLoc].LocationId;
                  this.doorId = res.Locs[indexLoc].Door;
                  this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
                  this.totLocation = res.Locs[indexLoc].MaxCustomers;
                  this.Providers = res.Locs[indexLoc].Providers;
                  this.locName = res.Locs[indexLoc].Name;
                  this.locationStatus = res.Locs[indexLoc].Open;
                  this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                  if (this.Providers.length > 0){
                    this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                    this.providerId = this.Providers[0].ProviderId;
                    this.providerId = "0";
                  }
                }
                this.spinnerService.stop(spinnerRef);
                return res;
              } else {
                // this.spinnerService.stop(spinnerRef);
                this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
                this.router.navigate(['/']);
                this.spinnerService.stop(spinnerRef);
                return;
              }
            })
          )),
          mergeMap(v => 
            //ACTUALIZA NUMERO DE PERSONAS
            this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
              map((res: any) => {
                if (res != null){
                  this.qtyPeople = +res.Quantity;
                  this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
                  return res.Quantity.toString();
                }
              })
            )
          )
        )
      ),
      catchError(err => {
        if (spinnerRef != undefined) { this.spinnerService.stop(spinnerRef); }
        this.locationStatus = 1;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        console.log(err);
        return of(err);
      })
    );
  }

  validateService(event){
    let res = this.services.filter(x => x.ServiceId == event.value);
    if (res.length > 0) { this.maxGuests = res[0].CustomerPerBooking; }
    this.numGuests =  1;
    this.clientForm.patchValue({'Guests': this.numGuests});
  }

  addGuests(){
    if (this.numGuests < this.maxGuests) {
      this.numGuests = this.numGuests+1;
    } else {
      this.numGuests = this.numGuests;
    }
    this.clientForm.patchValue({'Guests': this.numGuests});
  }

  remGuests(){
    if (this.numGuests > 1) {
      this.numGuests=this.numGuests-1;
     } else {
      this.numGuests = this.numGuests;
     }
     this.clientForm.patchValue({'Guests': this.numGuests});
  }

  checkOutQR(){
    const dialogRef = new MatDialogConfig();
    dialogRef.width ='450px';
    dialogRef.minWidth = '320px';
    dialogRef.maxWidth = '450px';
    dialogRef.height = '575px';
    dialogRef.data = {guests: 0, title: $localize`:@@host.checkoutpop:`, tipo: 2, businessId: this.businessId, locationId: this.locationId, providerId: this.providerId};
    const qrDialog = this.dialog.open(VideoDialogComponent, dialogRef);
    this.checkOutQR$ = qrDialog.afterClosed().pipe(
      map((result: any) => {
        if (result != undefined) {
          let qtyGuests = result.Guests;
          this.qrCode = result.qrCode;
          if (this.qrCode != ''){
            this.checkOutAppointment(this.qrCode);
          }
          if (qtyGuests > 0 && this.qrCode == ''){
            this.setManualCheckOut(qtyGuests);
          }
        }
      })
    );
  }

  checkOutAppointment(qrCode: string){
    let formData = {
      Status: 4,
      qrCode: qrCode,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: this.providerId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.checkOutModule = 1;
    this.checkIn$ = this.appointmentService.updateAppointmentCheckOut(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
        }
      }),
      mergeMap(v => 
        //ACTUALIZA NUMERO DE PERSONAS
        this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = +res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      catchError(err => {
        this.checkOutModule = 0;
        if (err.Status == 404){
          this.openSnackBar(err.Message, $localize`:@@host.checkoutpop:`);
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  setManualCheckOut(qtyOut: number){
    this.checkOutModule = 1;
    this.manualCheckOut$ = this.appointmentService.updateManualCheckOut(this.businessId, this.locationId, this.providerId, qtyOut).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
        }
      }),
      mergeMap(v =>
        //ACTUALIZA NUMERO DE PERSONAS
        this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      catchError(err => {
        this.checkOutModule = 0;
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  getWalkInsCheckOut(){
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingwalkins:`);
    this.getWalkIns$ = this.locationService.getWalkInsCheckOut(this.businessId, this.locationId, dateAppo).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);

          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = { 
            walkIns : res['Appos'],
            businessId: this.businessId,
            locationId: this.locationId
          };
          dialogConfig.width ='80%';
          dialogConfig.minWidth = '80%';
          dialogConfig.height = '600px';
          this.dialog.open(DirDialogComponent, dialogConfig);

          this.quantityPeople$ = this.dialog.afterAllClosed.pipe(
            map((res:any) => {
              //ACTUALIZA NUMERO DE PERSONAS
              this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
                map((res: any) => {
                  if (res != null){
                    this.qtyPeople = +res.Quantity;
                    this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
                    return res.Quantity.toString();
                  }
                }),
                catchError(err => {
                  this.onError = err.Message;
                  return '0';
                })
              )
            })
          );
          return res.Appos;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  addAppointment(){
    let timeAppo = this.getTime();
    if (timeAppo == ""){
      this.openSnackBar($localize`:@@host.invalidTime:`, $localize`:@@shared.error:`);
      return;
    }
    if (!this.clientForm.valid) {return;}
    //AGREGAR WALK IN Y APPOINTMENT
    let dobClient: Date = this.clientForm.value.DOB;
    let dob: string = '';
    if (dobClient.toString() == '') {
      dob = '';
    } else {
      let month = (dobClient.getMonth()+1).toString().padStart(2, '0'); 
      let day = dobClient.getDate().toString().padStart(2, '0');
      dob = dobClient.getUTCFullYear().toString() + '-' + month + '-' + day;
    }
    let phoneNumber = this.clientForm.value.Phone.toString().replace(/[^0-9]/g,'');
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;
    let provName = '';
    let servName = '';
    let prov = this.Providers.filter(x=>x.ProviderId == this.providerId);
    if (prov.length > 0){
      provName = prov[0].Name;
    }

    let serv = this.services.filter(x=>x.ServiceId == this.clientForm.value.ServiceId);
    if (serv.length > 0){
      servName = serv[0].Name;
    }
    
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: (this.providerId != '0' ? this.providerId : this.clientForm.value.ProviderId),
      ServiceId: this.clientForm.value.ServiceId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage(),
      Door: this.doorId,
      Phone: (phoneNumber == '' ?  '00000000000' : (phoneNumber.length <= 10 ? '1' + phoneNumber : phoneNumber)),
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Guests: this.clientForm.value.Guests,
      AppoDate: dateAppo,
      AppoHour: timeAppo,
      CountProv: this.Providers.length-1,
      CountServ: this.services.length,
      ProvName: provName,
      ServName: servName,
      Type: 2
    }
    var spinnerRef = this.spinnerService.start($localize`:@@host.addingappo:`);
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          let walkIndex = this.walkIns.findIndex(x=>x.AppId == res.Appointment.AppId);
          if (walkIndex < 0){
            this.walkIns.push(res.Appointment);
          }
        }
        this.spinnerService.stop(spinnerRef);
        this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:1, Disability:'', ProviderId: '', ServiceId:'', Guests: 1});
        this.showApp = false;
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        if (err.Status == 404){
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.invalidDateTime:`, false, true, false);
        } else {
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        }
        return this.onError;
      })
    );
  }

  showAppointment(){
    this.showApp = !this.showApp;
    if (this.showApp){
      this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:1, Disability:'', ProviderId:'', ServiceId:'', Guests: 1});
    }
  }

  onCancelAddAppointment(){
    this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:1, Disability:'', ProviderId:'', ServiceId:'', Guests: 1});
    this.showApp = false;
  }

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val2 = '2';
    const val1 = '1';
    const val6 = '6';
    const val14 = '14';
    const val99 = '99';
    const val100 = '100';
    const maxVal = this.maxGuests;

    if (component === 'Email'){
      return this.f.Email.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Email.hasError('maxlength') ? $localize`:@@shared.maximun: ${val200}` :
          this.f.Email.hasError('pattern') ? $localize`:@@forgot.emailformat:` :
          '';
    }
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
            '';
    }
    if (component === 'ServiceId'){
      return this.f.ServiceId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
            '';
    }
    if (component === 'ProviderId'){
      return this.f.ProviderId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
            '';
    }
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val6}` :
        this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val14}` :
          '';
    }
    if (component === 'Guests'){
      return this.f.Guests.hasError('required') ? $localize`:@@shared.entervalue:` :
      this.f.Guests.hasError('maxlength') ? $localize`:@@shared.maximun: ${val2}` :
        this.f.Guests.hasError('min') ? $localize`:@@shared.minvalue: ${val1}` :
          this.f.Guests.hasError('max') ? $localize`:@@shared.maxvalue: ${maxVal}` :
            '';
    }
  }

  onCancelApp(appo: any, reasonId: string, index: number, origin: string){
    //CANCELAR APPOINTMENT
    if (reasonId == undefined){
      this.openSnackBar($localize`:@@host.selectreason:`,$localize`:@@host.cancelappodyn:`);
    }
    let formData = {
      Status: 5,
      DateAppo: appo.DateFull,
      Reason: reasonId,
      Guests: appo.Guests,
      CustomerId: appo.ClientId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (origin == 'checkin'){
            this.showCancelOptionsCheck[index] = false;
            this.selectedCheck[index] = undefined;

            var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.preCheckIn.splice(data, 1);}
          }
          if (origin == 'walkin'){
            this.showCancelOptionsWalk[index] = false;
            this.selectedWalk[index] = undefined; 

            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.walkIns.splice(data, 1);}
          }
          if (origin == 'schedule'){
            this.showCancelOptionsSche[index] = false;
            this.selectedSche[index] = undefined; 

            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.schedule.splice(data, 1);}
          }
          if (origin == 'previous'){
            this.showCancelOptionsPrev[index] = false;
            this.selectedPrev[index] = undefined; 
            
            var data = this.previous.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.previous.splice(data, 1);}
          }
          this.openSnackBar($localize`:@@host.cancelsuccess:`, $localize`:@@shared.cancel:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@shared.cancel:`);
        return this.onError;
      })
    );
  }

  onCheckInApp(appo: any){
    //READ QR CODE AND CHECK-IN PROCESS
    if (appo.Type == 1) {
      const dialogRef = new MatDialogConfig();
      dialogRef.width ='450px';
      dialogRef.minWidth = '320px';
      dialogRef.maxWidth = '450px';
      dialogRef.height = '575px';
      dialogRef.data = {guests: appo.Guests, title: $localize`:@@host.checkintitle:`, tipo: 1 };
      const qrDialog = this.dialog.open(VideoDialogComponent, dialogRef);
      let formData;
      this.checkIn$ = qrDialog.afterClosed().pipe(
        map((result: any) => {
          if (result != undefined) {
            this.qrCode = result.qrCode;
            let guestsAppo = result.Guests;
            if (this.qrCode != '' && guestsAppo > 0){
              formData = {
                Status: 3,
                DateAppo: appo.DateFull,
                qrCode: this.qrCode,
                Guests: guestsAppo,
                BusinessId: this.businessId,
                LocationId: this.locationId,
                ProviderId: appo.ProviderId,
                BusinessName: this.authService.businessName(),
                Language: this.authService.businessLanguage()
              }
              this.checkInModule = 1;
            } else {
              throw 'exit process';
            }
          } else {
            throw 'exit process';
          }
          return result;
        }),
        mergeMap(x => 
          this.appointmentService.updateAppointmentCheckIn(appo.AppId, formData).pipe(
            map((res: any) => {
              if (res.Code == 200){
                var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
                if (data >= 0){
                  this.preCheckIn.splice(data, 1);
                }
                
                this.openSnackBar($localize`:@@host.checkinsuccess:`,$localize`:@@host.checkintitle:`);
              }
            }),
            mergeMap(v => 
              //ACTUALIZA NUMERO DE PERSONAS
              this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
                map((res: any) => {
                  if (res != null){
                    this.qtyPeople = +res.Quantity;
                    this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
                    return res.Quantity.toString();
                  }
                })
              )
            ),
            catchError(err => {
              this.checkInModule = 0;
              if (err.Status == 404){
                this.openSnackBar($localize`:@@host.invalidqrcode:`,$localize`:@@host.checkintitle:`);
                return err.Message;
              }
              this.onError = err.Message;
              this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.checkintitle:`);
              return this.onError;
            })
          )
        ), catchError(err => {
          this.checkInModule = 0;
          return err;
        })
      );
    } else {
      this.checkInAppointment('VALID', appo, appo.Guests);
    }
  }

  checkInAppointment(qrCode: string, appo: any, guests: number){
    let formData = {
      Status: 3,
      DateAppo: appo.DateFull,
      qrCode: qrCode,
      Guests: guests,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: appo.ProviderId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.checkInModule = 1;
    this.checkIn$ = this.appointmentService.updateAppointmentCheckIn(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          if (data >= 0){
            this.preCheckIn.splice(data, 1);
          }
          
          this.openSnackBar($localize`:@@host.checkinsuccess:`,$localize`:@@host.checkintitle:`);
        }
      }),
      mergeMap(v => 
        //ACTUALIZA NUMERO DE PERSONAS
        this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = +res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      catchError(err => {
        this.checkInModule = 0;
        if (err.Status == 404){
          this.openSnackBar($localize`:@@host.invalidqrcode:`,$localize`:@@host.checkintitle:`);
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.checkintitle:`);
        return this.onError;
      })
    );
  }

  onMessageApp(appointmentId: string, value: string, i: number, qeue: string){
    //GET MESSAGES APPOINTMENT
    let formData = {
      Message: value,
      BusinessName: this.authService.businessName()
    }
    this.messages$ = this.appointmentService.putMessage(appointmentId, '1', formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            if (qeue == 'schedule'){
              this.showMessageSche[i] = false;
            }
            if (qeue == 'walkin'){
              this.showMessageWalk[i] = false;
            }
            if (qeue == 'checkin'){
              this.showMessageCheck[i] = false;
            }
            if (qeue == 'previous'){
              this.showMessagePrev[i] = false;
            }
            this.openSnackBar($localize`:@@host.messagessend:`,$localize`:@@host.messages:`);
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
          }
        } else {
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
        }
      }),
      catchError(err => {
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onShowMessage(appo: any, i: number, type: string){
    if (appo.Unread == 'H') {
      appo.Unread = '0';
    }
    if (type == 'schedule'){
      this.getCommentsSche[i] = "";
      this.showMessageSche[i] = !this.showMessageSche[i];
    }
    if (type == 'walkin'){
      this.getCommentsWalk[i] = "";
      this.showMessageWalk[i] = !this.showMessageWalk[i]; 
    }
    if (type == 'checkin'){
      this.getCommentsCheck[i] = "";
      this.showMessageCheck[i] = !this.showMessageCheck[i]; 
    }
    if (type == 'previous'){
      this.getCommentsPrev[i] = "";
      this.showMessagePrev[i] = !this.showMessagePrev[i]; 
    }
    this.comments$ = this.appointmentService.getMessages(appo.AppId, 'H').pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (type == 'schedule'){
              this.getCommentsSche[i] = res.Messages;
            }
            if (type == 'walkin'){
              this.getCommentsWalk[i] = res.Messages;
            }
            if (type == 'checkin'){
              this.getCommentsCheck[i] = res.Messages;
            }
            if (type == 'previous'){
              this.getCommentsPrev[i] = res.Messages;
            }
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onReadyCheckIn(appo: any, tipo: number){
    //MOVE TO READY TO CHECK-IN INSTEAD OF DRAG AND DROP
    let formData = {
      Status: 2,
      DateAppo: appo.DateFull,
      CustomerId: appo.ClientId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          let appoObj = res.Appo;
          if (tipo == 0){
            var data = this.previous.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0){
              this.previous.splice(data, 1);
            }
          }
          if (tipo == 1) { 
            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0){
              this.schedule.splice(data, 1);
            }
          }
          if (tipo == 2) {
            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0){
              this.walkIns.splice(data, 1);
            }
          }
          appo.CheckInTime = appoObj['TIMECHEK'];
          appo.ElapsedTime = "0";
          var dataPre = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          if (dataPre < 0){
            this.preCheckIn.push(appo);
          }
          this.openSnackBar($localize`:@@host.readytocheckin:`,$localize`:@@host.textreadytocheckin:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.texttransfer:`);
        return this.onError;
      })
    );
  }

  getTime(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var actualTime = '';
    var a = new Date();
    var hour: number = +actual.substring(0,2);
    var min: number = (+actual.substring(3,5) > 30 ? 0.5 : 0);
    if (+actual.substring(3,5) > 30){
      if (hour+1 > 24){
        hour = 1;
        min = 0;
      } else {
        hour = hour+1;
        min = 0;
      }
    }
    var actTime: number = 0;
    if (this.bucketInterval == 0.5){
      actTime = hour+min;
    } else {
      actTime = hour;
    }
    for (var i=0; i<= this.buckets.length-1; i++){
      if (this.buckets[i].Time == actTime){
        actualTime = this.buckets[i].TimeFormat;
        break;
      }
    }
    return actualTime;
  }

  getActTime(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var actualTime = '';
    var a = new Date();
    var hour: number = +actual.substring(0,2);
    var min: number = (+actual.substring(3,5) > 30 ? 0.5 : 0);

    var actTime: number = 0;
    if (this.bucketInterval == 0.5){
      actTime = hour+min;
    } else {
      actTime = hour;
    }
    for (var i=0; i<= this.buckets.length-1; i++){
      if (this.buckets[i].Time == actTime){
        actualTime = this.buckets[i].TimeFormat;
        break;
      }
    }
    return actualTime;
  }

  getYear(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      year: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      month: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      day: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getPreviousAppos(x: number){
    // let dateAppo = '2020-05-25-10-00';
    if (this.showPrevious == false) {return;}
    let time: string = '';
    if (x % 1 != 0){
      time = (x - (x%1)).toString().padStart(2,'0') + ':30';
    } else {
      time = x.toString().padStart(2, '0') + ':00';
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + time.replace(':','-');
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsPrevious$ = this.appointmentService.getPreviousAppointments(this.businessId, this.locationId, this.providerId, dateAppo, 1).pipe(
      map((res: any) => {
        if (res != null) {
          this.previous = [];
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              // Purpose: item['Purpose'],
              Unread: item['Unread']
            }
            this.previous.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getAppointmentsSche(){
    // let dateAppoStr = '2020-05-25-09-00';
    // let dateAppoFinStr = '2020-05-25-23-00';
    let getHours = this.getTime();
    let getInitHour = this.getActTime();
    let hourIni = '00-00';
    let hourFin = '00-00';
    if (getHours.length > 0) {
      hourIni = getInitHour.replace(':','-');
      hourFin = getHours.replace(':','-');
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsSche$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, dateAppoStr, dateAppoFinStr, 1, 1).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              Type: item['Type'],
              // Purpose: item['Purpose'],
              DateAppo: hora,
              Unread: item['Unread']
            }
            this.schedule.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getAppointmentsWalk(){
    // let dateAppoStr = '2020-05-25-09-00';
    // let dateAppoFinStr = '2020-05-25-23-00';
    let getHours = this.getTime();
    let hourIni = '00-00';
    let hourFin = '00-00';
    if (this.firstHour % 1 != 0){
      hourIni = (this.firstHour - (this.firstHour%1)).toString().padStart(2,'0') + '-30';
    } else {
      hourIni = this.firstHour.toString().padStart(2, '0') + '-00';
    }
    if (getHours.length > 0) {
      hourFin = getHours.replace(':','-');
    } else {
      hourFin = this.currHour.toString().padStart(2,'0') + '-00';
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsWalk$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, dateAppoStr, dateAppoFinStr, 1, 2).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              // Purpose: item['Purpose'],
              Unread: item['Unread']
            }
            this.walkIns.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getAppointmentsPre(){
    // let dateAppoStr = '2020-05-25-09-00';
    // let dateAppoFinStr = '2020-05-25-23-00';
    let getHours = this.getTime();
    let hourIni = '00-00';
    let hourFin = '00-00';
    if (getHours.length > 0) {
      // hourIni = getHours.replace(':','-');
      hourFin = getHours.replace(':','-');
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsPre$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, dateAppoStr, dateAppoFinStr, 2, '_').pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              // Purpose: item['Purpose'],
              Unread: item['Unread'],
              CheckInTime: item['CheckInTime'],
              ElapsedTime: this.calculateTime(item['CheckInTime'])
            }
            this.preCheckIn.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  locationStatusChange(event){
    if (event.checked == false){
      this.closedLocation();
    } else {
      this.openLocation();
    }
  }

  onLocationChange(event){
    let data = this.locations.filter(val => val.LocationId == event.value);
    this.previous = [];
    this.schedule = [];
    this.walkIns = [];
    this.preCheckIn = [];
    this.showPrevious = false;

    if (data.length > 0){
      this.locName = data[0].Name;
      this.doorId = data[0].Door;
      this.manualCheckOut = data[0].ManualCheckOut;
      this.totLocation = data[0].MaxCustomers;
      this.Providers = data[0].Providers;
      this.locName = data[0].Name;
      this.locationStatus = data[0].Open;
      this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
      if (data[0].Providers.length > 0){
        this.Providers = data[0].Providers;
        if (this.Providers.length > 0){
          // this.providerId = this.Providers[0].ProviderId;
          // this.operationText = this.locName + ' / ' + this.Providers[0].Name;
          this.providerId = "0";
          this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`;
        }
        var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocationsdata:`);
        this.getLocInfo$ = this.businessService.getBusinessOpeHours(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res.Code == 200) {
              this.bucketInterval = 1; //parseFloat(res.BucketInterval);
              this.currHour = parseFloat(res.CurrHour);
              let hours = res.Hours;
              this.buckets = [];
              for (var i=0; i<=hours.length-1; i++){
                let horaIni = parseFloat(hours[i].HoraIni);
                let horaFin = parseFloat(hours[i].HoraFin);
                if (i ==0){
                  this.firstHour = horaIni;
                }
                for (var x=horaIni; x<=horaFin; x+=this.bucketInterval){
                  let hora = '';
                  if (x % 1 != 0){
                    hora = (x - (x%1)).toString().padStart(2,'0') + ':30';
                  } else {
                    hora = x.toString().padStart(2, '0') + ':00';
                  }
                  this.buckets.push({ TimeFormat: hora, Time: x });
                  if (x == this.currHour) {
                    if (x-this.bucketInterval>= horaIni){
                      this.prevHour = this.currHour-this.bucketInterval;
                    }
                  }
                }
              }
              this.spinnerService.stop(spinnerRef);
            } else {
              this.spinnerService.stop(spinnerRef);
              return;
            }
          }),
          switchMap(val => this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
            map((res: any) =>{
              this.services = res.services.filter(x => x.Selected === 1);
              return res;
            })
          )),
          switchMap((value: any) => {
            value = this.locationService.getLocationQuantity(this.businessId, this.locationId);
            return value;
          }),
          map((res: any) => {
            this.qtyPeople = +res.Quantity;
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }),
          map(_ => {
            if (this.locationId != '' && this.locationStatus == 1){
              this.getAppointmentsSche();
              this.getAppointmentsWalk();
              this.getAppointmentsPre();
            }
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.onError = err.Message;
            return '0';
          })
        );
      }
    }
  }

  onServiceChange(event){
    let res = this.Providers.filter(val => val.ProviderId == event.value);
    if (res.length > 0){
      this.providerId = res[0].ProviderId;
      this.operationText = this.locName + ' / ' + res[0].Name;
    } else {
      this.providerId = "0";
      this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`;
    }
    this.previous = [];
    this.schedule = [];
    this.walkIns = [];
    this.preCheckIn = [];
    this.showPrevious = false;
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocationsdata:`);
    this.getLocInfo$ = this.businessService.getBusinessOpeHours(this.businessId, this.locationId).pipe(
      map((res: any) => {
        if (res.Code == 200) {
          this.bucketInterval = 1; //parseFloat(res.BucketInterval);
          this.currHour = parseFloat(res.CurrHour);
          let hours = res.Hours;
          this.buckets = [];
          for (var i=0; i<=hours.length-1; i++){
            let horaIni = parseFloat(hours[i].HoraIni);
            let horaFin = parseFloat(hours[i].HoraFin);
            if (i ==0){
              this.firstHour = horaIni;
            }
            for (var x=horaIni; x<=horaFin; x+=this.bucketInterval){
              let hora = '';
              if (x % 1 != 0){
                hora = (x - (x%1)).toString().padStart(2,'0') + ':30';
              } else {
                hora = x.toString().padStart(2, '0') + ':00';
              }
              this.buckets.push({ TimeFormat: hora, Time: x });
              if (x == this.currHour) {
                if (x-this.bucketInterval>= horaIni){
                  this.prevHour = this.currHour-this.bucketInterval;
                }
              }
            }
          }
          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          return;
        }
      }),
      switchMap(val => this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
        map((res: any) =>{
          this.services = res.services.filter(x => x.Selected === 1);
          return res;
        })
      )),
      switchMap((value: any) => {
        value = this.locationService.getLocationQuantity(this.businessId, this.locationId);
        return value;
      }),
      map((res: any) => {
        this.qtyPeople = +res.Quantity;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }),
      map(_ => {
        if (this.locationId != '' && this.locationStatus == 1){
          this.getAppointmentsSche();
          this.getAppointmentsWalk();
          this.getAppointmentsPre();
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );
  }

  onProvChange(event){
    this.getLocInfo$ = this.serviceService.getServicesProvider(this.businessId, event.value).pipe(
      map((res: any) =>{
        this.services = res.services.filter(x => x.Selected === 1);
        return res;
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );
  }

  calculateTime(cardTime: string): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var d = new Date();
    d.setHours(+cardTime.substring(11,13));
    d.setMinutes(+cardTime.substring(14,16));
    
    var a = new Date();
    a.setHours(+actual.substring(0,2));
    a.setMinutes(+actual.substring(3,5));
    
    var diff = (+a - +d); 
    var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
    var diff = (diffHrs*60)+diffMins;
    return diff.toString();
  }

  setDoor(event) {
    this.doorId = event.value;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer != event.container) {
      let appo = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      let container = event.previousContainer.id;
      let formData = {
        Status: 2,
        DateAppo: appo.DateFull,
        CustomerId: appo.ClientId,
        BusinessName: this.authService.businessName(),
        Language: this.authService.businessLanguage()
      }
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, this.preCheckIn.length);
      this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
        map((res: any) => {
          if (res.Code == 200){
            let appoObj = res.Appo;
            var dataPre = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
            if (dataPre >= 0){
              let newData = this.preCheckIn[dataPre];
              newData.CheckInTime = appoObj['TIMECHEK'];
              newData.ElapsedTime = "0";
            }

            this.openSnackBar($localize`:@@host.readytocheckin:`,$localize`:@@host.textreadytocheckin:`);
          }
        }),
        catchError(err => {
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          if (data >= 0){ this.preCheckIn.splice(data, 1); }

          if (container == "cdk-drop-list-0"){ 
            this.schedule.push(JSON.parse(appo));
          } else {
            this.walkIns.push(JSON.parse(appo));
          }

          this.onError = err.Message;
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.texttransfer:`);
          return this.onError;
        })
      );
    }
  }

  onScrollSche(){
    this.getAppointmentsSche();
  }

  onScrollWalk(){
    this.getAppointmentsWalk();
  }

  onScrollPre(){
    this.getAppointmentsPre();
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 26: { 
        message = $localize`:@@learnMore.LMCON26:`;
        break; 
      }
      case 27: { 
        message = $localize`:@@learnMore.LMCON27:`;
        break; 
      }
      case 44: { 
        message = $localize`:@@learnMore.LMCON44:`;
        break; 
      }
      default: { 
        message = ''; 
        break; 
      } 
    } 
    this.openLearnMore(message);
  }
}