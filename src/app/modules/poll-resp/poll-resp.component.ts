import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PollsService } from '@app/services';
import { Observable } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-poll-resp',
  templateUrl: './poll-resp.component.html',
  styleUrls: ['./poll-resp.component.scss']
})
export class PollRespComponent implements OnInit {
  PollId: string = '';
  CustId: string = '';
  Name: string = '';
  LocationId: string = '';
  error: string = '';
  savePoll: boolean = false;

  savePoll$: Observable<any>;
  pollData$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private pollService: PollsService,
    private _snackBar: MatSnackBar,
    private spinnerService: SpinnerService
  ) { }


  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.PollId = this.route.snapshot.paramMap.get('pollId');
    this.CustId = this.route.snapshot.paramMap.get('custId');

    var spinnerRef = this.spinnerService.start("Loading Poll...");
    this.pollData$ = this.pollService.getPoll(this.PollId).pipe(
      map((poll: any) => {
        let actualDate = new Date();
        if (poll.DateFinPoll < actualDate && poll.Status == 1) {
          this.PollId = poll.PollId;
          this.CustId = poll.CustId;
          this.LocationId = poll.LocationId;
          this.Name = poll.Name;
        }
        else {
          this.error = "Poll is not active";          
        }
        this.spinnerService.stop(spinnerRef);
        return '';
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar("Something goes wrong, try again","Error !");
        return err.message;
      })
    );
  }
  
  onSubmit(i: number){
    let formData = {
      PollId: this.PollId,
      CustomerId: this.CustId,
      LocationId: this.LocationId,
      Happy: (i == 1 ? 1 : 0),
      Neutral: (i == 2 ? 1 : 0),
      Angry: (i == 3 ? 1 : 0)
    }
    this.savePoll = false;
    var spinnerRef = this.spinnerService.start("Saving Poll...");
    this.savePoll$ =  this.pollService.postPollUser(formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.savePoll = true
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openSnackBar("Something goes wrong, try again","Error !");
          }
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar("Something goes wrong, try again","Error !");
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar("Something goes wrong, try again","Error !");
        return err.message;
      })
    );
  }
}
